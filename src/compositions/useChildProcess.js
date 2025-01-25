import { Command } from '@tauri-apps/plugin-shell'

export function useChildProcess() {
    const windows = navigator.userAgent.includes("Windows");
    let cmd = windows ? "cmd" : "sh";
    let args = windows ? ["/C"] : ["-c"];

    const startHttpServer = async () => {
        const command = new Command(cmd, [
            ...args,
            "chcp 65001 && cd E:\\BaiduNetdiskDownload\\ai\\tts && .\\venv\\python.exe .\\server_fastapi.py"
        ]);
       

        // 监听输出并处理编码问题
        command.stdout.on("data", (line) => {
            try {
                console.log(`标准输出: ${line}`);
                return true
            } catch (e) {
                console.log('输出解析错误:', e);
                // 尝试直接输出原始内容
            }
        });

        command.stderr.on("data", (line) => {
            try {
                console.log(`错误输出: ${line}`);
            } catch (e) {
                console.log('错误输出解析错误:', e);
            }
        });

        try {
            const childProcess = await command.spawn(); // 使用 spawn 而不是 execute
            
            console.log(childProcess)
            return true
        } catch (error) {
            console.error('启动失败，详细信息:', {
                错误消息: error.message,
                错误名称: error.name,
                完整错误: error
            });
            return false; 
        }
    }
    
    const stopHttpServer = async () => {
        try {
            // 使用 netstat 查找监听指定端口的进程
            const findCommand = new Command(cmd, [
                '/C',
                `netstat -ano | findstr :5876`  // 假设 FastAPI 服务运行在 5876 端口
            ]);

            const result = await findCommand.execute();
            console.log('查找结果:', result);
            if (result.stdout) {
                const lines = result.stdout.split('\n');
                for (const line of lines) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length > 4) {
                        const processPid = parts[parts.length - 1];

                        if (processPid <= 0) continue
                        if (parts[3] != 'LISTENING') continue
                        console.log('找到进程 PID:', processPid, parts[3]);
                        // 终止进程
                        try {
                            const killCommand = new Command(cmd, [
                                "/C",
                                `taskkill /F /T /PID ${processPid}`
                            ]);
                            await killCommand.execute();
                            console.log('服务已停止');
                            return true;
                        } catch (killError) {
                            // 检查错误信息，如果包含特定文本说明进程已经终止，则视为成功
                            if (killError.message.includes('进程已终止') || 
                                killError.message.includes('process has been terminated')) {
                                console.log('服务已停止（进程已终止）');
                                return true;
                            }
                            throw killError; // 如果是其他错误，则抛出
                        }
                    }
                }
                return false
            }
            return false // 如果没有输出结果，返回 false
        } catch (error) {
            console.error('启动失败，详细信息:', {
                错误消息: error.message,
                错误名称: error.name,
                完整错误: error
            });
            console.error('停止服务失败:', error);
            return false // 发生错误时返回 false
        }
    }

    const checkServerStatus = async () => {
        try {
            // 使用 netstat 查找监听指定端口的进程
            const findCommand = new Command(cmd, [
                '/C',
                `netstat -ano | findstr :5876`  // 假设 FastAPI 服务运行在 5876 端口
            ]);

            const result = await findCommand.execute();
            if(result.stdout) {
                return true
            }
            return false
            console.log('查找结果:', result);
        } catch (error) {
            console.error('启动失败，详细信息:', {
                错误消息: error.message,
                错误名称: error.name,
                完整错误: error
            });
        }
    }
    return {
        startHttpServer,
        stopHttpServer,
        checkServerStatus
    }
}
