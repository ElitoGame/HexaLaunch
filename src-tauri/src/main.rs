#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::io::Error;

// use lnk_parser::LNKParser;
use rdev::{listen, Event};
use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu};
use tauri_plugin_autostart::MacosLauncher;
use windows::{
    core::{InParam, Interface},
    Media::Control::GlobalSystemMediaTransportControlsSessionManager,
    Storage::Streams::{
        Buffer, IBuffer, IInputStream, IRandomAccessStream, IRandomAccessStreamReference,
    },
    Win32::System::WinRT::IBufferByteAccess,
};

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let settings = CustomMenuItem::new("settings".to_string(), "Settings");
    let tray_menu = SystemTrayMenu::new().add_item(quit).add_item(settings);
    let system_tray = SystemTray::new().with_menu(tray_menu);
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
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
async fn get_current_media() -> (String, String) {
    let manager = GlobalSystemMediaTransportControlsSessionManager::RequestAsync()
        .unwrap()
        .await
        .unwrap();

    let session = manager.GetCurrentSession().unwrap();

    // register callback
    let media = session.TryGetMediaPropertiesAsync().unwrap().await.unwrap();
    let title = media.Title().unwrap();
    let artist = media.Artist().unwrap();

    let thumbnail_raw = media.Thumbnail().unwrap();
    // convert to a IInputStream
    let thumbnail = thumbnail_raw.OpenReadAsync().unwrap().GetResults().unwrap();
    IInputStream::try_from(thumbnail).unwrap();

    // let ras_async = thumbnail_raw.OpenReadAsync().unwrap();
    // let ras = ras_async.await.unwrap();
    // // let ras = ras_async.GetResults().unwrap();
    // // Create a buffer from the size of the IRandomAccessStream
    // let size = ras.Size().unwrap() as u32;
    // let buffer = Buffer::Create(size).unwrap();
    // // Create a IBuffer from the buffer
    // let ibuffer = IBuffer::try_from(buffer).unwrap();
    // // InParam<'_, IBuffer>
    // let param = InParam::owned(ibuffer);

    // let res_async = ras
    //     .ReadAsync(
    //         param,
    //         size,
    //         windows::Storage::Streams::InputStreamOptions::None,
    //     )
    //     .unwrap();

    // let res = res_async.GetResults().unwrap();

    // let res = Buffer::Create(100).unwrap();

    // Convert the IBuffer to a Vec<u8>
    // unsafe {
    //     let data = as_mut_bytes(&res).unwrap();
    //     let thumb = base64::encode(data);
    //     println!("{}", thumb);
    // }

    // let thumb = base64::encode(Vec::from(res));
    return (title.to_string(), artist.to_string());
}

// #[tauri::command]
// async fn queryApps<R: Runtime>(
//     app: tauri::AppHandle<R>,
//     window: tauri::Window<R>,
// ) -> Result<(), String> {
//     let start_menu = std::env::var("ST").unwrap();
//     Ok(())
// }

// fn queryRelevantApps() {
//     // get the environment variable for the start menu
//     let start_menu = std::env::var("").unwrap() + "\\Microsoft\\Windows\\Start Menu\\Programs";
// }

// unsafe fn as_mut_bytes(buffer: &IBuffer) -> Result<&mut [u8], Error> {
//     let interop = buffer.cast::<IBufferByteAccess>()?;
//     let data = interop.Buffer()?;
//     Ok(std::slice::from_raw_parts_mut(data, buffer.Length()? as _))
// }
