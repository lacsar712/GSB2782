<template>
  <div class="page-container">
    <n-card title="车辆进出场记录">
      <!-- 筛选区 -->
      <n-space vertical :size="16">
        <n-form inline :label-width="80">
          <n-form-item label="车牌号">
            <n-input
              v-model:value="queryParams.plate_no"
              placeholder="请输入车牌号"
              clearable
              style="width: 200px"
            />
          </n-form-item>
          <n-form-item label="状态">
            <n-select
              v-model:value="queryParams.status"
              :options="statusOptions"
              placeholder="请选择状态"
              clearable
              style="width: 150px"
            />
          </n-form-item>
          <n-form-item label="时间范围">
            <n-date-picker
              v-model:value="dateRange"
              type="daterange"
              clearable
              style="width: 300px"
            />
          </n-form-item>
          <n-form-item>
            <n-space>
              <n-button type="primary" @click="handleSearch"> 查询 </n-button>
              <n-button @click="handleReset">重置</n-button>
            </n-space>
          </n-form-item>
        </n-form>

        <!-- 表格 -->
        <n-data-table
          :columns="columns"
          :data="tableData"
          :loading="loading"
          remote
          :pagination="pagination"
          :bordered="false"
        />
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, h, onMounted } from 'vue';
  import { useMessage, NTag, NTime } from 'naive-ui';
  import { getParkingRecords } from '@/api/http.js';
  import dayjs from 'dayjs';

  const message = useMessage();
  const loading = ref(false);
  const tableData = ref([]);
  const dateRange = ref<[number, number] | null>(null);

  // 查询参数
  const queryParams = reactive({
    plate_no: '',
    status: null,
    start: '',
    end: '',
    page: 1,
    pageSize: 10,
  });

  // 状态选项
  const statusOptions = [
    { label: '全部', value: null },
    { label: '在场', value: 'in' },
    { label: '已离场', value: 'out' },
  ];

  // 表格列定义
  const columns = [
    {
      title: '车牌号',
      key: 'plate_no',
      width: 120,
    },
    {
      title: '车牌颜色',
      key: 'plate_color',
      width: 100,
      render(row: any) {
        const colorMap: Record<string, string> = {
          blue: '蓝色',
          yellow: '黄色',
          green: '绿色',
          black: '黑色',
          white: '白色',
        };
        return colorMap[row.plate_color] || row.plate_color;
      },
    },
    {
      title: '车辆类型',
      key: 'vehicle_type',
      width: 100,
      render(row: any) {
        const typeMap: Record<string, string> = {
          normal: '普通车辆',
          special: '特种车辆',
          member: '会员车辆',
        };
        return typeMap[row.vehicle_type] || row.vehicle_type;
      },
    },
    {
      title: '进场时间',
      key: 'in_time',
      width: 180,
      render(row: any) {
        return h(NTime, { time: new Date(row.in_time), format: 'yyyy-MM-dd HH:mm:ss' });
      },
    },
    {
      title: '出场时间',
      key: 'out_time',
      width: 180,
      render(row: any) {
        return row.out_time
          ? h(NTime, { time: new Date(row.out_time), format: 'yyyy-MM-dd HH:mm:ss' })
          : '-';
      },
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render(row: any) {
        return h(
          NTag,
          {
            type: row.status === 'in' ? 'success' : 'default',
          },
          {
            default: () => (row.status === 'in' ? '在场' : '已离场'),
          }
        );
      },
    },
    {
      title: '停车时长',
      key: 'duration',
      width: 120,
      render(row: any) {
        if (row.status === 'out' && row.out_time) {
          const inTime = dayjs(row.in_time);
          const outTime = dayjs(row.out_time);
          const minutes = outTime.diff(inTime, 'minute');
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
        }
        return '-';
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
      queryParams.page = page;
      loadData();
    },
    onUpdatePageSize: (pageSize: number) => {
      pagination.pageSize = pageSize;
      pagination.page = 1;
      queryParams.pageSize = pageSize;
      queryParams.page = 1;
      loadData();
    },
    itemCount: 0,
    prefix: () => {
      return `共 ${pagination.itemCount} 条`;
    },
  });

  // 加载数据
  const loadData = async () => {
    loading.value = true;
    try {
      // 处理日期范围
      if (dateRange.value) {
        queryParams.start = dayjs(dateRange.value[0]).format('YYYY-MM-DD');
        queryParams.end = dayjs(dateRange.value[1]).format('YYYY-MM-DD');
      } else {
        queryParams.start = '';
        queryParams.end = '';
      }

      const res = await getParkingRecords(queryParams);
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

  // 查询
  const handleSearch = () => {
    pagination.page = 1;
    queryParams.page = 1;
    loadData();
  };

  // 重置
  const handleReset = () => {
    queryParams.plate_no = '';
    queryParams.status = null;
    dateRange.value = null;
    queryParams.start = '';
    queryParams.end = '';
    pagination.page = 1;
    queryParams.page = 1;
    loadData();
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
