import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { DashboardOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils';

/**
 * 数据中心路由
 */
const routes: Array<RouteRecordRaw> = [
  {
    path: '/data-center',
    name: 'DataCenter',
    redirect: '/data-center/dashboard',
    component: Layout,
    meta: {
      title: '数据中心',
      icon: renderIcon(DashboardOutlined),
      sort: 1,
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        meta: {
          title: '数据看板',
        },
        component: () => import('@/views/data-center/dashboard/index.vue'),
      },
    ],
  },
];

export default routes;
