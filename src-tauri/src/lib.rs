mod audio_processor;
mod parse_srt;
mod stream;

use audio_processor::process_audio_segments;
use parse_srt::handle_parse_srt;
use stream::fetchstream;

use tauri::Builder;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            process_audio_segments,
            handle_parse_srt,
            fetchstream
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
