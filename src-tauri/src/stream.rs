use reqwest::Client;
use futures_util::StreamExt;
use tauri::Emitter;

use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StreamResponse {
    text: String,
}

// 修改后的命令
#[tauri::command]
pub async fn fetchstream(
    app: tauri::AppHandle,
    url: String,
    headers: HashMap<String, String>,
    body: String
) -> Result<(), String> {
    let client = Client::new();
    
    // 调试输出请求信息
    println!("正在请求: {}", url);
    println!("请求头: {:?}", headers);
    println!("请求体: {}", body);

    let mut request = client.post(&url);
    
    for (key, value) in headers {
        request = request.header(&key, value);
    }
    
    let response = request
        .body(body)
        .send()
        .await
        .map_err(|e| format!("发送请求失败: {}", e))?; // 更详细的错误
        
    // 检查状态码
    if !response.status().is_success() {
        return Err(format!("HTTP错误: {}", response.status()));
    }

    let mut stream = response.bytes_stream();
    
    while let Some(chunk) = stream.next().await {
        match chunk {
            Ok(bytes) => {
                let text = String::from_utf8_lossy(&bytes);
                //println!("收到数据块: {}", text); // 调试输出
                
                // 修改事件发送方式
                match app.emit("debug-event", text.to_string()) {
                    Ok(_)=> (),
                    Err(e) => println!("事件发送失败: {}", e)
                }
            }
            Err(e) => return Err(format!("读取流失败: {}", e)),
        }
    }
    
    Ok(())
}