<template>
  <div class="page-container">
    <n-card title="用户管理">
      <n-space vertical :size="16">
        <!-- 操作按钮 -->
        <n-space>
          <n-button type="primary" @click="handleAdd">
            新增用户
          </n-button>
        </n-space>

        <!-- 表格 -->
        <n-data-table
          :columns="columns"
          :data="tableData"
          :loading="loading"
          :pagination="pagination"
          :bordered="false"
        />
      </n-space>
    </n-card>

    <!-- 新增/编辑弹窗 -->
    <n-modal
      v-model:show="showModal"
      :title="modalTitle"
      preset="dialog"
      :positive-text="'确定'"
      :negative-text="'取消'"
      @positive-click="handleSubmit"
      @negative-click="showModal = false"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="100"
        style="margin-top: 20px"
      >
        <n-form-item label="用户名" path="username">
          <n-input
            v-model:value="formData.username"
            placeholder="请输入用户名"
            :disabled="isEdit"
          />
        </n-form-item>

        <n-form-item v-if="!isEdit" label="密码" path="password">
          <n-input
            v-model:value="formData.password"
            type="password"
            placeholder="请输入密码"
          />
        </n-form-item>

        <n-form-item label="状态" path="status">
          <n-radio-group v-model:value="formData.status">
            <n-space>
              <n-radio value="enabled" label="启用" />
              <n-radio value="disabled" label="禁用" />
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="备注" path="remark">
          <n-input
            v-model:value="formData.remark"
            type="textarea"
            placeholder="请输入备注"
            :rows="3"
          />
        </n-form-item>
      </n-form>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue';
import { useMessage, useDialog, NButton, NSpace, NTag, NTime } from 'naive-ui';
import { getUsers, createUser, updateUser, deleteUser } from '@/api/http.js';

const message = useMessage();
const dialog = useDialog();
const formRef = ref();
const loading = ref(false);
const tableData = ref([]);
const showModal = ref(false);
const isEdit = ref(false);
const modalTitle = ref('新增用户');

// 表单数据
const formData = reactive({
  id: null,
  username: '',
  password: '',
  status: 'enabled',
  remark: '',
});

// 表单验证规则
const rules = {
  username: {
    required: true,
    message: '请输入用户名',
    trigger: 'blur',
  },
  password: {
    required: true,
    message: '请输入密码',
    trigger: 'blur',
  },
  status: {
    required: true,
    message: '请选择状态',
    trigger: 'change',
  },
};

// 表格列定义
const columns = [
  {
    title: '用户名',
    key: 'username',
    width: 150,
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row: any) {
      return h(
        NTag,
        {
          type: row.status === 'enabled' ? 'success' : 'default',
        },
        {
          default: () => (row.status === 'enabled' ? '启用' : '禁用'),
        }
      );
    },
  },
  {
    title: '创建时间',
    key: 'created_at',
    width: 180,
    render(row: any) {
      return row.created_at
        ? h(NTime, { time: new Date(row.created_at), format: 'yyyy-MM-dd HH:mm:ss' })
        : '-';
    },
  },
  {
    title: '最近登录',
    key: 'last_login_at',
    width: 180,
    render(row: any) {
      return row.last_login_at
        ? h(NTime, { time: new Date(row.last_login_at), format: 'yyyy-MM-dd HH:mm:ss' })
        : '-';
    },
  },
  {
    title: '备注',
    key: 'remark',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render(row: any) {
      return h(
        NSpace,
        {},
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                onClick: () => handleEdit(row),
              },
              { default: () => '编辑' }
            ),
            h(
              NButton,
              {
                size: 'small',
                type: row.status === 'enabled' ? 'warning' : 'success',
                onClick: () => handleToggleStatus(row),
              },
              { default: () => (row.status === 'enabled' ? '禁用' : '启用') }
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                onClick: () => handleDelete(row),
              },
              { default: () => '删除' }
            ),
          ],
        }
      );
    },
  },
];

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    pagination.page = page;
    loadData();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    loadData();
  },
  itemCount: 0,
  prefix: (info: any) => {
    return `共 ${info.itemCount} 条`;
  },
});

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const res = await getUsers({
      page: pagination.page,
      pageSize: pagination.pageSize,
    });
    if (res && res.data) {
      tableData.value = res.data.list || [];
      pagination.itemCount = res.data.total || 0;
    }
  } catch (error) {
    message.error('加载数据失败');
  } finally {
    loading.value = false;
  }
};

// 新增
const handleAdd = () => {
  isEdit.value = false;
  modalTitle.value = '新增用户';
  formData.id = null;
  formData.username = '';
  formData.password = '';
  formData.status = 'enabled';
  formData.remark = '';
  showModal.value = true;
};

// 编辑
const handleEdit = (row: any) => {
  isEdit.value = true;
  modalTitle.value = '编辑用户';
  formData.id = row.id;
  formData.username = row.username;
  formData.password = '';
  formData.status = row.status;
  formData.remark = row.remark || '';
  showModal.value = true;
};

// 切换状态
const handleToggleStatus = (row: any) => {
  const newStatus = row.status === 'enabled' ? 'disabled' : 'enabled';
  const action = newStatus === 'enabled' ? '启用' : '禁用';

  dialog.warning({
    title: `确认${action}`,
    content: `确定要${action}用户 ${row.username} 吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await updateUser(row.id, { status: newStatus });
        message.success(`${action}成功`);
        loadData();
      } catch (error) {
        message.error(`${action}失败`);
      }
    },
  });
};

// 删除
const handleDelete = (row: any) => {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除用户 ${row.username} 吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteUser(row.id);
        message.success('删除成功');
        loadData();
      } catch (error) {
        message.error('删除失败');
      }
    },
  });
};

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();

    if (isEdit.value) {
      const data: any = {
        status: formData.status,
        remark: formData.remark,
      };
      await updateUser(formData.id, data);
      message.success('更新成功');
    } else {
      await createUser(formData);
      message.success('新增成功');
    }

    showModal.value = false;
    loadData();
  } catch (error) {
    if (error?.errors) {
      message.error('请检查表单填写是否正确');
    } else {
      message.error(isEdit.value ? '更新失败' : '新增失败');
    }
    return false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="less">
.page-container {
  padding: 16px;
}
</style>
