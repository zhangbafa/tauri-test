/**
 * 基础路由
 * @type { *[] }
 */
export const Layout = () => import("@/layout/default-layout.vue");

const constantRouterMap = [
  {
    path: "/",
    name: "index",
    redirect:'/index',
    component: Layout,
    children: [
      {
        path: "/index",
        name: "Index",
        component: () => import("@/views/index.vue"),
        meta: {
          ignoreCache: false,
        },
      },
    ],
  },
  // {
  //   path: "/",
  //   name: "Assistant",
  //   redirect:'/assistant',
  //   component: Layout,
  //   children: [
  //     {
  //       path: "/assistant",
  //       name: "AssistantIndex",
  //       component: () => import("@/views/assistant/index.vue"),
  //     },
  //     {
  //       path: "/assistant/create",
  //       name: "AssistantCreate",
  //       component: () => import("@/views/assistant/create.vue"),
  //     },
  //     {
  //       path: "/assistant/voicetimbre",
  //       name: "AssistantVoiceTimbre",
  //       component: () => import("@/views/assistant/voicetimbre.vue"),
  //     },
  //     {
  //       path: "/assistant/setting",
  //       name: "AssistantSetting",
  //       component: () => import("@/views/assistant/setting.vue"),
  //     },
      
  //   ]
  // },
  // {
  //   path: "/shop",
  //   name: "Shop",
  //   component: Layout,
  //   children: [
  //     {
  //       path: "/shop",
  //       name: "ShopIndex",
  //       component: () => import("@/views/shop.vue"),
  //     },
  //   ],
  // }
];

export default constantRouterMap;