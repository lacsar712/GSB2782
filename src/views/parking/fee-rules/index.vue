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
              @update:value="handleRuleChange"
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
              @update:value="handleRuleChange"
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
              @update:value="handleRuleChange"
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
            <n-radio-group v-model:value="formData.rounding" @update:value="handleRuleChange">
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

          <n-form-item label="计费试算">
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
                <n-form-item label="输入停车分钟数" label-placement="left" label-width="120" style="margin-bottom: 8px">
                  <n-input-number
                    v-model:value="trialMinutes"
                    :min="0"
                    :step="15"
                    placeholder="请输入停车分钟数"
                    style="width: 200px"
                    :loading="trialLoading"
                    @update:value="handleTrialMinutesChange"
                  >
                    <template #suffix>分钟</template>
                  </n-input-number>
                </n-form-item>
                <div v-if="trialResult !== null">
                  <n-space vertical size="small">
                    <n-text>
                      <n-text strong>停车时长：</n-text>
                      {{ trialResult.parking_minutes }} 分钟
                    </n-text>
                    <n-text>
                      <n-text strong>免费时长：</n-text>
                      {{ trialResult.free_minutes }} 分钟
                    </n-text>
                    <n-text>
                      <n-text strong>计费分钟数：</n-text>
                      {{ trialResult.chargeable_minutes }} 分钟
                    </n-text>
                    <n-text>
                      <n-text strong>计费小时数：</n-text>
                      {{ trialResult.billable_hours }} 小时
                    </n-text>
                    <n-divider style="margin: 4px 0" />
                    <n-text style="font-size: 18px">
                      <n-text strong type="success">应收费用：</n-text>
                      <n-text type="success" strong style="font-size: 22px">¥{{ trialResult.fee.toFixed(2) }}</n-text>
                    </n-text>
                    <n-text v-if="trialMinutes <= formData.free_minutes" depth="3" style="font-size: 12px">
                      当前停车时长未超过免费分钟数，所以应收费用为 0
                    </n-text>
                  </n-space>
                </div>
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
import { getFeeRule, updateFeeRule, calculateFeeTrial } from '@/api/http.js';

const message = useMessage();
const formRef = ref();
const loading = ref(false);
const saving = ref(false);
const trialLoading = ref(false);
const trialMinutes = ref<number | null>(135);
const trialResult = ref<{
  parking_minutes: number;
  free_minutes: number;
  chargeable_minutes: number;
  billable_hours: number;
  fee: number;
} | null>(null);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const formData = ref({
  free_minutes: 15,
  price_per_hour: 5.0,
  daily_cap: 50.0,
  rounding: '60min_up',
});

const initialData = ref({});

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

const doCalculate = async () => {
  if (trialMinutes.value === null || trialMinutes.value < 0) {
    trialResult.value = null;
    return;
  }

  trialLoading.value = true;
  try {
    const res = await calculateFeeTrial({
      parking_minutes: trialMinutes.value,
      free_minutes: formData.value.free_minutes,
      price_per_hour: formData.value.price_per_hour,
      daily_cap: formData.value.daily_cap,
      rounding: formData.value.rounding,
    });
    if (res && res.data) {
      trialResult.value = res.data;
    }
  } catch (error) {
    console.error('试算失败:', error);
  } finally {
    trialLoading.value = false;
  }
};

const debouncedCalculate = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    doCalculate();
  }, 300);
};

const handleTrialMinutesChange = () => {
  debouncedCalculate();
};

const handleRuleChange = () => {
  debouncedCalculate();
};

const loadFeeRule = async () => {
  loading.value = true;
  try {
    const res = await getFeeRule();
    if (res && res.data) {
      formData.value = {
        ...formData.value,
        ...res.data,
      };
      initialData.value = JSON.parse(JSON.stringify(formData.value));
      debouncedCalculate();
    }
  } catch (error) {
    message.error('加载收费规则失败');
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  try {
    await formRef.value?.validate();
    saving.value = true;

    const res = await updateFeeRule(formData.value);
    if (res) {
      message.success('保存成功');
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

const handleReset = () => {
  formData.value = JSON.parse(JSON.stringify(initialData.value));
  message.info('已重置为上次保存的数据');
  debouncedCalculate();
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
