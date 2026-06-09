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

          <n-form-item label="计费试算">
            <n-card size="small" style="width: 600px">
              <n-space vertical>
                <n-space align="center">
                  <n-text strong style="width: 100px">停车时长：</n-text>
                  <n-input-number
                    v-model:value="trialParkingMinutes"
                    :min="0"
                    :max="1440"
                    :step="5"
                    placeholder="请输入停车分钟数"
                    style="width: 200px"
                    @update:value="handleTrialCalculate"
                  >
                    <template #suffix>分钟</template>
                  </n-input-number>
                </n-space>
                <n-space align="center">
                  <n-text strong style="width: 100px">免费时长：</n-text>
                  <n-text>{{ formData.free_minutes }} 分钟</n-text>
                </n-space>
                <n-space align="center">
                  <n-text strong style="width: 100px">计费标准：</n-text>
                  <n-text>¥{{ formData.price_per_hour }}/小时</n-text>
                </n-space>
                <n-space align="center">
                  <n-text strong style="width: 100px">日封顶：</n-text>
                  <n-text>{{ formData.daily_cap > 0 ? `¥${formData.daily_cap}` : '不封顶' }}</n-text>
                </n-space>
                <n-space align="center">
                  <n-text strong style="width: 100px">取整规则：</n-text>
                  <n-text>{{ formData.rounding === '30min_up' ? '30分钟进位' : '60分钟进位' }}</n-text>
                </n-space>
                <n-divider style="margin: 8px 0" />
                <n-space vertical>
                  <n-text>
                    <n-text strong>计费时长：</n-text>
                    {{ trialResult.chargeableMinutes || 0 }} 分钟
                  </n-text>
                  <n-text type="success" strong style="font-size: 16px">
                    <n-text strong>应收费用：</n-text>
                    ¥{{ trialResult.fee?.toFixed(2) || '0.00' }}
                    <n-text v-if="trialResult.isFree" depth="3" style="font-size: 12px; margin-left: 8px">
                      (免费时长内)
                    </n-text>
                  </n-text>
                </n-space>
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
import { getFeeRule, updateFeeRule, calculateParkingFee } from '@/api/http.js';

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
const trialParkingMinutes = ref(135);
const trialResult = ref({
  fee: 0,
  chargeableMinutes: 0,
  isFree: true
});

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

// 试算停车费用
const handleTrialCalculate = async () => {
  try {
    const res = await calculateParkingFee({
      ...formData.value,
      parking_minutes: trialParkingMinutes.value
    });
    if (res && res.data) {
      trialResult.value = res.data;
    }
  } catch (error) {
    console.error('试算失败:', error);
  }
};

// 监听收费规则变化，自动重新试算
watch(
  () => [
    formData.value.free_minutes,
    formData.value.price_per_hour,
    formData.value.daily_cap,
    formData.value.rounding
  ],
  () => {
    handleTrialCalculate();
  },
  { deep: true }
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
      // 加载完成后进行一次试算
      handleTrialCalculate();
    }
  } catch (error) {
    message.error('加载收费规则失败');
  } finally {
    loading.value = false;
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
