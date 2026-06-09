<template>
  <div class="page-container">
    <n-card title="收费规则设置">
      <n-spin :show="loading">
        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-placement="left"
          label-width="140"
          require-mark-placement="right-hanging"
        >
          <n-form-item label="免费分钟数" path="free_minutes">
            <n-input-number
              v-model:value="formData.free_minutes"
              :min="0"
              :max="120"
              :step="5"
              placeholder="请输入免费分钟数"
              style="width: 300px"
            >
              <template #suffix>分钟</template>
            </n-input-number>
            <template #feedback>
              <n-text depth="3" style="font-size: 12px">
                设置0-120分钟，超过免费时长后开始计费
              </n-text>
            </template>
          </n-form-item>

          <n-form-item label="每小时单价" path="price_per_hour">
            <n-input-number
              v-model:value="formData.price_per_hour"
              :min="0"
              :precision="2"
              :step="0.5"
              placeholder="请输入每小时单价"
              style="width: 300px"
            >
              <template #prefix>¥</template>
              <template #suffix>元/小时</template>
            </n-input-number>
          </n-form-item>

          <n-form-item label="日封顶金额" path="daily_cap">
            <n-input-number
              v-model:value="formData.daily_cap"
              :min="0"
              :precision="2"
              :step="10"
              placeholder="请输入日封顶金额"
              style="width: 300px"
            >
              <template #prefix>¥</template>
              <template #suffix>元</template>
            </n-input-number>
            <template #feedback>
              <n-text depth="3" style="font-size: 12px">
                设置为0表示不封顶
              </n-text>
            </template>
          </n-form-item>

          <n-form-item label="计费取整规则" path="rounding">
            <n-radio-group v-model:value="formData.rounding">
              <n-space vertical>
                <n-radio value="30min_up" label="30分钟进位">
                  <template #default>
                    <div>
                      <div>30分钟进位</div>
                      <n-text depth="3" style="font-size: 12px">
                        不足30分钟按30分钟计费，超过30分钟按1小时计费
                      </n-text>
                    </div>
                  </template>
                </n-radio>
                <n-radio value="60min_up" label="60分钟进位">
                  <template #default>
                    <div>
                      <div>60分钟进位</div>
                      <n-text depth="3" style="font-size: 12px">
                        不足1小时按1小时计费
                      </n-text>
                    </div>
                  </template>
                </n-radio>
              </n-space>
            </n-radio-group>
          </n-form-item>

          <n-divider />

          <n-form-item label="计费示例">
            <n-card size="small" style="width: 600px">
              <n-space vertical>
                <n-text>
                  <n-text strong>免费时长：</n-text>
                  {{ formData.free_minutes }} 分钟
                </n-text>
                <n-text>
                  <n-text strong>计费标准：</n-text>
                  ¥{{ formData.price_per_hour }}/小时
                </n-text>
                <n-text>
                  <n-text strong>日封顶：</n-text>
                  {{ formData.daily_cap > 0 ? `¥${formData.daily_cap}` : '不封顶' }}
                </n-text>
                <n-text>
                  <n-text strong>取整规则：</n-text>
                  {{ formData.rounding === '30min_up' ? '30分钟进位' : '60分钟进位' }}
                </n-text>
                <n-divider style="margin: 8px 0" />
                <n-space align="center">
                  <n-text strong>试算停车时长：</n-text>
                  <n-input-number
                    v-model:value="estimateMinutes"
                    :min="0"
                    :step="5"
                    placeholder="请输入停车分钟数"
                    style="width: 200px"
                  >
                    <template #suffix>分钟</template>
                  </n-input-number>
                </n-space>
                <n-text depth="3" style="font-size: 12px">
                  - 免费时长：{{ formData.free_minutes }}分钟
                  <br />
                  - 计费时长：{{ Math.max(0, (estimateMinutes || 0) - formData.free_minutes) }}分钟
                  <br />
                  - 应收费用：
                  <n-spin :show="estimating" :size="12" style="display: inline-block">
                    <n-text type="primary" strong>¥{{ estimateFeeResult }}</n-text>
                  </n-spin>
                </n-text>
              </n-space>
            </n-card>
          </n-form-item>

          <n-form-item>
            <n-space>
              <n-button type="primary" @click="handleSave" :loading="saving">
                保存规则
              </n-button>
              <n-button @click="handleReset">重置</n-button>
            </n-space>
          </n-form-item>
        </n-form>
      </n-spin>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useMessage } from 'naive-ui';
