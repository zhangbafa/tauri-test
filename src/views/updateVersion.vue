<script setup lang="js">
import { ref } from 'vue';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import Shop from '../components/shop.vue';
import Daren from '../components/daren.vue';
const visible = ref(false);
const download = ref('');
const checkVersion = async () => {
  const update = await check();
  if (update) {
    console.log(
      `found update ${update.version} from ${update.date} with notes ${update.body}`
    );
    let downloaded = 0;
    let contentLength = 0;
    visible.value = true;
    
    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Started':
          contentLength = event.data.contentLength;
          download.value = '准备下载'
          console.log(`started downloading ${event.data.contentLength} bytes`);
          break;
        case 'Progress':
          downloaded += event.data.chunkLength;
          download.value = '已下载' + Math.round((downloaded / contentLength) * 100) + '%';
          console.log(`downloaded ${downloaded} from ${contentLength}`);
          break;
        case 'Finished':
          download.value = '下载完成，点击确定重启更新';
          break;
      }
    })

    console.log('update installed');

  }
}
checkVersion()
const handleOk = async () => {
  visible.value = false;
  await relaunch();
}
const handleCancel = () => {
  visible.value = false;
}
</script>

<template>
  <a-tabs :animation="true" :justify="true" size="large" :destroy-on-hide="true" :lazy-load="true">
    <a-tab-pane key="1">
      <template #title>
        <icon-apps /> 商家版
      </template>
      <Shop />
    </a-tab-pane>
   
  </a-tabs>
  <a-modal v-model:visible="visible" @ok="handleOk" @cancel="handleCancel">
    <template #title>
      更新提示
    </template>
    <div>有新的更新可用 {{ download }}</div>
  </a-modal>
</template>

<style>
.arco-tabs-nav-tab {
  display: flex;
  justify-content: center;
  font-size: 16px;
}
</style>
$env:TAURI_SIGNING_PRIVATE_KEY="dW50cnVzdGVkIGNvbW1lbnQ6IHJzaWduIGVuY3J5cHRlZCBzZWNyZXQga2V5ClJXUlRZMEl5eGhDWUxPMGtBWExZa0RMZllCcGgreHk1dlZycVNIMDBxTFpqMnNLVE94b0FBQkFBQUFBQUFBQUFBQUlBQUFBQUhNQnFFQmVKWk1Idks5QnQ1ZmlnV2V5Zm5YVmpQZjVQUkZsY09iVVF0bWFwbFpRYXJKejVzVFNQRzZBVC9UOGxrNHpwUGt6UzF5TEViSmRBWGtacURyRGNuMzBMVkorK2s3QjJIQVl6QU9tOGQvcG05cW54N2pYOXd2Y1pWckRsbkVtU2FRdHJwaUU9Cg=="
# optionally also add a password
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD="fgmkf@qq.com"