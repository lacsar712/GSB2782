<template>
  <div class="page-container">
    <n-card title="日志管理">
      <n-tabs v-model:value="activeTab" type="line" @update:value="handleTabChange">
        <n-tab-pane name="login" tab="登录日志">
          <n-data-table
            :columns="loginColumns"
            :data="loginTableData"
            :loading="loginLoading"
            :pagination="loginPagination"
            :bordered="false"
          />
        </n-tab-pane>

        <n-tab-pane name="operation" tab="操作日志">
          <n-data-table
            :columns="opColumns"
            :data="opTableData"
            :loading="opLoading"
            :pagination="opPagination"
            :bordered="false"
          />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue';
import { useMessage, NTag, NTime } from 'naive-ui';
import { getLoginLogs, getOpLogs } from '@/api/http.js';

const message = useMessage();
const activeTab = ref('login');

// 登录日志
const loginLoading = ref(false);
const loginTableData = ref([]);

// 登录日志列定义
const loginColumns = [
  {
    title: '用户名',
    key: 'username',
    width: 150,
  },
  {
    title: 'IP地址',
    key: 'ip',
    width: 150,
  },
  {
    title: '登录时间',
    key: 'created_at',
    width: 180,
    render(row: any) {
      return h(NTime, { time: new Date(row.created_at), format: 'yyyy-MM-dd HH:mm:ss' });
    },
  },
  {
    title: '结果',
    key: 'success',
    width: 100,
    render(row: any) {
      return h(
        NTag,
        {
          type: row.success ? 'success' : 'error',
        },
        {
          default: () => (row.success ? '成功' : '失败'),
        }
      );
    },
  },
  {
    title: 'User Agent',
    key: 'user_agent',
    ellipsis: {
      tooltip: true,
    },
  },
];

// 登录日志分页配置
const loginPagination = reactive({
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [20, 50, 100],
  onChange: (page: number) => {
    loginPagination.page = page;
    loadLoginLogs();
  },
  onUpdatePageSize: (pageSize: number) => {
    loginPagination.pageSize = pageSize;
    loginPagination.page = 1;
    loadLoginLogs();
  },
  itemCount: 0,
  prefix: (info: any) => {
    return `共 ${info.itemCount} 条`;
  },
});

// 操作日志
const opLoading = ref(false);
const opTableData = ref([]);

// 操作日志列定义
const opColumns = [
  {
    title: '用户名',
    key: 'username',
    width: 150,
  },
  {
    title: 'IP地址',
    key: 'ip',
    width: 150,
  },
  {
    title: '操作时间',
    key: 'created_at',
    width: 180,
    render(row: any) {
      return h(NTime, { time: new Date(row.created_at), format: 'yyyy-MM-dd HH:mm:ss' });
    },
  },
  {
    title: '操作类型',
    key: 'action',
    width: 200,
    render(row: any) {
      const actionMap: Record<string, string> = {
        UPDATE_SETTINGS: '更新系统设置',
        UPDATE_FEE_RULE: '更新收费规则',
        CREATE_USER: '创建用户',
        UPDATE_USER: '更新用户',
        DELETE_USER: '删除用户',
        CREATE_MEMBER: '创建会员车辆',
        UPDATE_MEMBER: '更新会员车辆',
        DELETE_MEMBER: '删除会员车辆',
      };
      return actionMap[row.action] || row.action;
    },
  },
  {
    title: '详情',
    key: 'detail',
    ellipsis: {
      tooltip: true,
    },
  },
];

// 操作日志分页配置
const opPagination = reactive({
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [20, 50, 100],
  onChange: (page: number) => {
    opPagination.page = page;
    loadOpLogs();
  },
  onUpdatePageSize: (pageSize: number) => {
    opPagination.pageSize = pageSize;
    opPagination.page = 1;
    loadOpLogs();
  },
  itemCount: 0,
  prefix: (info: any) => {
    return `共 ${info.itemCount} 条`;
  },
});

// 加载登录日志
const loadLoginLogs = async () => {
  loginLoading.value = true;
  try {
    const res = await getLoginLogs({
      page: loginPagination.page,
      pageSize: loginPagination.pageSize,
    });
    if (res && res.data) {
      loginTableData.value = res.data.list || [];
      loginPagination.itemCount = res.data.total || 0;
    }
  } catch (error) {
    message.error('加载登录日志失败');
  } finally {
    loginLoading.value = false;
  }
};

// 加载操作日志
const loadOpLogs = async () => {
  opLoading.value = true;
  try {
    const res = await getOpLogs({
      page: opPagination.page,
      pageSize: opPagination.pageSize,
    });
    if (res && res.data) {
      opTableData.value = res.data.list || [];
      opPagination.itemCount = res.data.total || 0;
    }
  } catch (error) {
    message.error('加载操作日志失败');
  } finally {
    opLoading.value = false;
  }
};

// Tab切换
const handleTabChange = (value: string) => {
  if (value === 'login') {
    loadLoginLogs();
  } else if (value === 'operation') {
    loadOpLogs();
  }
};

onMounted(() => {
  loadLoginLogs();
});
</script>

<style scoped lang="less">
.page-container {
  padding: 16px;
}
</style>
