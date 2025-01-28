<template>
    <a-space>
        <a-switch :beforeChange="handleShell"/>开启语音服务
    </a-space>
</template>

<script setup>
import {useChildProcess} from  '@/compositions/useChildProcess'
import { Message } from '@arco-design/web-vue';

// 开启、关闭http服务
const {startHttpServer,stopHttpServer,checkServerStatus} = useChildProcess()
const handleShell=async (e)=>{
    if(e){
        await new Promise((resolve) => setTimeout(resolve, 500))
        await startHttpServer()
        let timer = null
        timer = setInterval(async () => {
            const result = await checkServerStatus()
            if(result){
                clearInterval(timer)
                Message.info('启动成功')
                return true
            }
        },1000)
        
        Message.info('启动成功')
        return true

    }else{
        await stopHttpServer()
        Message.info('服务已停止')
        return true
    }
}
</script>


<style scoped>
.arco-checkbox-group .arco-checkbox {
    margin-right: 16px;
    margin-bottom: 20px;
}
</style>