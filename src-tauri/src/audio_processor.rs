use serde::{Deserialize, Serialize};
use std::path::Path;
use std::process::Command;

#[derive(Debug, Serialize, Deserialize)]
pub struct TimeSegment {
    start: f64, // 开始时间（秒）
    end: f64,   // 结束时间（秒）
}

// 动态获取 FFmpeg 路径
fn get_ffmpeg_path() -> Result<String, String> {
    // 优先使用应用程序资源目录下的 FFmpeg
    let resource_path = std::env::current_exe()
        .map_err(|_| "获取可执行文件路径失败")?
        .parent()
        .ok_or("获取父目录失败")?
        .join("ffmpeg/ffmpeg.exe");

    println!("资源路径：{}", resource_path.to_string_lossy());
    if resource_path.exists() {
        return Ok(resource_path.to_string_lossy().to_string());
    }

    // 如果资源目录没有，尝试使用默认路径
    let default_paths = vec![
        "E:/ffmpeg/ffmpeg.exe",
        "./ffmpeg/ffmpeg.exe",
        "C:/Program Files/ffmpeg/bin/ffmpeg.exe",
    ];

    for path in default_paths {
        if Path::new(path).exists() {
            return Ok(path.to_string());
        }
    }

    Err("未找到 FFmpeg 可执行文件".to_string())
}

#[tauri::command]
pub async fn process_audio_segments(
    input_path: String,
    segments: Vec<TimeSegment>,
    output_path: String,
) -> Result<String, String> {
    let ffmpeg_path = get_ffmpeg_path()?;
    println!("FFmpeg 路径：{}", ffmpeg_path);

    let mut filter_complex = String::new();
    let mut input_parts = Vec::new();

    // 为每个片段创建过滤器
    for (i, segment) in segments.iter().enumerate() {
        // 为每个片段添加输入流
        input_parts.push("-i".to_string());
        input_parts.push(input_path.clone());

        // 构建过滤器字符串
        filter_complex.push_str(&format!(
            "[{}:a]atrim=start={}:end={},asetpts=PTS-STARTPTS[a{}];",
            i, segment.start, segment.end, i
        ));
    }

    // 添加连接所有片段的过滤器
    for i in 0..segments.len() {
        filter_complex.push_str(&format!("[a{}]", i));
    }
    filter_complex.push_str(&format!("concat=n={}:v=0:a=1[outa]", segments.len()));

    // 构建完整的命令
    let mut command = Command::new(ffmpeg_path);

    // 添加所有输入
    for part in input_parts {
        command.arg(part);
    }

    // 添加过滤器复杂度和输出选项
    let status = command
        .arg("-filter_complex")
        .arg(&filter_complex)
        .arg("-map")
        .arg("[outa]")
        .arg(output_path)
        .arg("-y") // 覆盖已存在的文件
        .status()
        .map_err(|e| format!("执行 FFmpeg 失败: {}", e))?;

    if status.success() {
        Ok("音频处理成功".to_string())
    } else {
        Err("FFmpeg 命令执行失败".to_string())
    }
}
