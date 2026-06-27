<template>
  <div class="drama-card" @click="$emit('click')">
    <div class="cover-wrap">
      <img v-lazy="drama.coverUrl" :alt="drama.title" class="cover" />
      <span v-if="drama.totalEpisodes" class="episode-tag">
        {{ drama.totalEpisodes }}集
      </span>
    </div>
    <div class="info">
      <div class="title">{{ drama.title }}</div>
      <div class="meta">
        <span class="play-count">{{ formatCount(drama.playCount) }}次播放</span>
        <span v-if="drama.category" class="category">{{ drama.category }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Drama } from '@/api/drama'

defineProps<{ drama: Drama }>()
defineEmits<{ click: [] }>()

function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return String(n)
}
</script>

<style scoped>
.drama-card {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.cover-wrap {
  position: relative;
  width: 100%;
  padding-top: 133%;
  overflow: hidden;
}
.cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.episode-tag {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 20px;
  padding: 2px 8px;
  border-radius: 6px;
}
.info {
  padding: 12px;
}
.title {
  font-size: 26px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}
.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
  font-size: 20px;
  color: #999;
}
.category {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
}
</style>
