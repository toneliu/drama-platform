<template>
  <div>
    <div class="page-header">
      <h2>支付订单</h2>
    </div>

    <el-tabs v-model="statusFilter" @tab-change="fetchList">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="待支付" name="pending" />
      <el-tab-pane label="已支付" name="paid" />
      <el-tab-pane label="已失败" name="failed" />
      <el-tab-pane label="已退款" name="refunded" />
    </el-tabs>

    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="id" label="订单号" width="120" />
      <el-table-column prop="userId" label="用户ID" width="100" />
      <el-table-column prop="amount" label="金额" width="100" align="center">
        <template #default="{ row }">
          ¥{{ Number(row.amount || 0).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="coins" label="金币" width="100" align="center" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="payStatusType(row.status)" size="small">
            {{ payStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="paymentMethod" label="支付方式" width="110" />
      <el-table-column prop="createdAt" label="创建时间" width="170">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="paidAt" label="支付时间" width="170">
        <template #default="{ row }">
          {{ formatDate(row.paidAt) }}
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPaymentList } from '@/api/payment'
import dayjs from 'dayjs'

const list = ref<any[]>([])
const loading = ref(false)
const statusFilter = ref('')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

function formatDate(date?: string) {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

function payStatusType(status: string) {
  const map: Record<string, string> = {
    pending: 'warning',
    paid: 'success',
    failed: 'danger',
    refunded: 'info',
  }
  return (map[status] || 'info') as any
}

function payStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    failed: '已失败',
    refunded: '已退款',
  }
  return map[status] || status
}

async function fetchList() {
  loading.value = true
  try {
    const res: any = await getPaymentList({
      page: page.value,
      pageSize: pageSize.value,
      status: statusFilter.value || undefined,
    })
    const data = res.data || res
    list.value = data.list || data.orders || data || []
    total.value = data.total || list.value.length
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchList)
</script>
