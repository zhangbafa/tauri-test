<template>
  <a-row :gutter="5">
    <a-col :span="24">
      <div style="margin: 5px">
        <div v-for="(item, index) of anchor_script" :key="item.id" class="card-box">
          <a-card style="margin-top: 10px;padding:0;background-color: var(--color-fill-2);" size="mini">

            <div
              style="margin: 0 auto; width:100%;position: relative;padding: 10px 10px 0 10px;box-sizing: border-box;">

              {{ item.content }}
              <a-divider />

            </div>
            <div class="content-actions">
              <div style="padding: 10px;">
              </div>
              <div class="action">
                <a-space>
                  <div>
                    话术编号:
                    <a-tag>{{ index + 1 }}</a-tag>
                  </div>
                  <div v-if="item.paster_type !== null && item.paster_type !== ''">
                    贴片类型: {{ item.paster_type == 'image' ? '图片' : '视频' }}
                  </div>
                  <a-button type="primary" :style="{ marginLeft: '10px' }" @click="handleUpdate(item)" size="mini">
                    修改
                  </a-button>
                  <a-popconfirm content="确认删除" @ok="handleDelete(item)" position="lt">
                    <a-button :style="{ marginLeft: '0px' }" status="danger" size="mini">
                      <icon-delete />
                    </a-button>
                  </a-popconfirm>
                </a-space>
              </div>
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
              <a-button @click="handleClick">Open Form Modal</a-button>
            </a-space>
          </div>
        </div>
      </div>
    </a-col>
  </a-row>
  <!--  -->

  <a-modal v-model:visible="visible" title="话术管理" title-align="start" @cancel="handleCancel" @before-ok="handleBeforeOk"
    width="800px">
    <a-form :model="form" :style="{ width: '700px' }">
      <a-form-item field="paster_path" label="话术">
        <a-textarea v-model="form.content" placeholder="请输入话术，支持变量" :max-length="200"
          :auto-size="{ maxRows: 10, minRows: 4 }" allow-clear @focus="handleFocus(form.id)" show-word-limit ref="textareaRef" />
          <template #extra>
            <a-space>
              <a-button @click="insertCharacter('{time}')" size="mini">{当前时间}</a-button>            
              <a-button @click="insertCharacter('{username}')" size="mini">{用户名}</a-button>
              <a-button @click="insertCharacter('{变量1|变量2}')" size="mini">{变量1|变量2}</a-button>
            </a-space>
          </template>
      </a-form-item>
      <div>
          
        </div>
      <a-form-item field="paster_type" label="贴片类型">
        <a-radio-group v-model="form.paster_type">
          <a-radio value="image">图片</a-radio>
          <a-radio value="video">视频</a-radio>
        </a-radio-group>
      </a-form-item>
      <div v-show="form.paster_type">
        <a-form-item field="show_type" label="显示方式">
          <a-radio-group v-model="form.show_type">
            <a-radio value="right">由右侧进入</a-radio>
            <a-radio value="left">由左侧进入</a-radio>
            <a-radio value="zoom">由小变大</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item field="paster_path" label="贴片">
          <a-input type="text" v-model="form.paster_path" placeholder="输入贴片路径" />
          <a-button type="primary" :style="{ marginLeft: '10px' }">选择文件</a-button>
        </a-form-item>
        <a-form-item field="duration" label="显示持续">
          <a-input type="text" v-model="form.duration" placeholder="显示多少时间，秒为单位" /> <span
            style="display: inline-block;margin-left: 10px;">秒</span>
        </a-form-item>
        <a-form-item field="ratio" label="显示比例">
          <a-input type="text" v-model="form.ratio" placeholder="占画面的百分比" /> <span
            style="display: inline-block;margin-left: 10px;">%</span>
        </a-form-item>
      </div>
      <div v-show="form.paster_type == 'video'">
        <a-form-item field="video_current_time" label="播放位置">
          <a-input type="text" v-model="form.video_current_time" placeholder="从那一秒开始播放" /> <span
            style="display: inline-block;margin-left: 10px;">秒</span>
        </a-form-item>

        <a-form-item field="muted" label="静音播放">
          <a-checkbox value="1" v-model="form.muted">开启静音</a-checkbox>
        </a-form-item>
      </div>


    </a-form>
  </a-modal>
  <!--  -->
