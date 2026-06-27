<template>
  <div>
    <div class="page-header">
      <h2>订阅档位管理</h2>
      <el-button type="primary" @click="openForm()">
        <el-icon><Plus /></el-icon>
        新增档位
      </el-button>
    </div>

    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="id" label="档位ID" width="100" />
      <el-table-column prop="name" label="名称" min-width="150" />
      <el-table-column prop="price" label="价格" width="100" align="center">
        <template #default="{ row }">
          ¥{{ Number(row.price || 0).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="durationDays" label="时长(天)" width="100" align="center" />
      <el-table-column prop="trialDays" label="试用天数" width="100" align="center">
        <template #default="{ row }">
          {{ row.trialDays ?? 0 }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.active !== false ? 'success' : 'info'" size="small">
            {{ row.active !== false ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openForm(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="formVisible"
      :title="editingId ? '编辑档位' : '新增档位'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="如：月度VIP、年度VIP" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="时长(天)" prop="durationDays">
          <el-input-number v-model="form.durationDays" :min="1" />
        </el-form-item>
        <el-form-item label="试用天数">
          <el-input-number v-model="form.trialDays" :min="0" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="档位描述（可选）" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.active" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getSubscriptionTierList, createSubscriptionTier, updateSubscriptionTier } from '@/api/subscription'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const list = ref<any[]>([])
const loading = ref(false)

const formVisible = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  name: '',
  price: 0,
  durationDays: 30,
  trialDays: 0,
  description: '',
  active: true,
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  durationDays: [{ required: true, message: '请输入时长', trigger: 'blur' }],
}

async function fetchList() {
  loading.value = true
  try {
    const res: any = await getSubscriptionTierList()
    const data = res.data || res
    list.value = data.list || data.tiers || data || []
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function openForm(row?: any) {
  editingId.value = row?.id || null
  form.name = row?.name || ''
  form.price = row?.price || 0
  form.durationDays = row?.durationDays || 30
  form.trialDays = row?.trialDays || 0
  form.description = row?.description || ''
  form.active = row?.active !== false
  formVisible.value = true
}

async function submitForm() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (editingId.value) {
      await updateSubscriptionTier(editingId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await createSubscriptionTier({ ...form })
      ElMessage.success('创建成功')
    }
    formVisible.value = false
    fetchList()
  } catch {
    // error handled by interceptor
  } finally {
    submitting.value = false
  }
}

onMounted(fetchList)
</script>
