import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { CarOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils';

/**
 * 车场管理路由
 */
const routes: Array<RouteRecordRaw> = [
  {
    path: '/parking',
    name: 'Parking',
    redirect: '/parking/system-settings',
    component: Layout,
    meta: {
      title: '车场管理',
      icon: renderIcon(CarOutlined),
      flatMenu: true,
      sort: 2,
    },
    children: [
      {
        path: 'system-settings',
        name: 'SystemSettings',
        meta: {
          title: '系统设置',
        },
        component: () => import('@/views/parking/system-settings/index.vue'),
      },
      {
        path: 'fee-rules',
        name: 'FeeRules',
        meta: {
          title: '收费规则设置',
        },
        component: () => import('@/views/parking/fee-rules/index.vue'),
      },
      {
        path: 'records',
        name: 'ParkingRecords',
        meta: {
          title: '车辆进出场记录',
        },
        component: () => import('@/views/parking/records/index.vue'),
      },
      {
        path: 'members',
        name: 'MemberVehicles',
        meta: {
          title: '车场会员车辆管理',
        },
        component: () => import('@/views/parking/members/index.vue'),
      },
      {
        path: 'users',
        name: 'UserManagement',
        meta: {
          title: '用户管理',
        },
        component: () => import('@/views/parking/users/index.vue'),
      },
      {
        path: 'logs',
        name: 'LogManagement',
        meta: {
          title: '日志管理',
        },
        component: () => import('@/views/parking/logs/index.vue'),
      },
    ],
  },
];

export default routes;