</template>
<script setup>
import { ref, reactive, computed, nextTick } from "vue";
import { Message } from "@arco-design/web-vue";
import dbManager from "@/db/index.js";
import { emit } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { convertFileSrc } from '@tauri-apps/api/core'

const getPasterPath = computed((item) => {
  // hasBeenToggled.value = true
  return convertFileSrc(item.paster_path)
});
// 弹窗
const visible = ref(false);
const form = reactive({
  content: '',
  paster_type: '',
  show_type: 'right',
  paster_path: '',
  duration: '',
  ratio: '',
  video_current_time: '',
  muted: true
});
const props = defineProps({
  liveid: {
    type: String,
    default: 0
  }
})

const textareaRef = ref(null);

const handleClick = () => {
  visible.value = true;
};
const handleUpdate = (item) => {
  Object.assign(form, item)
  console.log(form)
  visible.value = true;
}
const handleBeforeOk = async (done) => {
  console.log(form)
  const item = {
    content: form.content,
    paster_path: form.paster_path,
    paster_type: form.paster_type,
    category_id: props.liveid
  }
  try {
    if (form?.id) {
      item.id = form.id
      await dbManager.execute(
        "UPDATE time_script SET content = ?,paster_path=?,paster_type='image' WHERE id = ?",
        [item.content, item.paster_path, item.id]
      );
      Message.success('修改成功')
    } else {
      await dbManager.insert("time_script", item);
      Message.success('添加成功')
    }
    fetchData()
  } catch (error) {
    Message.success('添加失败')
  }
};
const handleCancel = () => {
  visible.value = false;
}

const active = ref(0)
const handleFocus = (id) => {
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

const handleAdd = () => {
  const data = {
    content: "默认话术",
    type: "",
    paster_path: '',
    paster_type: 'image',
    category_id: props.liveid,
  };
  anchor_script.value.push(data)
};

const fetchData = async () => {
  anchor_script.value = await dbManager.query(`select * from time_script where category_id=${props.liveid}`);
};
fetchData();
const handleDelete = async (item) => {
  try {
    await dbManager.execute("DELETE FROM time_script WHERE id = ?", [item.id]);
    // 删除后刷新数据
    fetchData();
  } catch (error) {
    console.error("删除数据时出错: ", error);
  }
};

const handleEdit = async (item) => {
  try {
    if (item?.id) {
      await dbManager.execute(
        "UPDATE time_script SET content = ?,paster_path=?,paster_type='image' WHERE id = ?",
        [item.content, item.paster_path, item.id]
      );
    } else {
      await dbManager.insert("time_script", item);
    }
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

const insertCharacter = (text) => {
  // 获取 textarea DOM 元素
  const textarea = textareaRef.value?.$el.querySelector('textarea');  
  if (!textarea) {
    console.error('未找到 textarea 元素');
    return;
  }  
  const textToInsert = text; // 这里替换成您要插入的文字  
  // 获取当前光标位置
  const startPos = textarea.selectionStart;
  const endPos = textarea.selectionEnd;  
  // 获取当前文本内容
  const currentContent = form.content;  
  // 在光标位置插入文字
  form.content = currentContent.substring(0, startPos) + 
                 textToInsert + 
                 currentContent.substring(endPos);  
  // 等待 DOM 更新后设置新的光标位置
  nextTick(() => {
    // 将光标移动到插入的文字后面
    const newCursorPos = startPos + textToInsert.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    // 保持焦点
    textarea.focus();
  });
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

.card-box :deep(.arco-card-actions) {
  margin: 8px;
}

.card-box :deep(.arco-card-body) {
  padding: 0
}

.card-box :deep(.arco-textarea-wrapper) {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.content-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  margin-right: 10px;
}

.content-actions .action {
  /* display: none; */
}

.content-actions:hover .action {
  display: inline-block;
}
</style>
