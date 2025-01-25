<template>
    <a-space>
        <a-button type="primary" @click="handleGetLocalModels" >加载模型</a-button>
        <a-button type="primary" @click="handleShell" status="success" :loading="loading" v-if="!running">启动服务</a-button>
        <a-button type="primary" @click="handleStopShell" status="danger" v-if="running">停止服务</a-button>
    </a-space>
    <a-modal width="50%" v-model:visible="visible" @ok="handleLoadModel" @cancel="handleCancel">
        <template #title>
            全部模型
        </template>
        <div>
            <h3>最多可选择 3 个模型</h3>
            <div style="color:#999;font-size: 12px;margin-bottom: 10px;">只选择需要的模型，以节省内存,开发状态只能选择一个模型</div>
            <a-space size="large"> 
                <a-checkbox-group :max="3" direction="horizontal" :default-value="['1']" v-model="select_models">
                    <a-checkbox :value="item" v-for="item in local_models">{{item}}</a-checkbox>
                </a-checkbox-group>               
            </a-space>
        </div>
        <div>
            <h3>已经加载的模型</h3>
            <div style="color:#999;font-size: 12px;margin-bottom: 10px;">只选择需要的模型，以节省内存,开发状态只能选择一个模型</div>
            <a-space size="large"> 
                <a-checkbox-group  direction="horizontal" v-model="select_loaded_models">
                    <a-checkbox :value="item.key" v-for="(item,index) in loaded_models">
                        {{getName(item.name)}}
                        <span style="font-size: 10px;color:#999;">ID:{{ item.key }}</span>
                    </a-checkbox>
                </a-checkbox-group>               
            </a-space>
            <div>
                <a-button type="primary" @click="handleDeleteLoadedModel" status="danger">删除</a-button>
            </div>
        </div>
    </a-modal>
</template>

<script setup>
import { ref, reactive,defineModel } from 'vue'
import { getStatus, getLoalModels, addModel,modelsInfo,deleteModel,test } from '@/compositions/useSpeech';
import {useChildProcess} from  '@/compositions/useChildProcess'
import { Message } from '@arco-design/web-vue';
const model_path = `E:\\BaiduNetdiskDownload\\ai\\tts\\Data\\models\\`
const config_path = `E:\\BaiduNetdiskDownload\\ai\\tts\\configs\\config.json`
const visible = ref(false)
const local_models = ref([])
const select_models = ref([])
const loaded_models = ref([])
const select_loaded_models = ref([])
const handleGetLocalModels = async () => {
    loaded_models.value = []
    
    const result_s = await getLoalModels(model_path)
    console.log(result_s)
    const result = result_s['.']
    const info = await modelsInfo()
    // loaded_models.value = info
    let aa = []
    select_loaded_models.value = []
    for (const key of Object.keys(info)) {
        const config = info[key];
        // console.log(`键: ${key}`);
        // console.log(`配置路径: ${config.config_path}`);
        // console.log(`模型路径: ${config.model_path}`);
        // console.log(`设备: ${config.device}`);
        // console.log(`语言: ${config.language}`);
        // console.log(`说话人映射: ${JSON.stringify(config.spk2id)}`);
        // console.log(`ID到说话人的映射: ${JSON.stringify(config.id2spk)}`);
        // console.log(`版本: ${config.version}`);
        // console.log('--------------------------');
        const model_name = getpath(config.model_path)
        aa.push(model_name)
        loaded_models.value.push({key:key,name:model_name})
    }
    const unique_models = [...new Set(aa)]
    select_models.value = unique_models
    local_models.value = result
    visible.value = true;
    console.log(local_models.value)
};

const modelValue = defineModel()  // 改用默认的 modelValue
const handleLoadModel = () => {
    if(select_models.value.length === 0) {
        alert('至少选择一个模型')
        return
    }
    console.log(select_models.value)
    console.log(JSON.stringify(loaded_models.value))
    let names = loaded_models.value.map(item => item.name);

    // 去重，同一个模型只加载一次
    const unique_models = [...new Set(select_models.value)]
    unique_models.map(async (item)=>{
        console.log(model_path+item)
        console.log(select_models.value)
        if(!names.includes(item)){
            const result = await addModel(model_path+item,config_path)
            
        }else{
           
        }
        
    })
    alert('加载完成')
};
const handleCancel = () => {
    loaded_models.value = []
    visible.value = false;
}


const status = reactive({
    cpu_percent: '',
    memory_percent: '',
    gpu_memory: {}
})
const handleDeleteLoadedModel = async () => {
    // console.log(select_loaded_models.value)
    select_loaded_models.value.map( async (item)=>{
        const index = loaded_models.value.findIndex(items=>items.key==item)
        const result = await deleteModel(item)
        // console.log(result)
        if(result?.status==0){
            loaded_models.value.splice(index,1);
            console.log(item)
        }else{
            alert('删除失败')
        }
    })
    // handleGetLocalModels()

}

const getpath = (path) => {
    const lastIndex = path.lastIndexOf('\\');
    if (lastIndex !== -1) {
        const fileName = path.substring(lastIndex + 1);
        return fileName
    } else {
        return 
    }
}

const getName = (name)=>{
    return name.substring(0,name.lastIndexOf('.'))
}

// 开启、关闭http服务
const loading = ref(false)
const running = ref(false)
const {startHttpServer,stopHttpServer,checkServerStatus} = useChildProcess()
const handleShell=async ()=>{
    loading.value = true
    await startHttpServer()
    let timer = null
    timer = setInterval(async () => {
        const result = await checkServerStatus()
        if(result){
            loading.value = false
            running.value = true
            clearInterval(timer)
            Message.info('启动成功')
        }
    },1000)
}

const handleStopShell=async ()=>{
    await stopHttpServer()
    // await new Promise(resolve => setTimeout(resolve, 500));    
    Message.info('服务已停止')
    running.value = false
}
</script>


<style scoped>
.arco-checkbox-group .arco-checkbox {
    margin-right: 16px;
    margin-bottom: 20px;
}
</style>