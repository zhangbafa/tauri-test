<template>
  <a-row :gutter="5">
    <a-col :span="18">
      <div style="margin: 10px">
        <div  v-for="(item, index) of anchor_script" :key="item.id" class="card-box">
          <a-card style="margin-top: 10px;padding:0;background-color: var(--color-fill-2);" size="mini">
            <template #actions v-if="active==item.id">
                <a-button type="primary" :style="{ marginLeft: '10px' }" @click="handleEdit(item)" size="mini">
                  保存
                </a-button>
                <a-popconfirm content="确认删除" @ok="handleDelete(item)">
                  <a-button :style="{ marginLeft: '0px' }" status="danger" size="mini">
                  <icon-delete />
                </a-button>
                </a-popconfirm>
            </template>
            <div style="margin: 0 auto; width:100%;position: relative;">
              <a-textarea v-model="item.content" placeholder="请输入主播话术" :max-length="200" :auto-size="{maxRows:5,minRows:2}" allow-clear
             @focus="handleFocus(item.id)"
                show-word-limit />
            </div>
          </a-card>
        </div>
        <a-divider />
        <div style="display: flex; justify-content: center; margin: 10px">
          <a-button @click="handleRefresh">刷新话术</a-button>
          <a-button @click="handleAdd" type="primary" style="margin-left: 13px">添加话术</a-button>
        </div>
        <a-divider />
        <div style="margin: 15px 0 20px 0">
          <a-typography>
            <a-typography-title :heading="6">普通变量</a-typography-title>
            <a-typography-paragraph>
              变量使用<a-tag style="margin: 0 6px" color="arcoblue">{ }</a-tag>包括起来，每个变量用<a-tag style="margin: 0 6px"
                color="arcoblue"> | </a-tag>分隔开，如： {变量1|变量2}，播报时会随机选择一个。须在英文输入状态输入符号
            </a-typography-paragraph>           
            <a-typography-title :heading="6">特殊变量</a-typography-title>
            <a-typography-paragraph>
              <a-tag style="margin: 0 4px" color="arcoblue"> {time} </a-tag>
              替换为当前时间，如： 现在是下午3点10分
            </a-typography-paragraph>
          </a-typography>
          <div style="display: flex;justify-content: center;">
            <a-space>
              <a-button type="primary" @click="handleCopy('{变量1|变量2}')"><icon-copy />复制普通变量</a-button>
              <a-button type="primary" @click="handleCopy('{time}')"><icon-copy />复制特殊变量</a-button>
            </a-space>
          </div>
        </div>
      </div>
    </a-col>
    <a-col :span="6" >
      <a-card title="调整音量/语速" style="margin: 10px;">
        <div style="margin: 15px 0 20px 0">
          <div style="display: inline-block; margin-right: 10px">音量</div>
          <a-slider :min="0" :max="100" :setp="1" :style="{ width: '83%' }" />
        </div>
        <div>
          <div style="display: inline-block; margin-right: 10px">语速</div>
          <a-slider :min="0.25" :step="0.25" :max="2" :style="{ width: '83%' }" show-ticks />
        </div>
        <div style="margin-top: 15px; text-align: right">
          <a-button type="primary" size="small">确定</a-button>
        </div>
      </a-card>
      <a-card title="选择主播" style="margin: 15px 10px 10px 10px">
        <div style="margin: 15px 0 20px 0">
          <a-select placeholder="Please select ...">
            <a-option>主播1</a-option>
            <a-option>主播2</a-option>
            <a-option>主播3</a-option>
            <a-option disabled>Disabled</a-option>
          </a-select>
        </div>
        <div style="margin-top: 15px; text-align: right">
          <a-button type="primary" size="small">确定</a-button>
        </div>
      </a-card>
    </a-col>
  </a-row>
</template>
<script setup>
import { ref } from "vue";
import { Message } from "@arco-design/web-vue";
import dbManager from "@/db/index.js";
import { emit } from "@tauri-apps/api/event";

const props = defineProps({
  liveid: {
    type: String,
    default: 0
  }
})

const active = ref(0)
const handleFocus= (id)=>{
  active.value = id
}
const handleCopy = async (text) => {
  await navigator.clipboard.writeText(text)
  Message.success('复制成功')
};
const category = ref([]);
const anchor_script = ref([]);
const assistant_reply = ref([]);
const system_config = ref([]);

const handleAdd =  () => {
  const data = {
      content: "默认话术",
      type: "",
      category_id: props.liveid,
    };
  anchor_script.value.push(data)
};

const fetchData = async () => {
  anchor_script.value = await dbManager.query(`select * from anchor_script where category_id=${props.liveid}`);
};
fetchData();
const handleDelete = async (item) => {
  try {
    await dbManager.execute("DELETE FROM anchor_script WHERE id = ?", [item.id]);
    // 删除后刷新数据
    fetchData();
  } catch (error) {
    console.error("删除数据时出错: ", error);
  }
};

const handleEdit = async (item) => {
  try {
    if(item?.id){
      await dbManager.execute(
        "UPDATE anchor_script SET content = ? WHERE id = ?",
        [item.content, item.id]
      );
    }else{
      await dbManager.insert("anchor_script", item);
    }    
    // 修改成功后刷新数据
    fetchData();
    Message.success("保存成功");
  } catch (error) {
    console.error("修改数据时出错: ", error);
  }
};

const handleRefresh = () => {
  emit("refreshAnchorList");
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 20px;
}
.card-box :deep(.arco-card-actions){
  margin: 8px;
}

.card-box :deep(.arco-card-body){
  padding:0
}
.card-box :deep(.arco-textarea-wrapper){
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
