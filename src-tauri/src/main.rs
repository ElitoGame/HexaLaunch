#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::io::Error;

// use lnk_parser::LNKParser;
use rdev::{listen, Event};
use tauri::{AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu};
use tauri_plugin_autostart::MacosLauncher;
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

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let settings = CustomMenuItem::new("settings".to_string(), "Settings");
    let tray_menu = SystemTrayMenu::new().add_item(quit).add_item(settings);
    let system_tray = SystemTray::new().with_menu(tray_menu);
    tauri::Builder::default()
        .setup(|app| {
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
            get_current_media
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

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
