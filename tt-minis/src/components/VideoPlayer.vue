<template>
  <div class="video-player-wrap">
    <video
      ref="videoRef"
      class="video-player"
      :src="src"
      :poster="poster"
      playsinline
      webkit-playsinline
      x5-video-player-type="h5"
      x5-video-player-fullscreen="true"
      @timeupdate="onTimeUpdate"
      @ended="$emit('ended')"
      @play="playing = true"
      @pause="playing = false"
      @click="togglePlay"
    />

    <!-- 播放/暂停遮罩 -->
    <div v-if="!playing && !seeking" class="play-overlay" @click="togglePlay">
      <van-icon name="play-circle-o" size="48" color="#fff" />
    </div>

    <!-- 进度条 -->
    <div class="progress-bar" @click.stop>
      <div class="progress-track" @click="seekTo">
        <div class="progress-fill" :style="{ width: progress + '%' }" />
      </div>
      <div class="progress-time">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  src: string
  poster?: string
}>()

defineEmits<{ ended: [] }>()

const videoRef = ref<HTMLVideoElement>()
const playing = ref(false)
const seeking = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)

function togglePlay() {
  if (!videoRef.value) return
  if (videoRef.value.paused) {
    videoRef.value.play()
  } else {
    videoRef.value.pause()
  }
}

function onTimeUpdate() {
  if (!videoRef.value) return
  currentTime.value = videoRef.value.currentTime
  duration.value = videoRef.value.duration || 0
  progress.value = duration.value ? (currentTime.value / duration.value) * 100 : 0
}

function seekTo(e: MouseEvent) {
  if (!videoRef.value || !duration.value) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const ratio = (e.clientX - rect.left) / rect.width
  videoRef.value.currentTime = ratio * duration.value
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

watch(() => props.src, () => {
  // src 变化后自动播放
  if (videoRef.value && props.src) {
    videoRef.value.load()
    videoRef.value.play().catch(() => {})
  }
})
</script>

<style scoped>
.video-player-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
}
.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.3);
}
.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 12px 8px;
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
}
.progress-track {
  height: 3px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  cursor: pointer;
}
.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 2px;
  transition: width 0.1s;
}
.progress-time {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(255,255,255,0.7);
  margin-top: 4px;
}
</style>
