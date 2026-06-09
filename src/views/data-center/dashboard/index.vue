<template>
  <div class="dashboard-container">
    <n-space vertical :size="16">
      <!-- 时间范围切换 -->
      <n-card>
        <n-space>
          <n-button-group>
            <n-button
              :type="timeRange === 7 ? 'primary' : 'default'"
              @click="changeTimeRange(7)"
            >
              近7天
            </n-button>
            <n-button
              :type="timeRange === 30 ? 'primary' : 'default'"
              @click="changeTimeRange(30)"
            >
              近30天
            </n-button>
          </n-button-group>
        </n-space>
      </n-card>

      <!-- 指标卡片 -->
      <n-grid :cols="5" :x-gap="16">
        <n-grid-item>
          <n-card title="进出场车辆总数" :bordered="false">
            <n-statistic :value="summary.total_vehicle_events || 0">
              <template #suffix>辆</template>
            </n-statistic>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card title="总订单数" :bordered="false">
            <n-statistic :value="summary.total_orders || 0">
              <template #suffix>单</template>
            </n-statistic>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card title="总收入" :bordered="false">
            <n-statistic :value="summary.total_revenue || 0">
              <template #prefix>¥</template>
            </n-statistic>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card title="摄像头设备数" :bordered="false">
            <n-statistic :value="summary.camera_count || 0">
              <template #suffix>个</template>
            </n-statistic>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card title="空余车位数" :bordered="false">
            <n-statistic :value="summary.free_slots || 0">
              <template #suffix>个</template>
            </n-statistic>
          </n-card>
        </n-grid-item>
      </n-grid>

      <!-- 图表 -->
      <n-grid :cols="1" :x-gap="16" :y-gap="16">
        <n-grid-item>
          <n-card title="进出场车辆数量" :bordered="false">
            <div ref="vehicleChartRef" style="height: 400px"></div>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card title="收入统计" :bordered="false">
            <div ref="revenueChartRef" style="height: 400px"></div>
          </n-card>
        </n-grid-item>
      </n-grid>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useMessage } from 'naive-ui';
import * as echarts from 'echarts';
import { getDashboardSummary, getDashboardCharts } from '@/api/http.js';

const message = useMessage();

// 数据
const timeRange = ref(7);
const summary = ref({
  total_vehicle_events: 0,
  total_orders: 0,
  total_revenue: 0,
  camera_count: 0,
  free_slots: 0,
});

const chartData = ref({
  days: [],
  vehicle_counts: [],
  revenue_amounts: [],
});

// 图表实例
const vehicleChartRef = ref<HTMLElement>();
const revenueChartRef = ref<HTMLElement>();
let vehicleChart: echarts.ECharts | null = null;
let revenueChart: echarts.ECharts | null = null;

// 加载汇总数据
const loadSummary = async () => {
  try {
    const res = await getDashboardSummary();
    if (res && res.data) {
      summary.value = res.data;
    }
  } catch (error) {
    message.error('加载汇总数据失败');
  }
};

// 加载图表数据
const loadCharts = async () => {
  try {
    const res = await getDashboardCharts(timeRange.value);
    if (res && res.data) {
      chartData.value = res.data;
      updateCharts();
    }
  } catch (error) {
    message.error('加载图表数据失败');
  }
};

// 初始化图表
const initCharts = () => {
  if (vehicleChartRef.value) {
    vehicleChart = echarts.init(vehicleChartRef.value);
  }
  if (revenueChartRef.value) {
    revenueChart = echarts.init(revenueChartRef.value);
  }
  updateCharts();
};

// 更新图表
const updateCharts = () => {
  // 车辆数量图表
  if (vehicleChart) {
    vehicleChart.setOption({
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: chartData.value.days,
      },
      yAxis: {
        type: 'value',
        name: '车辆数（辆）',
      },
      series: [
        {
          name: '车辆数',
          type: 'bar',
          data: chartData.value.vehicle_counts,
          itemStyle: {
            color: '#18a058',
          },
        },
      ],
    });
  }

  // 收入图表
  if (revenueChart) {
    revenueChart.setOption({
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const param = params[0];
          return `${param.name}<br/>${param.seriesName}: ¥${param.value}`;
        },
      },
      xAxis: {
        type: 'category',
        data: chartData.value.days,
      },
      yAxis: {
        type: 'value',
        name: '收入（元）',
      },
      series: [
        {
          name: '收入',
          type: 'bar',
          data: chartData.value.revenue_amounts,
          itemStyle: {
            color: '#2080f0',
          },
        },
      ],
    });
  }
};

// 切换时间范围
const changeTimeRange = (range: number) => {
  timeRange.value = range;
  loadCharts();
};

// 窗口大小改变时重新调整图表
const handleResize = () => {
  vehicleChart?.resize();
  revenueChart?.resize();
};

onMounted(async () => {
  await loadSummary();
  await nextTick();
  initCharts();
  await loadCharts();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  vehicleChart?.dispose();
  revenueChart?.dispose();
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped lang="less">
.dashboard-container {
  padding: 16px;
}
</style>