import { getFeeRule, updateFeeRule, estimateFee } from '@/api/http.js';

const message = useMessage();
const formRef = ref();
const loading = ref(false);
const saving = ref(false);

// 表单数据
const formData = ref({
  free_minutes: 15,
  price_per_hour: 5.0,
  daily_cap: 50.0,
  rounding: '60min_up',
});

// 保存初始数据用于重置
const initialData = ref({});

// 试算相关
const estimateMinutes = ref(135);
const estimateFeeResult = ref('0.00');
const estimating = ref(false);
let estimateTimer: any = null;

// 表单验证规则
const rules = {
  free_minutes: {
    required: true,
    type: 'number',
    message: '请输入免费分钟数',
    trigger: 'blur',
  },
  price_per_hour: {
    required: true,
    type: 'number',
    message: '请输入每小时单价',
    trigger: 'blur',
  },
  daily_cap: {
    required: true,
    type: 'number',
    message: '请输入日封顶金额',
    trigger: 'blur',
  },
  rounding: {
    required: true,
    message: '请选择计费取整规则',
    trigger: 'change',
  },
};

// 调用后端试算接口实时计算费用
const fetchEstimateFee = async () => {
  if (estimateMinutes.value === null || estimateMinutes.value === undefined) {
    estimateFeeResult.value = '0.00';
    return;
  }
  estimating.value = true;
  try {
    const res = await estimateFee({
      minutes: estimateMinutes.value,
      free_minutes: formData.value.free_minutes,
      price_per_hour: formData.value.price_per_hour,
      daily_cap: formData.value.daily_cap,
      rounding: formData.value.rounding,
    });
    if (res && res.data) {
      estimateFeeResult.value = Number(res.data.fee).toFixed(2);
    }
  } catch (error) {
    estimateFeeResult.value = '0.00';
  } finally {
    estimating.value = false;
  }
};

// 防抖触发试算
const triggerEstimate = () => {
  if (estimateTimer) clearTimeout(estimateTimer);
  estimateTimer = setTimeout(() => {
    fetchEstimateFee();
  }, 300);
};

// 监听分钟数及规则变化，实时调用后端接口
watch(
  [
    estimateMinutes,
    () => formData.value.free_minutes,
    () => formData.value.price_per_hour,
    () => formData.value.daily_cap,
    () => formData.value.rounding,
  ],
  () => {
    triggerEstimate();
  }
);

// 加载收费规则
const loadFeeRule = async () => {
  loading.value = true;
  try {
    const res = await getFeeRule();
    if (res && res.data) {
      formData.value = {
        ...formData.value,
        ...res.data,
      };
      // 保存初始数据
      initialData.value = JSON.parse(JSON.stringify(formData.value));
    }
  } catch (error) {
    message.error('加载收费规则失败');
  } finally {
    loading.value = false;
    // 加载完成后初始化试算结果
    fetchEstimateFee();
  }
};

// 保存收费规则
const handleSave = async () => {
  try {
    await formRef.value?.validate();
    saving.value = true;

    const res = await updateFeeRule(formData.value);
    if (res) {
      message.success('保存成功');
      // 更新初始数据
      initialData.value = JSON.parse(JSON.stringify(formData.value));
    }
  } catch (error) {
    if (error?.errors) {
      message.error('请检查表单填写是否正确');
    } else {
      message.error('保存失败');
    }
  } finally {
    saving.value = false;
  }
};

// 重置表单
const handleReset = () => {
  formData.value = JSON.parse(JSON.stringify(initialData.value));
  message.info('已重置为上次保存的数据');
};

onMounted(() => {
  loadFeeRule();
});
</script>

<style scoped lang="less">
.page-container {
  padding: 16px;
}
</style>
