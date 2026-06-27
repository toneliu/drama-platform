<template>
  <div class="admin-layout">
    <Sidebar :collapsed="collapsed" />
    <div class="admin-main">
      <div class="admin-header">
        <div style="display: flex; align-items: center; gap: 16px;">
          <el-icon
            :size="20"
            style="cursor: pointer; color: #606266;"
            @click="collapsed = !collapsed"
          >
            <Fold v-if="!collapsed" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentTitle">{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          <span style="color: #606266; font-size: 14px;">{{ adminStore.username }}</span>
          <el-button type="danger" text @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            退出
          </el-button>
        </div>
      </div>
      <div class="admin-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import Sidebar from './Sidebar.vue'
import { Fold, Expand, SwitchButton } from '@element-plus/icons-vue'

const collapsed = ref(false)
const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

const currentTitle = computed(() => (route.meta?.title as string) || '')

function handleLogout() {
  adminStore.logout()
  router.push('/login')
}
</script>
