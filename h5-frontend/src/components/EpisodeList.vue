<template>
  <div class="episode-list">
    <div
      v-for="ep in episodes"
      :key="ep.id"
      class="episode-item"
      :class="{ locked: !ep.isUnlocked, current: ep.id === currentId }"
      @click="$emit('play', ep)"
    >
      <span class="ep-num">{{ ep.episodeNumber }}</span>
      <span class="ep-title">{{ ep.title || `第${ep.episodeNumber}集` }}</span>
      <span v-if="!ep.isUnlocked" class="lock-icon">🔒</span>
      <span v-else-if="ep.id === currentId" class="playing-icon">▶</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Episode } from '@/api/drama'

defineProps<{
  episodes: Episode[]
  currentId?: string
}>()

defineEmits<{
  play: [episode: Episode]
}>()
</script>

<style scoped>
.episode-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 16px;
}
.episode-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80px;
  background: #f8f8f8;
  border-radius: 10px;
  font-size: 24px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
}
.episode-item:active {
  background: #eee;
}
.episode-item.locked {
  color: #bbb;
}
.episode-item.current {
  background: #fff0f3;
  color: var(--primary, #ff4d6a);
  font-weight: 600;
}
.ep-num {
  font-size: 28px;
  font-weight: 600;
}
.ep-title {
  font-size: 20px;
  margin-top: 4px;
}
.lock-icon {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 16px;
}
.playing-icon {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 16px;
  color: var(--primary, #ff4d6a);
}
</style>
