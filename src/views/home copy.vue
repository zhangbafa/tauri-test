<template>
    <div class="continaer">
        <a-row :gutter="20">
            <a-col :span="12">
                <a-card hoverable>
                    
                    <RouterLink to="/goods">
                        莲花味精--查询商品
                    </RouterLink>

                </a-card>
            </a-col>
            <a-col :span="12">
                <a-card hoverable>

                    <RouterLink to="/hudong">
                        莲花味精-互动
                    </RouterLink>
                </a-card>
            </a-col>
            
        </a-row>
    </div>
</template>

<script setup>


// 检查 `$APPDATA/avatar.png` 文件是否存在
// await exists('avatar.png', { baseDir: BaseDirectory.AppData });

import { Command } from '@tauri-apps/plugin-shell'
const windows = navigator.userAgent.includes("Windows");
//   let cmd = windows ? "cmd" : "sh";
//   let args = windows ? ["/C"] : ["-c"];
// //   E:\202222\ROI\src-tauri\1.js
// let script = 'node E:\\202222\\ROI\\10.js';
// const command = Command.create(cmd, [...args, script]);
// command.stdout.on("data", (line) => console.log(`command stdout: "${line}"`));
// command.stderr.on("data", (line) => console.log(`command stderr: "${line}"`));
// command
//       .execute()
//       .then((c) => {
//         console.log(c)
//       })
//       .catch((e)=>{
//         console.log(e)
//       });
</script>
<style>
.continaer {
    width: 70%;
    margin: 0 auto;
}
</style>