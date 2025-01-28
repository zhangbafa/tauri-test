<template>
  <div class="container">
    <div class="app-name">
      <h1 style="text-align: left;">选择你的直播间</h1>
    </div>
  <div>
        <a-row :gutter="20">
          <a-col :span="12" v-for="item in category" :key="item.id" style="margin-bottom: 15px;cursor: pointer;">
            <a-card hoverable @click="handleNav(item)">
              <div style="display: left;justify-content: space-between;">
                <span>{{ item.category_name }}</span>
                <icon-right />
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>
  </div>

</template>

<script setup>
import { ref,onMounted } from 'vue'
import dbManager from '@/db/index.js'
import logo from '@/assets/128x128@2x.png'
import { useRouter } from 'vue-router'
const router = useRouter()
// 
const category = ref([])
// 
onMounted(()=>{
  initializeData()
})

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

  // await dbManager.insert('category', {
  //   'category_name': '莲花味精'
  // })  
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