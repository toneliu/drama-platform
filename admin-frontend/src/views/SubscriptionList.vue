<template>
  <div>
    <div class="page-header">
      <h2>订阅管理</h2>
    </div>

    <el-tabs v-model="statusFilter" @tab-change="fetchList">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="生效中" name="active" />
      <el-tab-pane label="已过期" name="expired" />
      <el-tab-pane label="已取消" name="cancelled" />
    </el-tabs>

    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="id" label="订单号" width="100" />
      <el-table-column prop="userId" label="用户ID" width="100" />
      <el-table-column prop="tierName" label="订阅档位" min-width="120" />
      <el-table-column prop="amount" label="金额" width="100" align="center">
        <template #default="{ row }">
          ¥{{ Number(row.amount || 0).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small">
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="订阅时间" width="170">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="expireAt" label="到期时间" width="170">
        <template #default="{ row }">
          {{ formatDate(row.expireAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="viewDetail(row)">详情</el-button>
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订阅详情" width="500px">
      <el-descriptions :column="2" border v-if="currentItem">
        <el-descriptions-item label="订单号">{{ currentItem.id }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentItem.userId }}</el-descriptions-item>
        <el-descriptions-item label="档位">{{ currentItem.tierName }}</el-descriptions-item>
        <el-descriptions-item label="金额">¥{{ Number(currentItem.amount || 0).toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(currentItem.status)" size="small">
            {{ statusLabel(currentItem.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订阅时间">{{ formatDate(currentItem.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="到期时间" :span="2">{{ formatDate(currentItem.expireAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSubscriptionList } from '@/api/subscription'
import dayjs from 'dayjs'

const list = ref<any[]>([])
const loading = ref(false)
const statusFilter = ref('')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

const detailVisible = ref(false)
const currentItem = ref<any>(null)

function formatDate(date?: string) {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

function statusType(status: string) {
  const map: Record<string, string> = {
    active: 'success',
    expired: 'info',
    cancelled: 'warning',
  }
  return (map[status] || 'info') as any
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    active: '生效中',
    expired: '已过期',
    cancelled: '已取消',
  }
  return map[status] || status
}

async function fetchList() {
  loading.value = true
  try {
    const res: any = await getSubscriptionList({
      page: page.value,
      pageSize: pageSize.value,
      status: statusFilter.value || undefined,
    })
    const data = res.data || res
    list.value = data.list || data.subscriptions || data || []
    total.value = data.total || list.value.length
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function viewDetail(row: any) {
  currentItem.value = row
  detailVisible.value = true
}

onMounted(fetchList)
</script>
