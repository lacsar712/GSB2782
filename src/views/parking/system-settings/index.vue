<template>
  <div class="page-container">
    <n-card title="系统设置">
      <n-spin :show="loading">
        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-placement="left"
          label-width="140"
          require-mark-placement="right-hanging"
        >
          <n-form-item label="车位总数" path="total_slots">
            <n-input-number
              v-model:value="formData.total_slots"
              :min="0"
              :step="1"
              placeholder="请输入车位总数"
              style="width: 300px"
            >
              <template #suffix>个</template>
            </n-input-number>
          </n-form-item>

          <n-form-item label="LED欢迎语" path="led_welcome_text">
            <n-input
              v-model:value="formData.led_welcome_text"
              placeholder="请输入LED欢迎语"
              maxlength="100"
              show-count
              style="width: 500px"
            />
          </n-form-item>

          <n-form-item label="车牌颜色放行" path="allow_plate_colors">
            <n-checkbox-group v-model:value="formData.allow_plate_colors">
              <n-space>
                <n-checkbox value="blue" label="蓝色" />
                <n-checkbox value="yellow" label="黄色" />
                <n-checkbox value="green" label="绿色" />
                <n-checkbox value="black" label="黑色" />
                <n-checkbox value="white" label="白色" />
              </n-space>
            </n-checkbox-group>
          </n-form-item>

          <n-form-item label="特种车辆放行" path="allow_special_vehicle_types">
            <n-checkbox-group v-model:value="formData.allow_special_vehicle_types">
              <n-space>
                <n-checkbox value="police" label="警车" />
                <n-checkbox value="fire" label="消防车" />
                <n-checkbox value="ambulance" label="救护车" />
                <n-checkbox value="military" label="军车" />
                <n-checkbox value="other" label="其它" />
              </n-space>
            </n-checkbox-group>
          </n-form-item>

          <n-form-item label="车场类型" path="parking_lot_type">
            <n-radio-group v-model:value="formData.parking_lot_type">
              <n-space>
                <n-radio value="ground" label="地面" />
                <n-radio value="underground" label="地下" />
                <n-radio value="roadside" label="路侧" />
                <n-radio value="stereo" label="立体" />
              </n-space>
            </n-radio-group>
          </n-form-item>

          <n-form-item>
            <n-space>
              <n-button type="primary" @click="handleSave" :loading="saving">
                保存设置
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
import { ref, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import { getSettings, updateSettings } from '@/api/http.js';

const message = useMessage();
const formRef = ref();
const loading = ref(false);
const saving = ref(false);

// 表单数据
const formData = ref({
  total_slots: 100,
  led_welcome_text: '欢迎光临',
  allow_plate_colors: ['blue', 'yellow', 'green'],
  allow_special_vehicle_types: ['police', 'fire', 'ambulance'],
  parking_lot_type: 'underground',
});

// 保存初始数据用于重置
const initialData = ref({});

// 表单验证规则
const rules = {
  total_slots: {
    required: true,
    type: 'number',
    message: '请输入车位总数',
    trigger: 'blur',
  },
  led_welcome_text: {
    required: true,
    message: '请输入LED欢迎语',
    trigger: 'blur',
  },
  parking_lot_type: {
    required: true,
    message: '请选择车场类型',
    trigger: 'change',
  },
};

// 加载设置
const loadSettings = async () => {
  loading.value = true;
  try {
    const res = await getSettings();
    if (res && res.data) {
      formData.value = {
        ...formData.value,
        ...res.data,
      };
      // 保存初始数据
      initialData.value = JSON.parse(JSON.stringify(formData.value));
    }
  } catch (error) {
    message.error('加载设置失败');
  } finally {
    loading.value = false;
  }
};

// 保存设置
const handleSave = async () => {
  try {
    await formRef.value?.validate();
    saving.value = true;

    const res = await updateSettings(formData.value);
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
  loadSettings();
});
</script>

<style scoped lang="less">
.page-container {
  padding: 16px;
}
</style>
