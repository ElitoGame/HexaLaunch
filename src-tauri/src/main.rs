#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs::{self, File, OpenOptions};
use std::io::{BufReader, Read, Write};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::{env, io::Error, time::Instant};
use tauri::api::path::{resolve_path, BaseDirectory};

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

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let settings = CustomMenuItem::new("settings".to_string(), "Settings");
    let tray_menu = SystemTrayMenu::new().add_item(quit).add_item(settings);
    let system_tray = SystemTray::new().with_menu(tray_menu);
    tauri::Builder::default()
        .setup(|app| {
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
                            let session = manager.GetCurrentSession().unwrap();
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
                        // wait for 200ms
                        std::thread::sleep(std::time::Duration::from_millis(200));
                    }
                });
            }
            Ok(())
        })
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec![]),
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
            print_debug
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

    let session = manager.GetCurrentSession().unwrap();
    session.TrySkipPreviousAsync().unwrap().await.unwrap();
}

#[tauri::command]
// This function returns a Result<(), Box<dyn Error>> to indicate that it may return an error.
async fn next_media() {
    // await the result of the async operation
    let manager = GlobalSystemMediaTransportControlsSessionManager::RequestAsync()
        .unwrap()
        .await
        .unwrap();

    let session = manager.GetCurrentSession().unwrap();
    session.TrySkipNextAsync().unwrap().await.unwrap();
}

#[tauri::command]
async fn get_current_media() -> (String, String, String, bool) {
    let manager = GlobalSystemMediaTransportControlsSessionManager::RequestAsync()
        .unwrap()
        .get()
        .unwrap();

    let session = manager.GetCurrentSession().unwrap();

    return query_current_media(&session);
}

unsafe fn as_mut_bytes(buffer: &IBuffer) -> Result<&mut [u8], Error> {
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
    let other_handle = handle.clone();
    std::thread::spawn(|| {
        futures::executor::block_on(async {
            query_other_apps(other_handle).await;
        })
    });
    let relevant_handle = handle.clone();
    std::thread::spawn(move || {
        query_relevant_apps(relevant_handle);
    });
    std::thread::spawn(move || {
        loop {
            query_current_apps();
            std::thread::sleep(std::time::Duration::from_secs(300)); //every 5 mins
        }
    });
}

fn query_relevant_apps(handle: AppHandle) {
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
        std::env::var("APPDATA").unwrap() + "\\Microsoft\\InternetExplorer\\Quick Launch\\",
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
            app.executable = format!("{} --processStart \"{}\"", app.executable, parent_folder);
            app.icon = "TBA".to_string();
            // println!(
            //     "------Modified: {}: {}, {}",
            //     app.name,
            //     app.executable,
            //     app.icon.len()
            // );
            //TODO get the icon from a .ico file not from a folder
        }
    }

    // get the icons for the apps if they don't have one yet
    for app in &mut apps {
        if app.icon == "" {
            app.icon = query_app_icon(app.executable.clone());
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
                .replace(format!(" --processStart \"{}.exe\"", app.name).as_str(), ""),
        )
        .exists()
    });

    // filter out apps that ain't valid using the valid function
    apps.retain(|app| is_valid(app.name.clone(), true));
    apps.retain(|app| is_valid(app.executable.clone(), true));

    for app in &apps {
        println!(
            "Relevant: {}: {}, {}",
            app.name,
            app.executable,
            app.icon.len()
        );
    }

    // end the timer
    let duration = start.elapsed();
    println!(
        "Time elapsed in query_relevant_apps() is: {:?} for {} apps",
        duration,
        apps.len()
    );
    save_app_data(apps, "appDataRelevant.json".to_string(), handle);
}

