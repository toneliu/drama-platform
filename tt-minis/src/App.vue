<template>
  <div id="tt-app">
    <router-view v-slot="{ Component }">
      <keep-alive :include="['Home']">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(async () => {
  // 尝试自动登录
  await userStore.autoLogin()
})
</script>

<style>
#tt-app {
  min-height: 100vh;
  background: #0a0a0a;
  color: #fff;
}
</style>
