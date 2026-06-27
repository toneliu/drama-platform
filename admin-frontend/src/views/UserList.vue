<template>
  <div>
    <div class="page-header">
      <h2>用户管理</h2>
    </div>

    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索昵称/手机号"
        style="width: 240px;"
        clearable
        @clear="fetchList"
        @keyup.enter="fetchList"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="vipFilter" placeholder="VIP状态" clearable style="width: 140px;" @change="fetchList">
        <el-option label="全部" value="" />
        <el-option label="VIP用户" :value="1" />
        <el-option label="普通用户" :value="0" />
      </el-select>
      <el-button @click="fetchList">搜索</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="头像" width="70">
        <template #default="{ row }">
          <img
            v-if="row.avatarUrl"
            :src="row.avatarUrl"
            class="avatar-small"
            alt="头像"
          />
          <el-icon v-else :size="32" color="#c0c4cc"><UserFilled /></el-icon>
        </template>
      </el-table-column>
      <el-table-column prop="nickname" label="昵称" min-width="120" show-overflow-tooltip />
      <el-table-column prop="phone" label="手机号" width="140" />
      <el-table-column prop="coins" label="金币" width="100" align="center" />
      <el-table-column label="VIP状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.vipExpireAt" type="success" size="small">VIP</el-tag>
          <el-tag v-else type="info" size="small">普通</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="注册时间" width="170">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
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

    <!-- 用户详情弹窗 -->
    <el-dialog v-model="detailVisible" title="用户详情" width="500px">
      <el-descriptions :column="2" border v-if="currentUser">
        <el-descriptions-item label="ID">{{ currentUser.id }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentUser.nickname }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="金币">{{ currentUser.coins ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="VIP状态">
          <el-tag :type="currentUser.vipExpireAt ? 'success' : 'info'" size="small">
            {{ currentUser.vipExpireAt ? 'VIP' : '普通' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="VIP到期">
          {{ currentUser.vipExpireAt ? formatDate(currentUser.vipExpireAt) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="注册时间" :span="2">
          {{ formatDate(currentUser.createdAt) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserList } from '@/api/user'
import { Search, UserFilled } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const list = ref<any[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const vipFilter = ref<number | ''>('')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

const detailVisible = ref(false)
const currentUser = ref<any>(null)

function formatDate(date?: string) {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

async function fetchList() {
  loading.value = true
  try {
    const res: any = await getUserList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value || undefined,
      vipStatus: vipFilter.value !== '' ? vipFilter.value : undefined,
    })
    const data = res.data || res
    list.value = data.list || data.users || data || []
    total.value = data.total || list.value.length
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function viewDetail(row: any) {
  currentUser.value = row
  detailVisible.value = true
}

onMounted(fetchList)
</script>
