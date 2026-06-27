<template>
  <div class="episode-list">
    <div class="list-header">
      <h3>剧集列表</h3>
      <div class="list-sort" @click="sortAsc = !sortAsc">
        {{ sortAsc ? '正序' : '倒序' }}
        <van-icon :name="sortAsc ? 'arrow-up' : 'arrow-down'" />
      </div>
    </div>
    <div class="episode-grid">
      <div
        v-for="ep in sortedEpisodes"
        :key="ep.id"
        class="episode-item"
        :class="{ free: ep.is_free, locked: !ep.is_free }"
        @click="$emit('play', ep.episode_number)"
      >
        <span class="ep-num">{{ ep.episode_number }}</span>
        <van-icon v-if="!ep.is_free" name="lock" class="ep-lock" size="12" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Episode } from '@/api/drama'

const props = defineProps<{
  episodes: Episode[]
  dramaId: string
}>()

defineEmits<{ play: [episodeNumber: number] }>()

const sortAsc = ref(true)

const sortedEpisodes = computed(() => {
  const list = [...props.episodes]
  return sortAsc.value
    ? list.sort((a, b) => a.episode_number - b.episode_number)
    : list.sort((a, b) => b.episode_number - a.episode_number)
})
</script>

<style scoped>
.episode-list {
  padding: 0 16px;
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.list-header h3 {
  font-size: 15px;
  font-weight: 600;
}
.list-sort {
  font-size: 12px;
  color: var(--color-text-hint);
  display: flex;
  align-items: center;
  gap: 2px;
}
.episode-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.episode-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border-radius: 8px;
  background: var(--color-bg-card);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.episode-item.free {
  color: var(--color-text);
}
.episode-item.locked {
  color: var(--color-text-hint);
}
.ep-lock {
  position: absolute;
  top: 2px;
  right: 2px;
  color: var(--color-text-hint);
}
</style>
