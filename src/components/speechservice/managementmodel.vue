<template>
    <a-space>
        <a-button type="primary"  size="small" @click="handleUnloadedModels" >模型管理</a-button>
    </a-space>
    <a-modal title-align="start" :footer="false"    width="50%" v-model:visible="visible" @ok="handleOK" @cancel="handleCancel">
        <template #title>
            模型管理
        </template>
        <a-tabs default-active-key="1" type="card-gutter" @tab-click="handleTabClick">
            <a-tab-pane key="1" title="未加载的模型">
                <div style="padding: 0 0 20px 20px;">
                    <h3>最多可选择 3 个模型</h3>
                    <div style="color:#999;font-size: 12px;margin-bottom: 10px;">仅选择需要的模型，可节省内存</div>
                    <a-space size="large"> 
                        <a-checkbox-group :max="3" direction="horizontal" :default-value="['1']" v-model="select_models">
                            <a-checkbox :value="item" v-for="item in local_models">{{item}}</a-checkbox>
                        </a-checkbox-group>               
                    </a-space>
                    <div>
                        <a-button type="primary" @click="handleLoadModel" status="primary" :loading="comfigLoadinig">确定加载</a-button>
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
            <a-tab-pane key="3" title="配置主播语音">
                <div style="padding: 10px 20px;">
                <a-form :model="form">
                <a-form-item field="anchor_model" label="选择主播模型">
                    <a-select placeholder="请选择模型" v-model="form.anchor_model">
                        <a-option v-for="(item,index) in loaded_models" :key="index" :value="item.key">{{item.name}}</a-option>                       
                    </a-select>
                </a-form-item>
                <a-form-item field="assistant_model" label="选择助播模型">
                    <a-select placeholder="请选择模型" v-model="form.assistant_model">
                        <a-option v-for="(item,index) in loaded_models" :key="index" :value="item.key">{{item.name}}</a-option>                       
                    </a-select>
                </a-form-item>
                <a-form-item field="report_model" label="选择播报模型">
                    <a-select placeholder="请选择模型" v-model="form.report_model">
                        <a-option v-for="(item,index) in loaded_models" :key="index" :value="item.key">{{item.name}}</a-option>                       
                    </a-select>
                </a-form-item>
                <a-form-item >
                    <a-button type="primary" @click="handleSelectModel" status="primary">确定</a-button>
                </a-form-item>
            </a-form>
        </div>
            </a-tab-pane>
        </a-tabs>
        
        
    </a-modal>
</template>
<!-- 
E:/BaiduNetdiskDownload/ai/tts/Data/models
E:/BaiduNetdiskDownload/ai/tts/configs/config.json
-->
<script setup>
import { ref, reactive,defineModel } from 'vue'
import { getStatus, getLoalModels, addModel,modelsInfo,deleteModel,getunloadedModels } from '@/compositions/useSpeech';
import {useChildProcess} from  '@/compositions/useChildProcess'
import { Message } from '@arco-design/web-vue';
const model_path = `E:\\BaiduNetdiskDownload\\ai\\tts\\Data\\models\\`
const config_path = `E:\\BaiduNetdiskDownload\\ai\\tts\\configs\\config.json`
const visible = ref(false)
const local_models = ref([])
const select_models = ref([])
const loaded_models = ref([])
const select_loaded_models = ref([])

const comfigLoadinig = ref(false)
const handleTabClick = async (key) => {
    if(key==='2'){
        handleModelInfos()
    }

    if(key==='1'){
        handleUnloadedModels()
    }
    if(key==='3'){
        handleModelInfos()
    }
}
const modelValue = defineModel()  // 定义模型值

const handleSelectModel = (value) => {
    modelValue.value = form
}
const handleModelInfos = async ()=>{
    const info = await modelsInfo()
    let temp=[];
    for (const key of Object.keys(info)) {
        const config = info[key];
        const model_name = getpath(config.model_path)
        temp.push({key:key,name:model_name})
    }
    loaded_models.value = temp
}
const handleUnloadedModels = async (type=1) => {
    loaded_models.value = []
    visible.value = true;
    const result_s = await getunloadedModels(model_path)
    const result = result_s['.']
    local_models.value = result
    console.log(result)
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
    // select_models.value = ['小美']
    // local_models.value = ['小美','小帅','小美','小帅','小美','小帅','小美','小帅','小美']
    
};

const handleLoadModel = async() => {
    if(select_models.value.length === 0) {
        alert('至少选择一个模型')
        return
    }
    comfigLoadinig.value = true

    // 去重，同一个模型只加载一次
    const unique_models = [...new Set(select_models.value)]
    console.log(unique_models)
    const loadPromises = unique_models.map(item => addModel(model_path+item, config_path))
    // console.log(loadPromises)
    try {
        await Promise.all(loadPromises)
        Message.info('加载完成')
        handleUnloadedModels(1)
        comfigLoadinig.value = false
    } catch (error) {
        comfigLoadinig.value = false
        Message.error('加载模型时发生错误')
        console.error('加载模型错误:', error)
    }
};
const handleOK = ()=>{

}
const handleCancel = () => {
    loaded_models.value = []
    visible.value = false;
}



const handleDeleteLoadedModel = async () => {
    try {
        const deletePromises = select_loaded_models.value.map(async (item) => {
            const result = await deleteModel(item);
            if (result?.status === 0) {
                const index = loaded_models.value.findIndex(items => items.key === item);
                loaded_models.value.splice(index, 1);
                console.log(item);
                return { success: true, item };
            }
            return { success: false, item };
        });

        const results = await Promise.all(deletePromises);
        const failedDeletes = results.filter(r => !r.success);
        
        if (failedDeletes.length > 0) {
            Message.error(`删除失败的模型: ${failedDeletes.map(f => f.item).join(', ')}`);
        } else {
            Message.success('所有选中的模型已成功删除');
        }
    } catch (error) {
        console.error('删除模型时发生错误:', error);
        Message.error('删除模型时发生错误');
    }
};

// 配置角色语音
const form = reactive({
    anchor_model: '',
    assistant_model: '',
    report_model: ''    
})


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