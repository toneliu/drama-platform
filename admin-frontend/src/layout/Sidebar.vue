<template>
  <div class="admin-sidebar" :class="{ collapsed }">
    <div class="sidebar-logo">
      <span v-if="!collapsed">🎬 短剧管理后台</span>
      <span v-else>🎬</span>
    </div>
    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      background-color="#1d1e1f"
      text-color="#bfcbd9"
      active-text-color="#409eff"
      :collapse-transition="false"
      router
    >
      <template v-for="item in menuItems" :key="item.path">
        <el-menu-item :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  DataAnalysis,
  Film,
  User,
  Tickets,
  PriceTag,
  Ticket,
  Money,
} from '@element-plus/icons-vue'

defineProps<{ collapsed: boolean }>()

const route = useRoute()

const menuItems = [
  { path: '/dashboard', title: '仪表盘', icon: DataAnalysis },
  { path: '/dramas', title: '剧目管理', icon: Film },
  { path: '/users', title: '用户管理', icon: User },
  { path: '/subscriptions', title: '订阅管理', icon: Tickets },
  { path: '/subscription-tiers', title: '订阅档位', icon: PriceTag },
  { path: '/redeem-codes', title: '兑换码管理', icon: Ticket },
  { path: '/payments', title: '支付订单', icon: Money },
]

const activeMenu = computed(() => {
  // For episode list, highlight dramas
  if (route.path.includes('/episodes')) return '/dramas'
  return route.path
})
</script>

<style scoped>
.el-menu {
  border-right: none;
}
</style>
