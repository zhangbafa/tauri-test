<template>
      <a-row>
        <a-col :span="16">
          <div class="container" v-for="(item, index) of anchor_script" :key="item.id">
        <div style="width: 80px;">话术{{ index + 1 }}</div>
        <div style="margin: 0 auto;width: 85%;padding-top:5px">
          <a-textarea v-model="item.content" placeholder="请输入主播话术" :max-length="200" auto-size allow-clear show-word-limit/>
        </div>
        <div>
          <a-space>
            <!-- <a-button type="primary"  :style="{ marginLeft: '10px' }">确定</a-button> -->
            <a-button
            ton type="primary" :style="{ marginLeft: '10px' }"  @click="handleEdit(item)">
              保存
            </a-button>
            <a-button @click="handleDelete(item.id)" :style="{ marginLeft: '10px' }"  status="danger">
              <icon-delete/>
            </a-button>
          </a-space>
        </div>
      </div>
      
      <div style="display: flex;justify-content: center;margin: 10px auto;">
        <a-button @click="handleAdd" type="outline"  long >添加话术</a-button>
      </div>
        </a-col>
        <a-col :span="7" :offset="1">
          AI 提示词模版：
        </a-col>
      </a-row>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import dbManager from '@/db/index.js'


const handleAdd = async () => {
  try {
    const data = {
      content: '',
      type: '',
      category_id: 1
    }
    await dbManager.insert('anchor_script', data)
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
  anchor_script.value = await dbManager.query('select * from anchor_script')
}
fetchData()
const handleDelete = async (id) => {
  try {
    await dbManager.execute('DELETE FROM anchor_script WHERE id = ?', [id])
    // 删除后刷新数据
    fetchData()
  } catch (error) {
    console.error('删除数据时出错: ', error)
  }
}

const handleEdit = async (item) => {
  try {
    await dbManager.execute(
      'UPDATE anchor_script SET content = ? WHERE id = ?',
      [item.content, item.id]
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