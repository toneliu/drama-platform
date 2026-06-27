<template>
  <div>
    <div class="page-header">
      <h2>兑换码管理</h2>
      <el-button type="primary" @click="generateVisible = true">
        <el-icon><Plus /></el-icon>
        批量生成
      </el-button>
    </div>

    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="code" label="兑换码" min-width="200">
        <template #default="{ row }">
          <el-text style="font-family: monospace;">{{ row.code }}</el-text>
          <el-button size="small" text @click="copyCode(row.code)" style="margin-left: 8px;">
            复制
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="coins" label="金币数" width="100" align="center">
        <template #default="{ row }">
          {{ row.coins ?? 0 }}
        </template>
      </el-table-column>
      <el-table-column prop="vipDays" label="VIP天数" width="100" align="center">
        <template #default="{ row }">
          {{ row.vipDays ?? 0 }}
        </template>
      </el-table-column>
      <el-table-column label="是否已使用" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="row.usedAt ? 'info' : 'success'" size="small">
            {{ row.usedAt ? '已使用' : '未使用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="usedByUserId" label="使用者" width="100" align="center">
        <template #default="{ row }">
          {{ row.usedByUserId ?? '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="expireAt" label="过期时间" width="170">
        <template #default="{ row }">
          {{ formatDate(row.expireAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="生成时间" width="170">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @current-change="fetchList"
        @size-change="fetchList"
      />
    </div>

    <!-- 批量生成弹窗 -->
    <el-dialog v-model="generateVisible" title="批量生成兑换码" width="450px" destroy-on-close>
      <el-form ref="genFormRef" :model="genForm" :rules="genRules" label-width="100px">
        <el-form-item label="数量" prop="count">
          <el-input-number v-model="genForm.count" :min="1" :max="1000" />
        </el-form-item>
        <el-form-item label="金币数">
          <el-input-number v-model="genForm.coins" :min="0" />
        </el-form-item>
        <el-form-item label="VIP天数">
          <el-input-number v-model="genForm.vipDays" :min="0" />
        </el-form-item>
        <el-form-item label="有效期(天)">
          <el-input-number v-model="genForm.expiresInDays" :min="1" :max="365" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="generateVisible = false">取消</el-button>
        <el-button type="primary" :loading="generating" @click="handleGenerate">生成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getRedeemCodeList, generateRedeemCodes } from '@/api/redeem'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import dayjs from 'dayjs'

const list = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

const generateVisible = ref(false)
const generating = ref(false)
const genFormRef = ref<FormInstance>()

const genForm = reactive({
  count: 10,
  coins: 100,
  vipDays: 0,
  expiresInDays: 30,
})

const genRules: FormRules = {
  count: [{ required: true, message: '请输入数量', trigger: 'blur' }],
}

function formatDate(date?: string) {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

function copyCode(code: string) {
  navigator.clipboard.writeText(code).then(() => {
    ElMessage.success('已复制')
  })
}

async function fetchList() {
  loading.value = true
  try {
    const res: any = await getRedeemCodeList({
      page: page.value,
      pageSize: pageSize.value,
    })
    const data = res.data || res
    list.value = data.list || data.codes || data || []
    total.value = data.total || list.value.length
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

async function handleGenerate() {
  generating.value = true
  try {
    await generateRedeemCodes({
      count: genForm.count,
      coins: genForm.coins || undefined,
      vipDays: genForm.vipDays || undefined,
      expiresInDays: genForm.expiresInDays || undefined,
    })
    ElMessage.success(`成功生成 ${genForm.count} 个兑换码`)
    generateVisible.value = false
    fetchList()
  } catch {
    // error handled by interceptor
  } finally {
    generating.value = false
  }
}

onMounted(fetchList)
</script>