fn query_current_apps() {
    //start a timer
    let start = Instant::now();
    // query the currently running apps
    let output = Command::new("powershell.exe")
        .arg("$relevant = @();
        foreach ($file in Get-Process | Where-Object {$_.MainWindowTitle -ne \"\"} | Select-Object -Expand MainModule -ErrorAction SilentlyContinue | Select-Object -Property FileName) {
            $path = ($file | Format-table -HideTableHeaders | Out-String).Trim();
            $name = ((($file | Format-table -HideTableHeaders | Out-String).Trim() -split \"\\.exe\")[0] -split \"\\\\\")[-1];
            if ($path.EndsWith(\".exe\",\"CurrentCultureIgnoreCase\")){
                $relevant += [PSCustomObject]@{name = $name; executable = $path; icon = \"\"};
            }
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
            name: app["name"].to_string(),
            executable: app["executable"].to_string(),
            icon: app["icon"].to_string(),
        });
    }
    // for app in &apps {
    //     println!("Current: {}: {}, {}", app.name, app.executable, app.icon);
    // }

    // end the timer
    let duration = start.elapsed();
    println!(
        "Time elapsed in query_current_apps() is: {:?} for {} apps",
        duration,
        apps.len()
    );
}

async fn query_other_apps(handle: AppHandle) {
    let start = Instant::now();
    let mut apps: Vec<App> = Vec::new();
    apps.append(&mut query_folder(std::env::var("ProgramFiles").unwrap().as_str()).await);
    apps.append(&mut query_folder(std::env::var("ProgramFiles(x86)").unwrap().as_str()).await);
    let duration = start.elapsed();
    println!(
        "Time elapsed in query_other_apps() is: {:?} for {} apps",
        duration,
        apps.len()
    );
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
                        let mut absolute_path = PathBuf::from(dir.clone());
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
                        let icon = query_app_icon(lnk_path.to_str().unwrap().to_string());
                        apps.push(App {
                            name: f_name.replace(".lnk", "").to_string(),
                            executable: absoluter_path,
                            icon,
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
        if f_name.ends_with(".exe")
            && is_valid(f_path.to_string(), false)
            && !f_path.contains("steamapps")
        {
            apps.push(App {
                name: f_name.replace(".exe", "").to_string(), //TODO get the name from the exe's properties
                executable: entry.path().to_string_lossy().to_string(),
                icon: String::from(""),
            });
        }
    }
    // split the apps into chunks of 100
    let chunks: Vec<Vec<App>> = apps.chunks(10).map(|x| x.to_vec()).collect();
    let mut futures: Vec<_> = Vec::new();
    // use the std::thread::spawn to spawn a thread for each chunk.
    for chunk in chunks {
        let chunk = chunk.clone();
        futures.push(std::thread::spawn(|| {
            futures::executor::block_on(async {
                let mut results: Vec<App> = Vec::new();
                for app in chunk {
                    let icon = query_app_icon(app.executable.clone());
                    let mut name = query_app_name(app.executable.clone());
                    if name == "" {
                        name = app.name.clone();
                    }
                    if icon.len() > 0 {
                        results.push(App {
                            name,
                            executable: app.executable,
                            icon,
                        });
                    }
                }
                return results;
            })
        }));
    }
    let mut results: Vec<App> = Vec::new();
    for future in futures {
        let result = future.join().unwrap();
        results.extend(result);
    }

    return results;
}

fn query_epic_games() -> Vec<App> {
    let mut apps: Vec<App> = Vec::new();
    // get the folder path via the registry
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let epic_registry = hklm
        .open_subkey_with_flags(
            "SOFTWARE\\WOW6432Node\\Epic Games\\EpicGamesLauncher",
            KEY_READ,
        )
        .unwrap();
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

fn query_steam_games() -> Vec<App> {
    let mut apps: Vec<App> = Vec::new();
    // get the folder path via the registry
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let steam_registry = hklm
        .open_subkey_with_flags("SOFTWARE\\WOW6432Node\\Valve\\Steam", KEY_READ)
        .unwrap();
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

fn query_app_icon(path: String) -> String {
    // extrect I icon from a given path to a base64 string
    // ExtractAssociatedIconA(hinst, psziconpath, piicon);

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
            for (_name, group) in resource.icons().filter_map(Result::ok) {
                // Write the ICO file
                let mut input = Vec::new();
                group.write(&mut input).unwrap();
                // let mut encoder = zstd::Encoder::new(Vec::new(), 3).unwrap();
                // encoder.write_all(&input).unwrap();
                // let compressed_output = encoder.finish().unwrap();
                let data = base64::encode(&input);
                // println!("{}", data);
                return data;
            }
        }
        Err(_e) => {
            return "".to_string();
        }
    }

    return "".to_string();
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
            if !resource.version_info().is_err() {
                let vi = resource.version_info().unwrap();
                let lang = vi.translation().iter().next();
                if lang.is_some() {
                    vi.strings(lang.unwrap().to_owned(), |key: &str, value: &str| {
                        if key == "ProductName" {
                            name = value.to_string();
                        }
                    });
                }
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
    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .open(app_dir.join(name))
        .unwrap();
    // write the appData to the file as json
    file.write_all(serde_json::to_string(&apps).unwrap().as_bytes())
        .unwrap();
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
