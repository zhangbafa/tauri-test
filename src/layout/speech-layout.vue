<template>
  <a-layout class="layout-demo">
    <a-layout-sider hide-trigger :collapsible="false" :width="0"
      style="position: relative;-webkit-app-region: drag;-webkit-user-select: none;" class="draggable">
      <div>
        <div class="ele-menu ele-menu-hover" :class="{ active: this.$route.path === '/dashboard' }">
          <router-link to="/dashboard">
            <icon-video-camera size="26" strokeLinecap="round" :strokeWidth="4" /> 
            <span class="item">直播中控</span>
          </router-link>
        </div>
        <div class="ele-menu ele-menu-hover" :class="{ active: this.$route.path === '/' }">
          <router-link to="/">
            <icon-video-camera size="26" strokeLinecap="round" :strokeWidth="4" /> 
            <span class="item">主播设置</span>
          </router-link>
        </div>
        <div class="ele-menu ele-menu-hover">
          <RouterLink to="/lab/welcome">
            <!-- <icon-experiment /> -->
            <icon-experiment size="26" strokeLinecap="round" :strokeWidth="4" />
            <div class="item">实验</div>
          </RouterLink>
        </div>
        <!-- <div class="ele-menu ele-menu-hover" :class="{ active: this.$route.path==='/recycle/index' }">
            <RouterLink to="/recycle">
            <icon-delete size="26" strokeLinecap="round" :strokeWidth="4"/>
            <div class="item">回收站</div> </RouterLink>
          </div> -->

      </div>

      <div class="ele-footer-menu" style="display: none;">

      </div>
    </a-layout-sider>
    <a-layout>
      <a-layout>
        <a-layout-content :style="{ padding: '0px 10px' }">
          <router-view v-slot="{ Component, route }">
            <transition>
              <component :is="Component" :key="route.fullPath" />
            </transition>
          </router-view>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>
<script>
import { defineComponent, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue';
import {
  IconCaretRight,
  IconCaretLeft,
  IconHome,
  IconCalendar,
} from '@arco-design/web-vue/es/icon';


export default defineComponent({
  components: {
    IconCaretRight,
    IconCaretLeft,
    IconHome,
    IconCalendar,
  },
  setup() {
    const collapsed = ref(false);
    const cacheList = ''
    const handlerSearch = () => {
      Message.info("sarch....")
      window.versions.say()
    }


    return {

      cacheList,
      collapsed,
      onClickMenuItem(key) {
        Message.info({ content: `You select ${key}`, showIcon: true });
      }
    };
  },
});
</script>
<style scoped>
body {
  background-color: var(--color-bg-1);
  color: var(--color-text-1);
}

.layout-demo {
  height: calc(100vh - 2px);
  background: var(--color-fill-2);
  border: 1px solid var(--color-border);
}

.layout-demo :deep(.arco-layout-sider) {
  background: rgb(240,243,246);
  box-shadow: none
}

.layout-demo :deep(.arco-layout-sider-light) .logo {
  background: var(--color-fill-2);
}

.layout-demo :deep(.arco-layout-header) {
  height: 64px;
  line-height: 64px;
  background: var(--color-bg-3);
}

.layout-demo :deep(.arco-layout-footer) {
  height: 48px;
  color: var(--color-text-2);
  font-weight: 400;
  font-size: 14px;
  line-height: 48px;
}

.layout-demo :deep(.arco-layout-content) {
  /* background: var(--color-bg-3);  */
  background-image: linear-gradient(-180deg,
      rgb(247,249,252),
      rgb(247,249,252) 8%);
}

.layout-demo :deep(.arco-layout-footer) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: var(--color-white);
  font-size: 16px;
  font-stretch: condensed;
  text-align: center;
}

.ele-menu {
  text-align: center;
  margin-top: 25px;
  -webkit-app-region: no-drag;
  position: relative;  
}

.ele-menu:hover {
  cursor: pointer;
}

.ele-menu .item {
  font-size: 1em;
  font-weight: 400;
  margin-left: 8px;
}

.ele-menu a {
  text-decoration: none;
  color: rgb(var(--gray-8));
  display: block;
  padding: 4px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-left: 20px;
}

.ele-menu.active .arco-icon,
.ele-menu.active .item {
  color: rgb(var(--primary-6));
}

.ele-menu-hover:hover .arco-icon,
.ele-menu-hover:hover .item {
  color: rgb(var(--primary-6));
}

.ele-footer-menu {
  position: absolute;
  bottom: 30px;
  text-align: center;
  width: 100%;
}

/* 下面我们会解释这些 class 是做什么的 */
.v-enter-active,
.v-leave-active {
  transition: all 0.8s;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>