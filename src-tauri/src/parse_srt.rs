use serde::{Deserialize, Serialize};
use srtparse;
// 定义Time结构体
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LocalTime {
    pub hours: u64,
    pub minutes: u64,
    pub seconds: u64,
    pub milliseconds: u64,
}

// 定义Item结构体
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LocalItem {
    pub pos: usize,
    pub start_time: LocalTime,
    pub end_time: LocalTime,
    pub text: String,
}

#[tauri::command]
pub async fn handle_parse_srt(input_path: String) -> Result<Vec<LocalItem>, String> {
    let srt_items = srtparse::from_file(input_path).map_err(|e| e.to_string())?;

    let local_items: Vec<LocalItem> = srt_items
        .into_iter()
        .map(|item| LocalItem {
            pos: item.pos,
            start_time: LocalTime {
                hours: item.start_time.hours,
                minutes: item.start_time.minutes,
                seconds: item.start_time.seconds,
                milliseconds: item.start_time.milliseconds,
            },
            end_time: LocalTime {
                hours: item.end_time.hours,
                minutes: item.end_time.minutes,
                seconds: item.end_time.seconds,
                milliseconds: item.end_time.milliseconds,
            },
            text: item.text,
        })
        .collect();

    Ok(local_items)
}
