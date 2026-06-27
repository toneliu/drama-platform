<template>
  <div class="drama-card" :class="mode" @click="$emit('click')">
    <div class="card-cover-wrap">
      <img :src="drama.cover" :alt="drama.title" class="card-cover" loading="lazy" />
      <div v-if="drama.is_new" class="badge new">NEW</div>
      <div v-if="drama.is_hot" class="badge hot">🔥</div>
      <div class="card-score" v-if="drama.score">{{ drama.score }}</div>
    </div>
    <div class="card-title">{{ drama.title }}</div>
    <div class="card-meta" v-if="mode === 'grid'">
      {{ drama.total_episodes }}集 · {{ drama.category }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Drama } from '@/api/drama'

defineProps<{
  drama: Drama
  mode?: 'scroll' | 'grid'
}>()

defineEmits<{ click: [] }>()
</script>

<style scoped>
.drama-card {
  flex-shrink: 0;
  cursor: pointer;
}

/* scroll 模式：横向滚动卡片 */
.drama-card.scroll {
  width: 120px;
}
.drama-card.scroll .card-cover-wrap {
  width: 120px;
  height: 160px;
}

/* grid 模式：网格卡片 */
.drama-card.grid .card-cover-wrap {
  width: 100%;
  aspect-ratio: 3 / 4;
}

.card-cover-wrap {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}
.card-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.badge {
  position: absolute;
  top: 4px;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
}
.badge.new {
  left: 4px;
  background: var(--color-primary);
  color: #fff;
}
.badge.hot {
  right: 4px;
}
.card-score {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0,0,0,0.7);
  color: var(--color-gold);
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}
.card-title {
  font-size: 13px;
  font-weight: 500;
  margin-top: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-meta {
  font-size: 11px;
  color: var(--color-text-hint);
  margin-top: 2px;
}
</style>
