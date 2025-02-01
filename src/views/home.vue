<template>
  <div class="container">
    <div class="app-name">
      <!-- <h1 style="text-align: left;">选择你的直播间</h1> -->
    </div>
  <div>
        <a-row :gutter="20">
          <a-col :span="12" v-for="item in category" :key="item.id" style="margin-bottom: 15px;cursor: pointer;">
            <a-card hoverable @click="handleNav(item)">
              <a-dropdown trigger="contextMenu" alignPoint :style="{display:'block'}">
              <div  style="display: flex;justify-content: space-between;width: 100%;padding: 10px;align-items: center;">
                <div @focus="handleFocus" style="font-weight: bold;width: 80%;padding: 6px;">{{ item.category_name }}</div>
                <div>
                  <icon-right />
                </div>
              </div>
              <template #content>
                <a-doption @click.stop="handleEditModel(item)">
                  <template #icon>
                    <icon-edit />
                  </template>
                  <template #default>编辑</template>
                </a-doption>
                <a-doption @click.stop="handleCreate(item)">
                  <template #icon>
                    <icon-plus />
                  </template>
                  <template #default>添加</template>
                </a-doption>
                <a-doption @click.stop="handleDelete(item,'delete')">
                    <template #icon>
                    <icon-delete />
                  </template>
                  <template #default>删除</template>
                  
                </a-doption>
              </template>
            </a-dropdown>
             
              
            </a-card>
          </a-col>
        </a-row>
      </div>
  </div>
  <a-drawer :width="340" :header="false" :visible="visible" placement="bottom" unmountOnClose @ok="handleOk"
  @cancel="handleCancel" :footer="true">
    <template #title>
      Title
    </template>
    <div style="padding-top: 40px" v-if="!isDelete">
      <a-form :style="{ width: '600px',margin:'0 auto' }">
        <a-form-item field="name" label="直播间名称">
          <a-input
            v-model="category_name"
            placeholder=""
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSave">保存</a-button>
        </a-form-item>
      </a-form>
    </div>
    <div v-else>
      <h1>是否确认删除？</h1>
    </div>
  </a-drawer>
</template>

<script setup>
import { ref,onMounted } from 'vue'
import dbManager from '@/db/index.js'
import logo from '@/assets/128x128@2x.png'
import { useRouter } from 'vue-router'
import {Message} from '@arco-design/web-vue'
const router = useRouter()
// 
const show = ref(false)
const category = ref([])
const category_name = ref('')
// 
const handleFocus=()=>{
  show.value = true
}
onMounted(async ()=>{
  initializeData()
       
})

const selectid = ref(0)
const visible = ref(false)
const handleEditModel=(item)=>{
  visible.value = true
  selectid.value = item.id
  category_name.value = item.category_name
}
const handleCreate=()=>{
  visible.value = true
  selectid.value = ''
  category_name.value = ''
}
const handleSave= async ()=>{
  if(selectid.value){
    const result = await dbManager.update('category',{
        category_name:category_name.value
      },{
        id:selectid.value
      })
      //{lastInsertId: 0, rowsAffected: 1}
      if(result.rowsAffected){
        category.value = await dbManager.query('select * from category')
        visible.value = false
      }
  }else{
      await dbManager.insert('category', {
      'category_name': category_name.value
      })  
      category.value = await dbManager.query('select * from category')
      visible.value = false
  }
  

}
const isDelete = ref(false)
const handleDelete=(item,type)=>{
  selectid.value = item.id
  if(item.id==1){
    Message.error('不能删除')
    return false
  }
  isDelete.value = true
  visible.value = true
}
const handleOk = async () => {
  const result = await dbManager.delete('category',{id:selectid.value})
  category.value = await dbManager.query('select * from category')
  visible.value = false;
};
const handleCancel = () => {
  visible.value = false;
  selectid.value = ''
  isDelete.value = false
}
const handleNav = (item)=>{
  router.push({
    path: '/dashboard',
    query: {
      category_id: item.id,
      category_name: item.category_name
    }
  })
}
const initializeData = async () => {
  await dbManager.init()
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

  // 调用 createTable 函数创建 system_config 表
  await dbManager.createTable('time_script', {
    'id': 'INTEGER PRIMARY KEY AUTOINCREMENT',
    'content': 'TEXT NOT NULL',
    'type': 'TEXT',
    'create_time': 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'update_time': 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'category_id': 'INTEGER'
  });

  

  const result = await dbManager.query('select count(*) as count from category')
  if(result[0].count==0){
      await dbManager.insert('category', {
      'category_name': '默认直播间'
      })  
  }
  category.value = await dbManager.query('select * from category')
}
</script>

<style scoped>
.container {
  width: 70%;
  height: 98vh;
  margin: 0 auto;
  display: flex;
  /* align-items: center; */
  justify-content: center;
  flex-direction: column;
}
.app-name {
  text-align: left;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start
}
.app-name img{
  /* text-align: center; */
  width: 80px;
  height: auto;
}
</style>