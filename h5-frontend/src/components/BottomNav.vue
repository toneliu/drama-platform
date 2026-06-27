<template>
  <van-tabbar v-model="active" route active-color="#ff4d6a" inactive-color="#999">
    <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
    <van-tabbar-item to="/search" icon="search">搜索</van-tabbar-item>
    <van-tabbar-item to="/profile" icon="contact">我的</van-tabbar-item>
  </van-tabbar>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const active = ref(0)
</script>

<style scoped>
:deep(.van-tabbar) {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
