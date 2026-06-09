<template>
  <div class="page-container">
    <n-card title="车场会员车辆管理">
      <n-space vertical :size="16">
        <!-- 操作按钮 -->
        <n-space>
          <n-button type="primary" @click="handleAdd">
            新增会员车辆
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
        <n-form-item label="车牌号" path="plate_no">
          <n-input
            v-model:value="formData.plate_no"
            placeholder="请输入车牌号"
            :disabled="isEdit"
          />
        </n-form-item>

        <n-form-item label="会员类型" path="member_type">
          <n-select
            v-model:value="formData.member_type"
            :options="memberTypeOptions"
            placeholder="请选择会员类型"
          />
        </n-form-item>

        <n-form-item label="有效期" path="expire_at">
          <n-date-picker
            v-model:value="formData.expire_at"
            type="datetime"
            placeholder="请选择有效期"
            style="width: 100%"
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
import {
  getMemberVehicles,
  createMemberVehicle,
  updateMemberVehicle,
  deleteMemberVehicle,
} from '@/api/http.js';
import dayjs from 'dayjs';

const message = useMessage();
const dialog = useDialog();
const formRef = ref();
const loading = ref(false);
const tableData = ref([]);
const showModal = ref(false);
const isEdit = ref(false);
const modalTitle = ref('新增会员车辆');

// 表单数据
const formData = reactive({
  id: null,
  plate_no: '',
  member_type: 'month',
  expire_at: null,
  status: 'enabled',
  remark: '',
});

// 会员类型选项
const memberTypeOptions = [
  { label: '月卡', value: 'month' },
  { label: '年卡', value: 'year' },
  { label: 'VIP', value: 'vip' },
];

// 表单验证规则
const rules = {
  plate_no: {
    required: true,
    message: '请输入车牌号',
    trigger: 'blur',
  },
  member_type: {
    required: true,
    message: '请选择会员类型',
    trigger: 'change',
  },
  expire_at: {
    required: true,
    type: 'number',
    message: '请选择有效期',
    trigger: 'change',
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
    title: '车牌号',
    key: 'plate_no',
    width: 120,
  },
  {
    title: '会员类型',
    key: 'member_type',
    width: 100,
    render(row: any) {
      const typeMap: Record<string, string> = {
        month: '月卡',
        year: '年卡',
        vip: 'VIP',
      };
      return typeMap[row.member_type] || row.member_type;
    },
  },
  {
    title: '有效期',
    key: 'expire_at',
    width: 180,
    render(row: any) {
      return h(NTime, { time: new Date(row.expire_at), format: 'yyyy-MM-dd HH:mm:ss' });
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row: any) {
      const isExpired = dayjs(row.expire_at).isBefore(dayjs());
      const isDisabled = row.status === 'disabled';

      let type: any = 'success';
      let text = '正常';

      if (isDisabled) {
        type = 'default';
        text = '已禁用';
      } else if (isExpired) {
        type = 'error';
        text = '已过期';
      }

      return h(NTag, { type }, { default: () => text });
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
    width: 180,
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
    const res = await getMemberVehicles({
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
  modalTitle.value = '新增会员车辆';
  formData.id = null;
  formData.plate_no = '';
  formData.member_type = 'month';
  formData.expire_at = null;
  formData.status = 'enabled';
  formData.remark = '';
  showModal.value = true;
};

// 编辑
const handleEdit = (row: any) => {
  isEdit.value = true;
  modalTitle.value = '编辑会员车辆';
  formData.id = row.id;
  formData.plate_no = row.plate_no;
  formData.member_type = row.member_type;
  formData.expire_at = new Date(row.expire_at).getTime();
  formData.status = row.status;
  formData.remark = row.remark || '';
  showModal.value = true;
};

// 删除
const handleDelete = (row: any) => {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除车牌号为 ${row.plate_no} 的会员车辆吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteMemberVehicle(row.id);
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

    const data = {
      ...formData,
      expire_at: dayjs(formData.expire_at).format('YYYY-MM-DD HH:mm:ss'),
    };

    if (isEdit.value) {
      await updateMemberVehicle(formData.id, data);
      message.success('更新成功');
    } else {
      await createMemberVehicle(data);
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
