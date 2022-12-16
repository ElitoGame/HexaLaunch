#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use lazy_static::lazy_static;
use std::{env, io::Error, time::Instant};

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
            query_relevant_apps();
            query_other_apps();
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

// fn query_apps() {}

fn query_relevant_apps() {
    //start a timer
    let start = Instant::now();
    // search for apps in the start menu
    query_lnk_dir(
        std::env::var("ProgramData").unwrap() + "\\Microsoft\\Windows\\Start Menu\\Programs",
    );
    query_lnk_dir(
        std::env::var("APPDATA").unwrap() + "\\Microsoft\\Windows\\Start Menu\\Programs\\",
    );
    query_lnk_dir(std::env::var("HOMEPATH").unwrap() + "\\Desktop\\");
    query_lnk_dir(std::env::var("PUBLIC").unwrap() + "\\Desktop\\");

    // query for apps in the registry
    query_registry_key("Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall");
    query_registry_key("Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall");

    // end the timer
    let duration = start.elapsed();
    println!("Time elapsed in query_relevant_apps() is: {:?}", duration);
}

// fn query_current_apps() {}

fn query_other_apps() {
    let start = Instant::now();
    query_folder(std::env::var("ProgramFiles").unwrap().as_str());
    query_folder(std::env::var("ProgramFiles(x86)").unwrap().as_str());
    let duration = start.elapsed();
    println!("Time elapsed in query_other_apps() is: {:?}", duration);
}

/*
____ _  _ ____ ____ _   _    _  _ ____ _    ___  ____ ____ ____
|  | |  | |___ |__/  \_/     |__| |___ |    |__] |___ |__/ [__
|_\| |__| |___ |  \   |      |  | |___ |___ |    |___ |  \ ___]
*/

fn query_lnk_dir(dir: String) {
    for entry in WalkDir::new(dir)
        .follow_links(false)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let f_name = entry.file_name().to_string_lossy();

        if f_name.ends_with(".lnk") {
            let lnk_path = std::path::Path::new(entry.path());
            let lnk = Lnk::try_from(lnk_path).unwrap();
            match lnk.relative_path() {
                Some(path) => {
                    let absolute_path = if path.is_absolute() {
                        path.to_path_buf()
                    } else {
                        env::current_dir().unwrap().join(path)
                    }
                    .clean();
                    if absolute_path.to_string_lossy().ends_with(".exe") {
                        let icon = query_app_icon(absolute_path.to_string_lossy().to_string());
                        if icon.len() > 0 {
                            // println!(
                            //     "{}: {:?} from {}, icon: {}kb",
                            //     f_name.replace(".lnk", ""),
                            //     absolute_path,
                            //     f_name.replace(".lnk", ""),
                            //     (icon.len() / 1000)
                            // );
                        }
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
}

fn query_registry_key(key: &str) {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let uninstall_registry = hklm.open_subkey_with_flags(key, KEY_READ).unwrap();
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
        if !display_icon.to_lowercase().ends_with(".exe") {
            continue;
        }
        if display_icon.contains("ProgramData\\Package Cache") {
            continue;
        }

        // println!("{}: {}", display_name, display_icon);
    }
}

fn query_folder(path: &str) {
    let mut apps: Vec<String> = Vec::new();
    for entry in WalkDir::new(path)
        .follow_links(false)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let f_name = entry.file_name().to_string_lossy();
        let f_path = entry.path().to_string_lossy();
        if f_name.ends_with(".exe") && is_valid(f_path.to_string()) {
            apps.push(entry.path().to_string_lossy().to_string());
        }
    }
    println!("apps in {}: \n{}", path, apps.len());

    // get all folder paths in a given path without recursing
    // let mut folders: Vec<String> = Vec::new();
    // for entry in WalkDir::new(path)
    //     .min_depth(1)
    //     .max_depth(1)
    //     .follow_links(false)
    //     .into_iter()
    //     .filter_map(|e| e.ok())
    // {
    //     if entry.file_type().is_dir() {
    //         folders.push(entry.path().to_string_lossy().to_string());
    //     }
    // }

    // println!("folders {}: \n{}", path, folders.join(",\n"));

    // let futures: Vec<_> = folders
    //     .into_iter()
    //     .map(|folder| async move {
    //         let mut apps: Vec<String> = Vec::new();
    //         for entry in WalkDir::new(folder)
    //             .follow_links(false)
    //             .into_iter()
    //             .filter_map(|e| e.ok())
    //         {
    //             let f_name = entry.file_name().to_string_lossy();
    //             apps.push(f_name.to_string());
    //         }
    //         return apps;
    //     })
    //     .collect();

    // let results: Vec<_> = block_on(join_all(futures));
    // println!("{:?}", results.len());
    // join all the threads
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
    let resources = file
        .resources()
        .expect("Error binary does not have resources");
    for (_name, group) in resources.icons().filter_map(Result::ok) {
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
    return "".to_string();
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
fn is_valid(path: String) -> bool {
    // short for vec of strings to hold patterns to match

    let mut is_valid = true;
    for pattern in PATTERNS.iter() {
        if path.to_lowercase().contains(pattern) {
            is_valid = false;
            break;
        }
    }
    return is_valid;
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
