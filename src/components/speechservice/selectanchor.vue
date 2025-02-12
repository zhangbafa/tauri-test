<template>
    <a-space>
        <a-button type="primary" @click="handleGetLocalModels">配置模型</a-button>
    </a-space>
    <a-modal width="50%" v-model:visible="visible" @ok="handleOK" @cancel="handleCancel">
        <template #title>
            配置模型
        </template>
        <div>
            <a-form :model="form">
                <a-form-item field="anchor_model" label="选择主播AI模型22">
                    <a-select placeholder="请选择模型" v-model="form.anchor_model">
                        <a-option v-for="(item,index) in select_models" :key="index" :value="item.key">{{item.name}}</a-option>                       
                    </a-select>
                </a-form-item>
                <a-form-item field="assistant_model" label="选择助播AI模型">
                    <a-select placeholder="请选择模型" v-model="form.assistant_model">
                        <a-option v-for="(item,index) in select_models" :key="index" :value="item.key">{{item.name}}</a-option>                       
                    </a-select>
                </a-form-item>
                <a-form-item field="report_model" label="选择播报AI模型">
                    <a-select placeholder="请选择模型" v-model="form.report_model">
                        <a-option v-for="(item,index) in select_models" :key="index" :value="item.key">{{item.name}}</a-option>                       
                    </a-select>
                </a-form-item>
            </a-form>

        </div>
    </a-modal>
</template>

<script setup>
import { ref, reactive, defineModel } from 'vue'
import {  modelsInfo } from '@/compositions/useSpeech';


const visible = ref(false)
const select_models = ref([])
const modelValue = defineModel()  // 定义模型值

const form = reactive({
    anchor_model: '0',
    assistant_model: '0',
    report_model: '0'    
})
const handleGetLocalModels = async () => {
    select_models.value = []
    const info = await modelsInfo()
    console.log(info)
    for (const key of Object.keys(info)) {
        const config = info[key];
        console.log(`键: ${key}`);
        console.log(`配置路径: ${config.config_path}`);
        console.log(`模型路径: ${config.model_path}`);
        console.log(`设备: ${config.device}`);
        console.log(`语言: ${config.language}`);
        console.log(`说话人映射: ${JSON.stringify(config.spk2id)}`);
        console.log(`ID到说话人的映射: ${JSON.stringify(config.id2spk)}`);
        console.log(`版本: ${config.version}`);
        console.log('--------------------------');
        if (select_models.value.includes(getpath(config.model_path))) continue
        select_models.value.push({
            key: key,
            name: getpath(config.model_path),
            model_path: config.model_path,
            config_path: config.config_path,
            device: config.device,
            language: config.language,
            spk2id: config.spk2id,
            id2spk: config.id2spk,
            version: config.version
        })
    }
    console.log(select_models.value)
    visible.value = true;
};

const handleOK = () => {
    console.log(form)
    modelValue.value = form  // 在确认时更新模型值
    visible.value = false
};
const handleCancel = () => {
    visible.value = false;
}

const getpath = (path) => {
    const lastIndex = path.lastIndexOf('\\');
    if (lastIndex !== -1) {
        const fileName = path.substring(lastIndex + 1);
        console.log(fileName);
        return fileName
    } else {
        return
    }
}

</script>


<style scoped>
.arco-checkbox-group .arco-checkbox {
    margin-right: 16px;
    margin-bottom: 20px;
}
</style>