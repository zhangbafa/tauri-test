import { fetch } from "@tauri-apps/plugin-http";
const buildUrl = (config) => {
    const queryParams = new URLSearchParams(
        Object.entries(config.params).map(([key, value]) => [key, String(value)])
    );
    return `${config.baseUrl}?${queryParams.toString()}`;
}
const options = {
    method: 'GET',
    headers: {
        'accept': 'application/json'
    }

};
// 获取电脑运行状态
const getStatus = async (params) => {
    const url = 'http://127.0.0.1:5876/status';
    const response = await fetch(url, options)
    const result = await response.json();
    return result
}

// 获取本地全部模型
const getLoalModels = async (root_dir) => {    
    const url = {
        baseUrl: 'http://127.0.0.1:5876/models/get_local',
        params: { root_dir: root_dir }
    };
   
    const response = await fetch(buildUrl(url), options)
    const result = await response.json();
    return result
}

// 获取未加载模型
const getunloadedModels = async (root_dir) => {
    const url = {
        baseUrl: 'http://127.0.0.1:5876/models/get_unloaded',
        params: { root_dir: root_dir }
    };
    const response = await fetch(buildUrl(url), options)
    const result = await response.json();
    return result
}

// 添加指定模型：允许重复添加相同路径模型，且不重复占用内存
const addModel = async (model_path, model_config) => {
    const url = {
        baseUrl: 'http://127.0.0.1:5876/models/add',
        params: {
            model_path: model_path,
            config_path: model_config,
            device_id: 'cuda',
            language: 'ZH'
        }
    };
    const response = await fetch(buildUrl(url), options)
    const result = await response.json();
    return result
}

// 获取已加载模型信息
const modelsInfo = async (root_dir) => {    
    const url = `http://127.0.0.1:5876/models/info`
    const response = await fetch(url, options)
    const result = await response.json();
    return result
}

// 根据ID删除模型   
const deleteModel = async (model_id) => {    
    const url = `aiapi/models/delete?model_id=${model_id}`
    const response = await fetch(url, options)
    const result = await response.json();
    return result
} 


// 测试服务是否可用
const test = async (params) => {
    try {
        const url = 'http://127.0.0.1:5876/models/test';
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('服务可用性测试失败:', error);
        return {
            status: false,
            error: error.message
        };
    }
}
export {
    getStatus,
    getLoalModels,
    getunloadedModels,
    addModel,
    modelsInfo,
    deleteModel,
    test
}
