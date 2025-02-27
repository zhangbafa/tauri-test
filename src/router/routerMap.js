/**
 * 基础路由
 * @type { *[] }
 */
export const Layout = () => import("@/layout/speech-layout.vue");

const constantRouterMap = [
  {
    path: "/",
    name: "index",
    redirect:'/index',
    // component: Layout,
    children: [
      {
        path: "/index",
        name: "Index",
        component: () => import("@/views/home.vue"),
        meta: {
          ignoreCache: false,
        },
      },
    ],
  },
  {
    path: "/dashboard",
    name: "dashboard",
    // component: Layout,
    children: [
      {
        path: "/dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard.vue"),
        meta: {
          ignoreCache: false,
        },
      },
    ],
  },
  {
    path: "/lab",
    name: "lab",
    // component: Layout,
    redirect: "/lab/welcome",
    children: [
      {
        path: "",
        name: "Lab",
        component: () => import("@/views/lab/index.vue"),
        children: [
          {
            path: "welcome",
            name: "LabWelcome",
            component: () => import("@/views/lab/welcome.vue")
          },
          {
            path: "douyin-products",
            name: "DouyinProducts",
            component: () => import("@/views/lab/douyin-products.vue")
          }
        ],
        meta: {
          ignoreCache: false,
        }
      },
    ],
  },
  {
    path: "/goods",
    name: "goods",
    // component: Layout,
    children: [
      {
        path: "/goods",
        name: "Goods",
        component: () => import("@/views/goods.vue"),
        meta: {
          ignoreCache: false,
        },
      },
    ],
  },
  {
    path: "/video",
    name: "video",
    children: [
      {
        path: "/video",
        name: "Video",
        component: () => import("@/components/smartscene/smart.vue"),
        meta: {
          ignoreCache: false,
        },
      },
    ],
  }
];

export default constantRouterMap;
