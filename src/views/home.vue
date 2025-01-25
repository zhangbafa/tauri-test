<template>
    <div class="container">
      <a-button type="primary" @click="handleConfig">启动服务</a-button>
      <a-button type="danger" @click="handleStop">停止服务</a-button>
      
      <!-- 显示 PID -->
      <div v-if="pid" style="margin-top: 10px">
        当前进程 PID: {{ pid }}
      </div>
      
      <!-- 显示输出日志 -->
      <div class="logs" style="margin-top: 20px; overflow-y: auto">
        <div v-for="(log, index) in outputLogs" :key="index" :class="log.type">
          {{log.type}}--{{ log.content }}
        </div>
      </div>
    </div>
</template>

<script setup>
import { Command } from '@tauri-apps/plugin-shell'
import { ref } from 'vue'
import dbManager from '@/db/index.js'

const commandRef = ref(null)
const outputLogs = ref([]) // 存储输出日志
const pid = ref(null) // 存储进程 PID

const handleClick = async () => {
  const windows = navigator.userAgent.includes("Windows");
  let cmd = windows ? "cmd" : "sh";
  let args = windows ? ["/C"] : ["-c"];
  
  const command = new Command(cmd, [
    ...args,
    "chcp 65001 && cd E:\\BaiduNetdiskDownload\\ai\\tts && .\\venv\\python.exe .\\server_fastapi.py"
  ]);
  
  commandRef.value = command;

  // 监听输出并处理编码问题
  command.stdout.on("data", (line) => {
    try {
      // 使用 Buffer 处理编码问题
      // const decodedLine = Buffer.from(line, 'binary').toString('utf8');
      // outputLogs.value.push({ type: 'stdout', content: decodedLine });
      console.log(`标准输出: ${line}`);
    } catch (e) {
      console.log('输出解析错误:', e);
      // 尝试直接输出原始内容
      outputLogs.value.push({ type: 'stdout', content: line });
    }
  });

  command.stderr.on("data", (line) => {
    try {
      // const decodedLine = Buffer.from(line, 'binary').toString('utf8');
      // outputLogs.value.push({ type: 'stderr', content: decodedLine });
      console.log(`错误输出: ${line}`);
    } catch (e) {
      console.log('错误输出解析错误:', e);
      outputLogs.value.push({ type: 'stderr', content: line });
    }
  });

  try {
    const child = await command.spawn(); // 使用 spawn 而不是 execute
    pid.value = child.pid;
    console.log('进程 PID:', child);
  } catch (error) {
    console.error('启动失败:', error);
  }
}

const handleStop = async () => {
  const windows = navigator.userAgent.includes("Windows");
  let cmd = windows ? "cmd" : "sh";
  let args = windows ? ["/C"] : ["-c"]
  console.log(cmd, args)

  const findCommand = new Command(cmd, [
      '/C',
      `netstat -ano | findstr :5876`  // 假设 FastAPI 服务运行在 5876 端口
    ]);
    
    const result = await findCommand.execute();
    console.log('查找结果:', result.stdout);
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
         
          if(processPid<=0) continue
          if(parts[3]!='LISTENING') continue
          console.log('找到进程 PID:', processPid,parts[3]);
          // 终止进程
          const killCommand = new Command(cmd, [
            "/C",
            `taskkill /F /T /PID ${processPid}`
          ]);
          
          await killCommand.execute();
          console.log('服务已停止');
          return false
         
        }
      }
    }
    
  } catch (error) {
    console.error('停止服务失败:', error);
    outputLogs.value.push({ type: 'stderr', content: `停止服务失败: ${error}` });
  }
}

const handleConfig = async () => {
  const db = await dbManager.init()
  dbManager.insert('category', {
  category_name: 'Electronics',
  // add_time 和 update_time 会使用默认值，所以可以不提供
  // delete_flag 也会使用默认值，所以可以不提供
}).catch((error) => {
  console.error('插入数据时出错: ', error);
});
  const ls = await dbManager.query('select * from category')
  console.log(ls) 

  return false
// 调用 createTable 函数创建 category 表
await dbManager.createTable('category', {
  'id': 'INTEGER PRIMARY KEY AUTOINCREMENT',
  'category_name': 'VARCHAR(10) NOT NULL',
  'add_time': 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  'update_time': 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  'delete_flag': 'INTEGER DEFAULT 0'
});

// 调用 createTable 函数创建 anchor_script 表
await dbManager.createTable('anchor_script', {
  'id': 'INTEGER PRIMARY KEY AUTOINCREMENT',
  'content': 'TEXT NOT NULL',
  'type': 'TEXT',
  'create_time': 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  'update_time': 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  'category_id': 'INTEGER'
});

// 调用 createTable 函数创建 assistant_reply 表
await dbManager.createTable('assistant_reply', {
  'id': 'INTEGER PRIMARY KEY AUTOINCREMENT',
  'keyword': 'TEXT NOT NULL',
  'reply_content': 'TEXT NOT NULL',
  'category_id': 'INTEGER',
  'type': 'INTEGER',
  'create_time': 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  'update_time': 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
});

// 调用 createTable 函数创建 system_config 表
await dbManager.createTable('system_config', {
  'id': 'INTEGER PRIMARY KEY AUTOINCREMENT',
  'key': 'TEXT NOT NULL',
  'value': 'TEXT NOT NULL',
  'config_description': 'TEXT',
  'create_time': 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  'update_time': 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
});
}
</script>

<style>
.container {
    width: 70%;
    margin: 0 auto;
}

.logs {
  font-family: monospace;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
}
.stderr {
  color: red;
}
.stdout {
  color: #333;
}
</style>