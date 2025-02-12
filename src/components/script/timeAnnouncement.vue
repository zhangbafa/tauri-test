<template>
  <a-row :gutter="5">
    <a-col :span="18">
      <a-card style="margin: 10px">
        <div
          class="container"
          v-for="(item, index) of anchor_script"
          :key="item.id"
        >
          <div style="width: 80px">话术{{ index + 1 }}</div>
          <div style="margin: 0 auto; width: 85%;padding-top: 5px">
            <a-textarea
              v-model="item.content"
              placeholder="请输入主播话术"
              :max-length="150"
              auto-size
              allow-clear
              show-word-limit
            />
          </div>
          <div>
            <a-space>
              <!-- <a-button type="primary"  :style="{ marginLeft: '10px' }">确定</a-button> -->
              <a-button
                ton
                type="primary"
                :style="{ marginLeft: '10px' }"
                @click="handleEdit(item)"
              >
                保存话术
              </a-button>
              <a-button
                @click="handleDelete(item.id)"
                :style="{ marginLeft: '10px' }"
                status="danger"
              >
                <icon-delete />
              </a-button>
            </a-space>
          </div>
        </div>
        <a-divider />
        <div style="display: flex; justify-content: center; margin: 10px">
          <a-button @click="handleRefresh">刷新话术</a-button>
          <a-button @click="handleAdd" type="primary" style="margin-left: 13px"
            >添加输入框</a-button
          >
        </div>
      </a-card>
    </a-col>
    <a-col :span="6">
      <a-card title="调整音量/语速" style="margin: 10px">
        <div style="margin: 15px 0 20px 0">
          <div style="display: inline-block; margin-right: 10px">音量</div>
          <a-slider :min="0" :max="100" :setp="1" :style="{ width: '83%' }" />
        </div>
        <div>
          <div style="display: inline-block; margin-right: 10px">语速</div>
          <a-slider
            :min="0.25"
            :step="0.25"
            :max="2"
            :style="{ width: '83%' }"
            show-ticks
          />
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
      <a-card title="变量规则" style="margin: 15px 10px 10px 10px">
        <div style="margin: 15px 0 20px 0">
          <a-typography>
            <a-typography-title :heading="6">普通变量</a-typography-title>
            <a-typography-paragraph>
              变量使用<a-tag style="margin: 0 6px" color="arcoblue">{ }</a-tag>包括起来，每个变量用<a-tag style="margin: 0 6px" color="arcoblue"> | </a-tag>分隔开，主播在播报时会随机选择一个。例:{变量1|变量2}
              <icon-copy />
            </a-typography-paragraph>
            <a-typography-paragraph>
              须在英文输入状态输入符号
            </a-typography-paragraph>
            <a-typography-title :heading="6">特殊变量</a-typography-title>
            <a-typography-paragraph>
              <a-tag style="margin: 0 4px" color="arcoblue"> {time} </a-tag>
              替换为 <a-tag>现在是下午3点10分</a-tag>
            </a-typography-paragraph>
          </a-typography>
          <a-space>
            <a-button size="mini" @click="handleCopy('{变量1|变量2}')"><icon-copy />复制普通变量</a-button>
            <a-button size="mini" @click="handleCopy('{time}')"><icon-copy />复制特殊变量</a-button>
          </a-space>
          {{ modelValue }}
        </div>
      </a-card>
    </a-col>
  </a-row>
</template>
<script setup>
import { ref, reactive,defineModel } from "vue";
import { Message } from "@arco-design/web-vue";
import dbManager from "@/db/index.js";
import { emit } from "@tauri-apps/api/event";

const modelValue = defineModel()

const handleCopy = async (text) => {
  await navigator.clipboard.writeText(text)  
  Message.success('复制成功')
};

const handleAdd = async () => {
  try {
    const data = {
      content: "",
      type: "",
      category_id: 1,
    };
    await dbManager.insert("time_script", data);
    // 添加后刷新数据
    fetchData();
  } catch (error) {
    console.error("添加数据时出错: ", error);
  }
};
const category = ref([]);
const anchor_script = ref([]);
const assistant_reply = ref([]);
const system_config = ref([]);
const fetchData = async () => {
  anchor_script.value = await dbManager.query("select * from time_script");
};
fetchData();
const handleDelete = async (id) => {
  try {
    await dbManager.execute("DELETE FROM time_script WHERE id = ?", [id]);
    // 删除后刷新数据
    fetchData();
  } catch (error) {
    console.error("删除数据时出错: ", error);
  }
};

const handleEdit = async (item) => {
  try {
    await dbManager.execute(
      "UPDATE time_script SET content = ? WHERE id = ?",
      [item.content, item.id]
    );
    // 修改成功后刷新数据
    fetchData();
    Message.success("保存成功");
  } catch (error) {
    console.error("修改数据时出错: ", error);
  }
};

const handleRefresh = () => {
  emit("refreshTimeAnnouncementList");
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  /* align-items: last baseline; */
  align-items: center;
  justify-content: space-between;
  margin: 20px;
}
</style>
