import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue';
import App from './App.vue';
import Router from './router/index';
import '@arco-design/web-vue/dist/arco.css';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';


const app = createApp(App);

app.use(Router)
.use(ArcoVue)
.use(ArcoVueIcon)
.mount('#app');