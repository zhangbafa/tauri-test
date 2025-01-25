<template>
    <div class="container">
        <div class="search">
            <a-input-search :style="{ width: '320px' }" placeholder="" button-text="Search"
                style="width: 100%;height: 50px;" @press-enter="handleSearch" v-model="keyword"/>
            <div style="margin-top: 10px">
                <a-radio-group v-model="type" @change="handleChange">
                    <a-radio value="100">全部</a-radio>
                    <a-radio value="1">单件</a-radio>
                    <a-radio value="2">组合</a-radio>
                </a-radio-group>
            </div>
        </div>
        <a-row :gutter="20">
            <a-col :xs="24" :sm="12" :md="8" :lg="4" v-for="(item, index) in goods" :key="item.id">
                <a-card style="margin-bottom: 20px;">
                    <template #cover>
                        <div>
                            <img :style="{ width: '100%', transform: 'translateY(0px)' }" alt="dessert"
                                :src="item.img" />
                        </div>
                    </template>
                    <a-card-meta>
                        <template #description>
                       
                            <span
                                style="padding-right: 10px;font-style: oblique;color:red;font-size: 16px;font-weight: bold;">
                                {{ item.no }}
                            </span>

                            {{ item.title }} --- {{ item.price }}
                        </template>
                    </a-card-meta>
                </a-card>
            </a-col>
        </a-row>

    </div>
</template>

<script setup>
import { ref } from 'vue';
import list from '@/data/lianhua'

const goods = ref(list)
const keyword = ref('')
const type = ref('1')
const handleSearch=()=>{
    search()
}
const handleChange=()=>{
    search()
}
const search =()=>{
    let result = []    
    if (type.value === '100') {//全部
        result = list.filter(item => item.title.includes(keyword.value));
        
    } else if (type.value === '1') {//单件
        // 当type为1时，添加条件suit=false进行筛选
        result = list.filter(item => item.title.includes(keyword.value) &&!item.suit);
    } else if (type.value === '2') {//组合
        // 当type为2时，添加条件suit=true进行筛选
        result = list.filter(item => item.title.includes(keyword.value) && item.suit);
    }
    // console.log(goods.value )
    goods.value = result
}

import { listen } from '@tauri-apps/api/event';

listen('custom-event', (event) => {
    console.log('Received custom event:', event.payload);
});
</script>

<style>
.container {
    position: relative
}

.search {
    position: fixed;
    left: 25%;
    right: 0;
    top: 20px;
    z-index: 1;
    width: 50%;
    background-color: white;
    padding: 10px;
    border-radius: 10px;
    border: 3px solid #000;
}

.item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.arco-card-meta-title {
    font-size: 30px;
    font-weight: bold;
    /* color: red; */
    margin-bottom: 10px;
}
</style>