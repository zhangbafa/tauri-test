<template>
    <a-space>
        <a-button type="primary" @click="handleGetLocalModels" >模型管理</a-button>
    </a-space>
    <a-modal width="50%" v-model:visible="visible" @ok="handleOK" @cancel="handleCancel">
        <template #title>
            全部模型
        </template>
        <a-tabs default-active-key="1" type="card-gutter" @tab-click="handleTabClick">
            <a-tab-pane key="1" title="全部模型">
                <div style="padding: 0 0 20px 20px;">
                    <h3>最多可选择 3 个模型</h3>
                    <div style="color:#999;font-size: 12px;margin-bottom: 10px;">仅选择需要的模型，可节省内存</div>
                    <a-space size="large"> 
                        <a-checkbox-group :max="3" direction="horizontal" :default-value="['1']" v-model="select_models">
                            <a-checkbox :value="item" v-for="item in local_models">{{item}}</a-checkbox>
                        </a-checkbox-group>               
                    </a-space>
                    <div>
                        <a-button type="primary" @click="handleLoadModel" status="primary">确定加载</a-button>
                    </div>
                </div>
            </a-tab-pane>
            <a-tab-pane key="2" title="已加载的模型">
                <div style="padding: 0 0 20px 20px;">
                    <div style="color:#999;font-size: 12px;margin-bottom: 10px;">仅从内存中删除</div>
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
            </a-tab-pane>
            <a-tab-pane key="3">
            <template #title>Tab 3</template>
            Content of Tab Panel 3
            </a-tab-pane>
        </a-tabs>
        
        
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

const handleTabClick = (key) => {
    console.log(key)
    if(key==='2'){
        return false
        // handleGetLocalModels()
    }else{
        return true
    }
}
const handleGetLocalModels = async () => {
    loaded_models.value = []
    /*
    const result_s = await getLoalModels(model_path)
    console.log(result_s)
    const result = result_s['.']
    const info = await modelsInfo()
    let aa = []
    select_loaded_models.value = []
    for (const key of Object.keys(info)) {
        const config = info[key];
        const model_name = getpath(config.model_path)
        aa.push(model_name)
        loaded_models.value.push({key:key,name:model_name})
    }
    const unique_models = [...new Set(aa)]
    */
    // select_models.value = unique_models
    select_models.value = ['小美']
    local_models.value = ['小美','小帅','小美','小帅','小美','小帅','小美','小帅','小美']
    visible.value = true;
};

const modelValue = defineModel()  // 改用默认的 modelValue
const handleLoadModel = () => {
    if(select_models.value.length === 0) {
        alert('至少选择一个模型')
        return
    }
    // console.log(select_models.value)
    // console.log(JSON.stringify(loaded_models.value))
    let names = loaded_models.value.map(item => item.name);

    // 去重，同一个模型只加载一次
    const unique_models = [...new Set(select_models.value)]
    unique_models.map(async (item)=>{
        // console.log(model_path+item)
        // console.log(select_models.value)
        if(!names.includes(item)){
            console.log(item)
            // await addModel(model_path+item,config_path)
            
        }else{
           
        }
        
    })
    Message.info('加载完成')
};
const handleOK = ()=>{

}
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
</script>


<style scoped>
.arco-checkbox-group .arco-checkbox {
    margin-right: 16px;
    margin-bottom: 20px;
}
</style>