<template>
    <a-layout>
      <a-layout-content>
        <div class="container" v-for="(item, index) of assistant_reply" :key="item.id">
          <div style="width: 80px;">话术{{ index + 1 }}</div>
          <div style="margin: 0 auto;width: 85%;">
            <a-textarea v-model="item.reply_content" placeholder="请输入助播话术" :max-length="100" auto-size allow-clear show-word-limit/>
          </div>
          <div>
            <a-space>
              <!-- <a-button type="primary"  :style="{ marginLeft: '10px' }">确定</a-button> -->
              <a-button type="primary" :style="{ marginLeft: '10px' }" @click="handleEdit(item)">
                保存
              </a-button>
              <a-button @click="handleDelete(item.id)" :style="{ marginLeft: '10px' }"  status="danger">
                <icon-delete/>
              </a-button>
            </a-space>
          </div>
        </div>
        
        <div style="display: flex;justify-content: center;width: 90%;margin: 10px auto;">
          <a-button @click="handleAdd" type="primary" long >添加话术</a-button>
        </div>
      </a-layout-content>
  
    </a-layout>
  </template>
  <script setup>
  import { ref, reactive } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import dbManager from '@/db/index.js'
  
  const form = reactive({
    name: '',
    posts: [{ value: '' },{ value: '' }]
  })
  const handleAdd = async () => {
   
    try {
      const data = {
        keyword: '',
        reply_content: '',
        type: 1,
        category_id: 1
      }
      await dbManager.insert('assistant_reply', data)
      // 添加后刷新数据
      fetchData()
    } catch (error) {
      console.error('添加数据时出错: ', error)
    }
  }
  const category = ref([])
  const anchor_script = ref([])
  const assistant_reply = ref([])
  const system_config = ref([])
  const fetchData = async () => {
    assistant_reply.value = await dbManager.query('select * from assistant_reply')
  }
  fetchData()
  const handleDelete = async (id) => {
    try {
      await dbManager.execute('DELETE FROM assistant_reply WHERE id = ?', [id])
      // 删除后刷新数据
      fetchData()
    } catch (error) {
      console.error('删除数据时出错: ', error)
    }
  }
  
  const handleEdit = async (item) => {
    console.log(item)
    try {
      await dbManager.execute(
        'UPDATE assistant_reply SET reply_content = ?,keyword = ? WHERE id = ?',
        [item.reply_content, item.keyword, item.id]
      )
      // 修改成功后刷新数据
      fetchData()
      Message.success('保存成功')
    } catch (error) {
      console.error('修改数据时出错: ', error)
    }
  }
  
  </script>
  
  
  <style scoped>
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin: 20px;
  }
  </style>