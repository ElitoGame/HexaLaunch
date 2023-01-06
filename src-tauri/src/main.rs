#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs::{self, create_dir_all, File, OpenOptions};
use std::io::{BufReader, Cursor, ErrorKind, Read, Write};
use std::os::windows::process::CommandExt;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::{env, time::Instant};
use tauri::api::path::{resolve_path, BaseDirectory};
use tauri::api::process::CommandEvent;
use tauri::async_runtime::Receiver;

use parselnk::Lnk;
use path_clean::PathClean;
use pelite::{FileMap, PeFile};
use rdev::{listen, Event};
use tauri::{AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu};
use tauri_plugin_autostart::MacosLauncher;
use walkdir::WalkDir;
use windows::{
    core::{InParam, Interface},
    Media::Control::{
        GlobalSystemMediaTransportControlsSession,
        GlobalSystemMediaTransportControlsSessionManager,
        GlobalSystemMediaTransportControlsSessionPlaybackStatus,
    },
    Storage::Streams::{Buffer, IBuffer},
    Win32::System::WinRT::IBufferByteAccess,
};

use winreg::enums::*;
use winreg::RegKey;

use window_vibrancy::apply_blur;

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let settings = CustomMenuItem::new("settings".to_string(), "Settings");
    let tray_menu = SystemTrayMenu::new().add_item(quit).add_item(settings);
    let system_tray = SystemTray::new().with_menu(tray_menu);
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(target_os = "windows")]
            apply_blur(&app.get_window("settings").unwrap(), Some((8, 8, 8, 125)))
                .expect("Unsupported platform! 'apply_blur' is only supported on Windows");
            // for (n, v) in env::vars() {
            //     println!("{}: {}", n, v);
            // }
            {
                let handle = app.handle().clone();
                query_apps(handle);
            }
            {
                let handle = app.handle().clone();
                std::thread::spawn(move || {
                    let callback = move |event: Event| match event.event_type {
                        rdev::EventType::MouseMove { x, y } => {
                            let _res = handle.emit_to("main", "mouse_move", (x, y));
                        }
                        _ => {}
                    };

                    loop {
                        if let Err(error) = listen(callback.clone()) {
                            // without the loop you wouldn't need to clone here.
                            println!("Error: {:?}", error)
                        }
                    }
                });
            }

            // Media Control Events
            let manager = GlobalSystemMediaTransportControlsSessionManager::RequestAsync()
                .unwrap()
                .get()
                .unwrap();
            {
                let handle = app.handle().clone();
                std::thread::spawn(move || {
                    let mut last_title: String = "".to_string();
                    let mut last_play_pause: bool = false;
                    loop {
                        if handle
                            .windows()
                            .iter()
                            .any(|(_k, v)| v.is_visible().unwrap())
                        {
                            match manager.GetCurrentSession() {
                                Ok(session) => {
                                    let title = session
                                        .TryGetMediaPropertiesAsync()
                                        .unwrap()
                                        .get()
                                        .unwrap()
                                        .Title()
                                        .unwrap();
                                    let title = title.to_string();
                                    let play_state = session
                                        .GetPlaybackInfo()
                                        .unwrap()
                                        .PlaybackStatus()
                                        .unwrap()
                                        == GlobalSystemMediaTransportControlsSessionPlaybackStatus::Playing;
                                    if title != last_title || last_play_pause != play_state {
                                        last_title = title.clone();
                                        last_play_pause = play_state;
                                        query_current_media_emitter(handle.clone(), &session);
                                    }
                                }
                                Err(_) => {}
                            }
                        }
                        // wait for 200ms
                        std::thread::sleep(std::time::Duration::from_millis(200));
                    }
                });
            }
            Ok(())
        })
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);
        }))
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "settings" => {
                    let window = app.get_window("settings").unwrap();
                    window.show().unwrap();
                }
                _ => {}
            },
            _ => {}
        })
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                // hide window whenever it loses focus
                api.prevent_close();
                if let Err(error) = event.window().hide() {
                    println!("Error: {:?}", error)
                }
                match event.window().label() {
                    "main" => {
                        // handle::unregister(self, "CommandOrControl+Shift+Space");
                        std::process::exit(0);
                    }
                    "settings" => {
                        if let Err(error) = event.window().hide() {
                            println!("Error: {:?}", error)
                        }
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            toggle_media,
            prev_media,
            next_media,
            get_current_media,
            is_changing_hotkey,
            set_changing_hotkey,
            print_debug,
            is_dev,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/*
 ██████   ██████              █████  ███                 █████████                       █████                       ████
░░██████ ██████              ░░███  ░░░                 ███░░░░░███                     ░░███                       ░░███
 ░███░█████░███   ██████   ███████  ████   ██████      ███     ░░░   ██████  ████████   ███████   ████████   ██████  ░███
 ░███░░███ ░███  ███░░███ ███░░███ ░░███  ░░░░░███    ░███          ███░░███░░███░░███ ░░░███░   ░░███░░███ ███░░███ ░███
 ░███ ░░░  ░███ ░███████ ░███ ░███  ░███   ███████    ░███         ░███ ░███ ░███ ░███   ░███     ░███ ░░░ ░███ ░███ ░███
 ░███      ░███ ░███░░░  ░███ ░███  ░███  ███░░███    ░░███     ███░███ ░███ ░███ ░███   ░███ ███ ░███     ░███ ░███ ░███
 █████     █████░░██████ ░░████████ █████░░████████    ░░█████████ ░░██████  ████ █████  ░░█████  █████    ░░██████  █████
░░░░░     ░░░░░  ░░░░░░   ░░░░░░░░ ░░░░░  ░░░░░░░░      ░░░░░░░░░   ░░░░░░  ░░░░ ░░░░░    ░░░░░  ░░░░░      ░░░░░░  ░░░░░
*/

#[tauri::command]
// This function returns a Result<(), Box<dyn Error>> to indicate that it may return an error.
async fn toggle_media() {
    // await the result of the async operation
    let manager = GlobalSystemMediaTransportControlsSessionManager::RequestAsync()
        .unwrap()
        .await
        .unwrap();

    let session = manager.GetCurrentSession().unwrap();
    session.TryTogglePlayPauseAsync().unwrap().await.unwrap();
}

#[tauri::command]
// This function returns a Result<(), Box<dyn Error>> to indicate that it may return an error.
async fn prev_media() {
    // await the result of the async operation
    let manager = GlobalSystemMediaTransportControlsSessionManager::RequestAsync()
        .unwrap()
        .await
        .unwrap();

    match manager.GetCurrentSession() {
        Ok(session) => {
            session.TrySkipPreviousAsync().unwrap().await.unwrap();
        }
        Err(_) => {}
    }
}

#[tauri::command]
// This function returns a Result<(), Box<dyn Error>> to indicate that it may return an error.
async fn next_media() {
    // await the result of the async operation
    let manager = GlobalSystemMediaTransportControlsSessionManager::RequestAsync()
        .unwrap()
        .await
        .unwrap();

    match manager.GetCurrentSession() {
        Ok(session) => {
            session.TrySkipNextAsync().unwrap().await.unwrap();
        }
        Err(_) => {}
    }
}

#[tauri::command]
async fn get_current_media() -> (String, String, String, bool) {
    let manager = GlobalSystemMediaTransportControlsSessionManager::RequestAsync()
        .unwrap()
        .get()
        .unwrap();

    match manager.GetCurrentSession() {
        Ok(session) => {
            return query_current_media(&session);
        }
        Err(_) => {
            return ("".to_string(), "".to_string(), "".to_string(), false);
        }
    }
}

unsafe fn as_mut_bytes(buffer: &IBuffer) -> Result<&mut [u8], std::io::Error> {
    let interop = buffer.cast::<IBufferByteAccess>()?;
    let data = interop.Buffer()?;
    Ok(std::slice::from_raw_parts_mut(data, buffer.Length()? as _))
}

fn query_current_media(
    session: &GlobalSystemMediaTransportControlsSession,
) -> (String, String, String, bool) {
    let media = session.TryGetMediaPropertiesAsync().unwrap().get().unwrap();
    let title = media.Title().unwrap();
    let artist = media.Artist().unwrap();
    let is_playing = session.GetPlaybackInfo().unwrap().PlaybackStatus().unwrap()
        == GlobalSystemMediaTransportControlsSessionPlaybackStatus::Playing;

    if media.Thumbnail().is_err() {
        return (
            title.to_string(),
            artist.to_string(),
            "None".to_string(),
            is_playing,
        );
    }
    let thumbnail_raw = media.Thumbnail().unwrap();
    let ras = thumbnail_raw.OpenReadAsync().unwrap().get().unwrap();
    // Create a buffer from the size of the IRandomAccessStream
    let size = ras.Size().unwrap() as u32;
    let buffer = Buffer::Create(size).unwrap();
    // Create a IBuffer from the buffer
    let ibuffer = IBuffer::try_from(buffer).unwrap();
    // InParam<'_, IBuffer>
    let param = InParam::owned(ibuffer);

    let res = ras
        .ReadAsync(
            param,
            size,
            windows::Storage::Streams::InputStreamOptions::None,
        )
        .unwrap()
        .get()
        .unwrap();

    let thumbnail: String;
    unsafe {
        let data = as_mut_bytes(&res).unwrap();
        thumbnail = base64::encode(data);
    }
    return (title.to_string(), artist.to_string(), thumbnail, is_playing);
}

fn query_current_media_emitter(
    handle: AppHandle,
    session: &GlobalSystemMediaTransportControlsSession,
) {
    let _res = handle.emit_all("mediaChanged", query_current_media(session));
}

/*
   █████████                          ██████████              █████
  ███░░░░░███                        ░░███░░░░███            ░░███
 ░███    ░███  ████████  ████████     ░███   ░░███  ██████   ███████    ██████
 ░███████████ ░░███░░███░░███░░███    ░███    ░███ ░░░░░███ ░░░███░    ░░░░░███
 ░███░░░░░███  ░███ ░███ ░███ ░███    ░███    ░███  ███████   ░███      ███████
 ░███    ░███  ░███ ░███ ░███ ░███    ░███    ███  ███░░███   ░███ ███ ███░░███
 █████   █████ ░███████  ░███████     ██████████  ░░████████  ░░█████ ░░████████
░░░░░   ░░░░░  ░███░░░   ░███░░░     ░░░░░░░░░░    ░░░░░░░░    ░░░░░   ░░░░░░░░
               ░███      ░███
               █████     █████
              ░░░░░     ░░░░░
*/
// APPDATA: C:\Users\ElitoGame\AppData\Roaming - APPDATA
// ProgramData: C:\ProgramData - ALLUSERSPROFILE
// ProgramFiles: C:\Program Files - ProgramFiles
// ProgramFiles(x86): C:\Program Files (x86) - ProgramFiles(x86)
// PUBLIC: C:\Users\Public - PUBLIC
// HOMEPATH: \Users\ElitoGame - HOMEPATH

fn query_apps(handle: AppHandle) {
    // read the user-settings.json file and check if autoQueryApps is true
    // if it is or if the file doesn't even exist, then query the apps
    let mut auto_query_apps = true;
    let app_dir = resolve_path(
        &handle.config(),
        handle.package_info(),
        &handle.env(),
        "",
        Some(BaseDirectory::AppData),
    )
    .unwrap_or_default();
    let _file = match File::open(app_dir.join("user-settings.json")) {
        Ok(file) => {
            // file exists
            let reader = BufReader::new(file);
            let json: Value = serde_json::from_reader(reader).unwrap();
            if json["autoQueryApps"] == false {
                auto_query_apps = false;
            }
        }
        Err(_) => {}
    };
    if auto_query_apps {
        let other_handle = handle.clone();
        std::thread::spawn(|| {
            futures::executor::block_on(async {
                query_other_apps(other_handle).await;
            })
        });
        let relevant_handle = handle.clone();
        std::thread::spawn(move || {
            futures::executor::block_on(async {
                query_relevant_apps(relevant_handle).await;
            })
        });
        let current_handle = handle.clone();
        std::thread::spawn(move || {
            loop {
                let _ = query_current_apps(current_handle.clone());
                std::thread::sleep(std::time::Duration::from_secs(300)); //every 5 mins
            }
        });
    }
}

async fn query_relevant_apps(handle: AppHandle) {
    //start a timer
    let start = Instant::now();
    let mut apps: Vec<App> = Vec::new();
    // search for apps in the start menu
    apps.append(&mut query_lnk_dir(
        std::env::var("ProgramData").unwrap() + "\\Microsoft\\Windows\\Start Menu\\Programs",
    ));
    apps.append(&mut query_lnk_dir(
        std::env::var("APPDATA").unwrap() + "\\Microsoft\\Windows\\Start Menu\\Programs\\",
    ));
    apps.append(&mut query_lnk_dir(
        std::env::var("APPDATA").unwrap() + "\\Microsoft\\Internet Explorer\\Quick Launch\\",
    ));
    apps.append(&mut query_lnk_dir(
        std::env::var("HOMEPATH").unwrap() + "\\Desktop\\",
    ));
    apps.append(&mut query_lnk_dir(
        std::env::var("PUBLIC").unwrap() + "\\Desktop\\",
    ));

    // query for apps in the registry
    apps.append(&mut query_registry_key(
        RegKey::predef(HKEY_LOCAL_MACHINE),
        "Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall",
    ));
    apps.append(&mut query_registry_key(
        RegKey::predef(HKEY_LOCAL_MACHINE),
        "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall",
    ));
    apps.append(&mut query_registry_key(
        RegKey::predef(HKEY_CURRENT_USER),
        "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall",
    ));

    apps.append(&mut query_epic_games());
    apps.append(&mut query_steam_games());

    // get the icons for the apps if they don't have one yet
    apps = query_app_icons(apps).await;

    // apply a special mapping for the apps whose executable is called "Update.exe"
    // In this case the name comes from the parent folder
    // The executable is expanded by --processStart "parent_folder_name.exe"
    // The icon is acquired from the parent folder "app.ico", read and converted to base64
    for app in &mut apps {
        if app.executable.ends_with("\\Update.exe") {
            let mut path = PathBuf::from(&app.executable);
            path.pop();
            let parent_folder = path.file_name().unwrap().to_str().unwrap();
            app.name = parent_folder.to_string();
            app.executable = format!("{} --processStart '{}.exe'", app.executable, parent_folder);
            app.icon = "".to_string();
            let iconpath = path.ancestors().nth(0).unwrap().join("app.ico");
            //TODO get the icon from a .ico file not from a folder
            if iconpath.exists() {
                let icon = image::open(iconpath).unwrap();
                let mut buf: Vec<u8> = Vec::new();
                icon.write_to(&mut Cursor::new(&mut buf), image::ImageOutputFormat::Png)
                    .unwrap();
                app.icon = "data:image/png;base64,".to_string() + base64::encode(&buf).as_str();
            }
        }
    }

    // filter out the apps that don't have an icon
    apps.retain(|app| app.icon != "");

    // filter out duplicates in execution paths
    apps.sort_by(|a, b| {
        a.executable
            .trim()
            .to_lowercase()
            .cmp(&b.executable.trim().to_lowercase())
    });
    apps.dedup_by(|a, b| a.executable.trim().to_lowercase() == b.executable.trim().to_lowercase());

    // sort the apps by name
    apps.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    // filter out apps that contain the string "{"
    apps.retain(|app| !app.name.contains("{"));

    // filter out apps whose executable path actually doesn't exist
    apps.retain(|app| {
        std::path::Path::new(
            &app.executable
                .replace(format!(" --processStart '{}.exe'", app.name).as_str(), ""),
        )
        .exists()
    });

    // filter out apps that ain't valid using the valid function
    apps.retain(|app| is_valid(app.name.clone(), true));
    apps.retain(|app| is_valid(app.executable.clone(), true));

    // for app in &apps {
    //     println!(
    //         "Relevant: {}: {}, {}",
    //         app.name,
    //         app.executable,
    //         app.icon.len()
    //     );
    // }

    // end the timer
    let duration = start.elapsed();
    println!(
        "Time elapsed in query_relevant_apps() is: {:?} for {} apps",
        duration,
        apps.len()
    );
    let _ = handle.emit_all("finish_query_relevant", &apps);
    save_app_data(apps, "appDataRelevant.json".to_string(), handle);
}

fn query_current_apps(handle: AppHandle) {
    //start a timer
    let start = Instant::now();
    // query the currently running apps
    let output = Command::new("powershell.exe").creation_flags(0x08000000).arg("-WindowStyle").arg("Hidden").arg("-Command")
        .arg("$relevant = @();
        [void] [System.Reflection.Assembly]::LoadWithPartialName('System.Drawing');
        foreach ($file in Get-Process | Where-Object {$_.MainWindowTitle -ne \"\"} | Select-Object -Expand MainModule -ErrorAction SilentlyContinue | Select-Object -Property FileName) {
            try {
                $path = ($file | Format-table -HideTableHeaders | Out-String).Trim();
                $name = ((($file | Format-table -HideTableHeaders | Out-String).Trim() -split \"\\.exe\")[0] -split \"\\\\\")[-1];
                $icon = [System.Drawing.Icon]::ExtractAssociatedIcon($path)
                $memoryStream = New-Object System.IO.MemoryStream
                $icon.ToBitmap().Save($memoryStream, 'Png')
                $base64String = [Convert]::ToBase64String($memoryStream.ToArray())
                if ($path.EndsWith(\".exe\",\"CurrentCultureIgnoreCase\")){
                    $relevant += [PSCustomObject]@{name = $name; executable = $path; icon = $base64String};
                }
            } catch {}
        }
        $relevant | Select-Object -Property name, executable, icon | ConvertTo-Json -Compress;")
        .output()
        .expect("failed to execute process");
    let json: Value =
        serde_json::from_str(String::from_utf8_lossy(&output.stdout).to_string().as_str()).unwrap();
    // convert the json to a vector of apps
    let mut apps: Vec<App> = Vec::new();
    for app in json.as_array().unwrap() {
        apps.push(App {
            name: app["name"].to_string().replace("\"", ""),
            executable: app["executable"].to_string().replace("\"", ""),
            icon: app["icon"].to_string().replace("\"", ""),
        });
    }

    // Until I find a more reliable solution, remove the apps that are in the WindowsApps folder as this folder is not accessible by the user
    // Also filter out SystemApps, as those are unlikely relevant. (I think)
    apps.retain(|app| {
        !app.executable.contains("WindowsApps")
            && !app.executable.contains("SystemApps")
            && !app.executable.to_lowercase().contains("system32")
    });
    // for app in &mut apps {
    //     // Apps inside the WindowsApps folder need to be modified to be able to launch them
    //     if app.executable.contains("WindowsApps") {
    //         // Turn paths like "C:\\Program Files\\WindowsApps\\SpotifyAB.SpotifyMusic_1.200.1165.0_x86__zpdnekdrzrea0\\Spotify.exe"
    //         // into "shell:appsFolder\SpotifyAB.SpotifyMusic_zpdnekdrzrea0!Spotify"
    //         let path = PathBuf::from(&app.executable);
    //         let name = path
    //             .file_name()
    //             .unwrap()
    //             .to_str()
    //             .unwrap()
    //             .split(".")
    //             .collect::<Vec<&str>>()[0]
    //             .to_string();
    //         let parent_folder = path.parent().unwrap().to_str().unwrap().to_string();

    //         // Get the path after WindowsApps
    //         let mut dir = parent_folder.split("WindowsApps").collect::<Vec<&str>>()[1].to_string();
    //         // Replace any version string between this regex "_.*?_.*?_" with ""
    //         let re = Regex::new("_.*?_.*?_").unwrap();
    //         dir = re.replace(dir.as_str(), "").to_string();
    //         // remove the leading backslash
    //         dir = dir[2..].to_string();

    //         let launch_path = r"shell:appsFolder\".to_string() + dir.as_str() + "!" + &name;
    //         app.executable = launch_path;
    //     }
    // }

    // end the timer
    let duration = start.elapsed();
    println!(
        "Time elapsed in query_current_apps() is: {:?} for {} apps",
        duration,
        apps.len()
    );
    // get the appDataRunning.json file from the Appdata folder if it exists
    let app_dir = resolve_path(
        &handle.config(),
        handle.package_info(),
        &handle.env(),
        "",
        Some(BaseDirectory::AppData),
    )
    .unwrap_or_default();

    let app_data_running = app_dir.join("appDataRunning.json");

    if app_data_running.clone().exists() {
        let mut file = File::open(app_data_running.clone()).unwrap();
        let mut contents = String::new();
        file.read_to_string(&mut contents).unwrap();
        let json: Value = serde_json::from_str(contents.as_str()).unwrap();
        for app in json.as_array().unwrap() {
            apps.push(App {
                name: app["name"].to_string().replace(r"\\\\", r"\\"),
                executable: app["executable"]
                    .to_string()
                    .to_string()
                    .replace(r"\\\\", r"\\"),
                icon: app["icon"].to_string().to_string().replace(r"\\\\", r"\\"),
            });
        }
    }

    // filter out duplicate executables
    apps.dedup_by(|a, b| a.executable == b.executable);

    // filter out apps that don't exist anymore
    apps.retain(|app| !Path::new(&app.executable).exists());

    match File::create(app_data_running.clone()) {
        Ok(mut file) => {
            // save the appDataRunning.json file
            file.write_all(serde_json::to_string(&apps).unwrap().as_bytes())
                .unwrap();
        }
        Err(_e) => {
            // create the appData folder if it doesn't exist
            let app_data_dir = app_dir.parent().unwrap();
            if !app_data_dir.exists() {
                std::fs::create_dir(app_data_dir).unwrap();
            }
            // create the appDataRunning.json file
            let mut file = File::create(app_data_running).unwrap();
            // save the appDataRunning.json file
            file.write_all(serde_json::to_string(&apps).unwrap().as_bytes())
                .unwrap();
        }
    }

    let _ = handle.emit_all("finish_query_current", &apps);
}

async fn query_other_apps(handle: AppHandle) {
    let start = Instant::now();
    let mut apps: Vec<App> = Vec::new();
    apps.append(&mut query_folder(std::env::var("ProgramFiles").unwrap().as_str()).await);
    apps.append(&mut query_folder(std::env::var("ProgramFiles(x86)").unwrap().as_str()).await);
    apps = query_app_icons(apps).await;
    let duration = start.elapsed();
    println!(
        "Time elapsed in query_other_apps() is: {:?} for {} apps",
        duration,
        apps.len()
    );
    let _ = handle.emit_all("finish_query_other", &apps);
    save_app_data(apps, "appData.json".to_string(), handle);
}

/*
____ _  _ ____ ____ _   _    _  _ ____ _    ___  ____ ____ ____
|  | |  | |___ |__/  \_/     |__| |___ |    |__] |___ |__/ [__
|_\| |__| |___ |  \   |      |  | |___ |___ |    |___ |  \ ___]
*/

fn query_lnk_dir(dir: String) -> Vec<App> {
    let mut apps: Vec<App> = Vec::new();
    for entry in WalkDir::new(dir.clone().to_string())
        .follow_links(false)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let f_name = entry.file_name().to_string_lossy();

        if f_name.ends_with(".lnk") {
            // println!("a lnk: {}", f_name);
            let lnk_path = std::path::Path::new(entry.path());
            let lnk = Lnk::try_from(lnk_path).unwrap();
            match lnk.relative_path() {
                Some(path) => {
                    let absolute_path = if path.is_absolute() {
                        path.to_path_buf()
                    } else {
                        let mut absolute_path = PathBuf::from(lnk_path.ancestors().nth(1).unwrap());
                        absolute_path.push(path);
                        absolute_path
                    }
                    .clean();
                    if absolute_path.to_string_lossy().ends_with(".exe")
                        && !absolute_path.to_string_lossy().contains("steamapps")
                    {
                        let path = Path::new(absolute_path.to_str().unwrap());
                        let absoluter_path_res = fs::canonicalize(path);
                        if absoluter_path_res.is_err() {
                            continue;
                        }
                        let absoluter_path = absoluter_path_res
                            .unwrap()
                            .to_string_lossy()
                            .to_string()
                            .replace(r"\\?\", "");

                        // get the icon from the link
                        // let icon = query_app_icon(lnk_path.to_str().unwrap().to_string());
                        apps.push(App {
                            name: f_name.replace(".lnk", "").to_string(),
                            executable: absoluter_path,
                            icon: "".to_string(),
                        });
                    }

                    // if the absolute path fails or doesn't end with .exe, ignore it.
                    // Use the absolute path to get the icon if it exists.
                    // the launcher uses the lnk path and lnk name.
                }
                None => {
                    // println!("lnk: {:?} from {}", "no path", f_name.replace(".lnk", ""))
                }
            }
        }
    }
    println!("Found {} lnk files in the directory {}", apps.len(), dir);
    return apps;
}

fn query_registry_key(reg_key: RegKey, key: &str) -> Vec<App> {
    let mut apps: Vec<App> = Vec::new();
    let uninstall_registry = reg_key.open_subkey_with_flags(key, KEY_READ).unwrap();
    // println!("==================");
    // println!(
    //     "Found {} subkeys in {}",
    //     uninstall_registry.enum_keys().count(),
    //     key
    // );
    for subkey_name in uninstall_registry.enum_keys().map(|x| x.unwrap()) {
        // Open each subkey
        let subkey = uninstall_registry.open_subkey(&subkey_name).unwrap();

        // Get the display name of the installed program
        let display_name: String = subkey
            .get_value("DisplayName")
            .unwrap_or_else(|_| "".to_string());
        if display_name == "" {
            continue;
        }
        let mut display_icon: String = subkey
            .get_value("DisplayIcon")
            .unwrap_or_else(|_| "".to_string());
        if display_icon == "" {
            continue;
        }
        if display_icon.ends_with(",0") {
            display_icon = display_icon.replace(",0", "");
        }
        // println!("{}: {}", display_name, display_icon);
        if !display_icon.to_lowercase().ends_with(".exe")
            || display_icon.to_lowercase().contains("steamapps")
            || display_icon.contains("ProgramData\\Package Cache")
        {
            continue;
        }
        apps.push(App {
            name: display_name,
            executable: display_icon,
            icon: String::from(""),
        });
        // println!("{}: {}", display_name, display_icon);
    }
    return apps;
}

async fn query_folder(path: &str) -> Vec<App> {
    let mut apps: Vec<App> = Vec::new();
    for entry in WalkDir::new(path)
        .follow_links(false)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let f_name = entry.file_name().to_string_lossy();
        let f_path = entry.path().to_string_lossy();
        if f_name.to_lowercase().ends_with(".exe")
            && is_valid(f_path.to_string(), false)
            && !f_path.contains("steamapps")
        {
            apps.push(App {
                name: query_app_name(f_path.to_string()), //f_name.replace(".exe", "").to_string(), //TODO get the name from the exe's properties
                executable: entry.path().to_string_lossy().to_string(),
                icon: String::from(""),
            });
        }
    }

    return apps;
}

fn query_epic_games() -> Vec<App> {
    let mut apps: Vec<App> = Vec::new();
    // get the folder path via the registry
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    match hklm.open_subkey_with_flags(
        "SOFTWARE\\WOW6432Node\\Epic Games\\EpicGamesLauncher",
        KEY_READ,
    ) {
        Ok(epic_registry) => {
            let mut epic_path: String = epic_registry.get_value("AppDataPath").unwrap();
            epic_path.push_str("\\Manifests");
            // check if the folder exists and if it does, query it
            if Path::new(&epic_path).exists() {
                // read the files in the folder
                for entry in WalkDir::new(epic_path)
                    .follow_links(false)
                    .min_depth(1)
                    .max_depth(1)
                    .into_iter()
                    .filter_map(|e| e.ok())
                {
                    let f_name = entry.file_name().to_string_lossy();
                    if f_name.ends_with(".item") {
                        // open the file and parse it to JSON then extract the InstallLocation and LaunchExecutable
                        let file = File::open(entry.path()).unwrap();
                        let reader = BufReader::new(file);
                        let json: Value = serde_json::from_reader(reader).unwrap();
                        let install_location = json["InstallLocation"].as_str().unwrap();
                        let launch_executable = json["LaunchExecutable"].as_str().unwrap();
                        let name = json["DisplayName"].as_str().unwrap().to_string();
                        let app_path = install_location.to_string() + "\\" + launch_executable;
                        apps.push(App {
                            name,
                            executable: app_path,
                            icon: String::from(""),
                        });
                    }
                }
            }
            return apps;
        }
        Err(_) => {
            return apps;
        }
    }
}

fn query_steam_games() -> Vec<App> {
    let mut apps: Vec<App> = Vec::new();
    // get the folder path via the registry
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    match hklm.open_subkey_with_flags("SOFTWARE\\WOW6432Node\\Valve\\Steam", KEY_READ) {
        Ok(steam_registry) => {
            let mut steam_path: String = steam_registry.get_value("InstallPath").unwrap();
            steam_path.push_str("\\steamapps\\libraryfolders.vdf");
            // check if the folder exists and if it does, query it
            if Path::new(&steam_path).exists() {
                // read the files in the folder
                // let mut apps: Vec<String> = Vec::new();

                // read the file, convert the .acf formt to json format and parse it to JSON then extract the appid and name
                let file = File::open(steam_path.clone()).unwrap();
                let mut reader = BufReader::new(file);
                let mut data = String::new();
                // parse the BufferReader to a String
                let _res = reader.read_to_string(&mut data);
                let json = acf_to_json(&data).unwrap_or_default();

                // get the keys of the json object
                let keys = json.as_object().unwrap().keys();
                // library paths array
                let mut library_paths: Vec<String> = Vec::new();
                // iterate over the keys and get the values
                for key in keys {
                    let value = json.get(key).unwrap().get("path").unwrap();
                    library_paths.push(value.to_string());
                }

                // iterate over the library paths and get the .acf files in the //steamapps folder
                for path in library_paths {
                    let mut steamapps_path = path.clone().replace("\"", "");
                    steamapps_path += "\\steamapps";
                    for entry in WalkDir::new(&steamapps_path)
                        .follow_links(false)
                        .min_depth(1)
                        .max_depth(1)
                        .into_iter()
                        .filter_map(|e| e.ok())
                    {
                        if entry.file_name().to_string_lossy().ends_with(".acf") {
                            // open the file and parse it to JSON then extract the InstallLocation and LaunchExecutable
                            let file = File::open(entry.path()).unwrap();
                            let mut reader = BufReader::new(file);
                            let mut data = String::new();
                            // parse the BufferReader to a String
                            let _res = reader.read_to_string(&mut data);
                            let json = acf_to_json(&data).unwrap_or_default();
                            let appid = json.get("appid").unwrap().as_str().unwrap();
                            let name = json.get("name").unwrap().as_str().unwrap().to_string();
                            // let app_path = path.to_string();
                            apps.push(App {
                                name,
                                executable: appid.to_string(),
                                icon: String::from(""),
                            });
                        }
                    }
                }
                // println!("apps in {}: \n{}", steam_path, json.to_string());
            }
            return apps;
        }
        Err(_) => {
            return apps;
        }
    }
}

async fn query_app_icons(apps: Vec<App>) -> Vec<App> {
    let mut final_apps: Vec<App> = Vec::new();
    let app_copy = apps.clone();

    let args = apps
        .iter()
        .map(|x| x.executable.clone())
        .collect::<Vec<String>>();

    // split the args into chunks of 150 to avoid the command line length limit
    let mut args_chunks: Vec<Vec<String>> = Vec::new();
    let mut i = 0;
    let mut chunk: Vec<String> = Vec::new();
    for arg in args {
        if i == 150 {
            args_chunks.push(chunk);
            chunk = Vec::new();
            i = 0;
        }
        chunk.push(arg);
        i += 1;
    }
    args_chunks.push(chunk);

    // spawn the sidecar command for each chunk
    for args in args_chunks {
        let mut rx = spawn_sidecar_command(args);
        // read events such as stdout
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line) = event {
                // split it via "?", the first part is the exe, the second part is the base64 encoded icon
                let mut line = line.split("?");
                let exe = line.next().unwrap();
                let icon = line.next().unwrap();
                if exe == "" || icon == "" {
                    continue;
                }
                // find the app with the exe
                let mut app = app_copy
                    .iter()
                    .find(|x| x.executable == exe)
                    .unwrap()
                    .clone();
                app.icon = "data:image/png;base64,".to_string() + icon;
                let _ = &final_apps.push(app);
            }
        }
    }

    return final_apps;
}

fn spawn_sidecar_command(args: Vec<String>) -> Receiver<CommandEvent> {
    let (rx, _child) = tauri::api::process::Command::new_sidecar("CSharpIntegration")
        .unwrap()
        .args(args)
        .spawn()
        .unwrap();
    return rx;
}

fn query_app_name(path: String) -> String {
    let map_res = FileMap::open(&path);
    if map_res.is_err() {
        return "".to_string();
    }
    let map = map_res.unwrap();
    let file_res = PeFile::from_bytes(&map);
    if file_res.is_err() {
        return "".to_string();
    }
    let file = file_res.unwrap();
    // let dest = PathBuf::from(path);
    let resources = file.resources();
    match resources {
        Ok(resource) => {
            let mut name = String::new();
            let mut file_description = String::new();
            if !resource.version_info().is_err() {
                let vi = resource.version_info().unwrap();
                let lang = vi.translation().iter().next();
                if lang.is_some() {
                    vi.strings(lang.unwrap().to_owned(), |key: &str, value: &str| {
                        if key == "ProductName" {
                            name = value.to_string();
                        }
                        if key == "FileDescription" {
                            file_description = value.to_string();
                        }
                    });
                }
            }
            if name == "" || name == "Microsoft Office" {
                name = file_description;
            }
            return name;
        }
        Err(_e) => {
            return "".to_string();
        }
    }
}

lazy_static! {
    static ref PATTERNS: Vec<String> = vec![
        "install".to_string(),
        "setup".to_string(),
        "unins".to_string(),
        "remove".to_string(),
        "update".to_string(),
        "reapair".to_string(),
        "upgrade".to_string(),
        "patch".to_string(),
        "helper".to_string(),
        "verif".to_string(),
        "crash".to_string(),
        "bug".to_string(),
    ];
}
fn is_valid(path: String, ignore_update: bool) -> bool {
    // short for vec of strings to hold patterns to match
    // if ignoreUpdate is true, then ignore the update pattern
    let mut adjusted_pattern = PATTERNS.clone();
    if ignore_update {
        let _ = &adjusted_pattern
            .iter()
            .position(|x| x == "update")
            .map(|i| adjusted_pattern.remove(i));
    }
    let mut is_valid = true;
    for pattern in adjusted_pattern.iter() {
        if path.to_lowercase().contains(pattern) {
            is_valid = false;
            break;
        }
    }
    return is_valid;
}

fn acf_to_json(acf_content: &str) -> Result<serde_json::Value, serde_json::error::Error> {
    if acf_content.is_empty() {
        return Ok(serde_json::Value::Null);
    }

    let lines = acf_content.split('\n').collect::<Vec<&str>>();
    if lines.is_empty() {
        return Ok(serde_json::Value::Null);
    }

    let json = lines[1..]
        .iter()
        .enumerate()
        .map(|(c, &x)| {
            if x.trim().is_empty() {
                return "".to_string();
            }

            if x.trim().contains("\t\t") {
                let mut result = x.trim().replace("\t\t", ":");
                if ['{', '}'].contains(&lines.get(c + 2).unwrap().trim().chars().next().unwrap()) {
                    return result;
                } else {
                    result.push_str(",");
                }
                return result;
            } else {
                let mut result = x.trim().to_string();
                if x.split('"').count() > 1 {
                    result += ":";
                } else {
                    if x.trim() == "{"
                        || lines.get(c + 2).is_none()
                        || ['{', '}'].contains(
                            &lines
                                .get(c + 2)
                                .unwrap_or_else(|| &"{")
                                .trim()
                                .chars()
                                .next()
                                .unwrap_or_else(|| '{'),
                        )
                    {
                        return result;
                    } else {
                        result.push_str(",");
                    }
                }
                return result;
            }
        })
        .collect::<String>();

    let json = json.replace("\n", "");
    serde_json::from_str(&json)
}

// Save the appData to a .json file
fn save_app_data(apps: Vec<App>, name: String, handle: AppHandle) {
    // get the app's directory
    let app_dir = resolve_path(
        &handle.config(),
        handle.package_info(),
        &handle.env(),
        "",
        Some(BaseDirectory::AppData),
    )
    .unwrap_or_default();
    // in the app's directory, create a new file if it doesn't exist else open it
    println!(
        "Saving {} apps to {}\\{}",
        apps.len(),
        app_dir.as_os_str().to_str().unwrap(),
        name
    );
    match OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .open(app_dir.join(name.clone()))
    {
        Ok(mut file) => {
            // write the appData to the file as json
            file.write_all(serde_json::to_string(&apps).unwrap().as_bytes())
                .unwrap();
        }
        Err(e) => {
            // create the directory if it doesn't exist
            if e.kind() == ErrorKind::NotFound {
                create_dir_all(app_dir).unwrap();
                save_app_data(apps, name, handle);
            } else {
                println!("Error saving app data: {}", e);
            }
        }
    }
}

/*
____ ___  ___     ____ ___ ____ _  _ ____ ___
|__| |__] |__]    [__   |  |__/ |  | |     |
|  | |    |       ___]  |  |  \ |__| |___  |
*/
#[derive(Debug, Clone, Serialize, Deserialize)]
struct App {
    executable: String,
    name: String,
    icon: String,
}

/*
 █████   ███   █████  ███                 █████                               █████████
░░███   ░███  ░░███  ░░░                 ░░███                               ███░░░░░███
 ░███   ░███   ░███  ████  ████████    ███████   ██████  █████ ███ █████    ███     ░░░   ██████  █████████████
 ░███   ░███   ░███ ░░███ ░░███░░███  ███░░███  ███░░███░░███ ░███░░███    ░███          ███░░███░░███░░███░░███
 ░░███  █████  ███   ░███  ░███ ░███ ░███ ░███ ░███ ░███ ░███ ░███ ░███    ░███         ░███ ░███ ░███ ░███ ░███
  ░░░█████░█████░    ░███  ░███ ░███ ░███ ░███ ░███ ░███ ░░███████████     ░░███     ███░███ ░███ ░███ ░███ ░███
    ░░███ ░░███      █████ ████ █████░░████████░░██████   ░░████░████       ░░█████████ ░░██████  █████░███ █████
     ░░░   ░░░      ░░░░░ ░░░░ ░░░░░  ░░░░░░░░  ░░░░░░     ░░░░ ░░░░         ░░░░░░░░░   ░░░░░░  ░░░░░ ░░░ ░░░░░
*/
// global variables
static mut IS_CHANGING_HOTKEY: bool = false;

#[tauri::command]
fn is_changing_hotkey() -> bool {
    unsafe { return IS_CHANGING_HOTKEY }
}

#[tauri::command]
fn set_changing_hotkey(changing: bool) {
    unsafe {
        IS_CHANGING_HOTKEY = changing;
    }
}

#[tauri::command]
fn print_debug() {
    println!("debug!");
}

#[tauri::command]
fn is_dev() -> bool {
    cfg!(debug_assertions)
}
