<template>
  <div class="video-player-wrap">
    <video
      ref="videoRef"
      class="video-element"
      controls
      playsinline
      webkit-playsinline
      @timeupdate="onTimeUpdate"
      @ended="$emit('ended')"
    />
    <div v-if="showPreviewTip" class="preview-tip">
      试看结束，解锁后可观看完整内容
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Hls from 'hls.js'

const props = defineProps<{
  src: string
  previewSeconds?: number
  isUnlocked?: boolean
}>()

defineEmits<{
  ended: []
  previewEnd: []
}>()

const videoRef = ref<HTMLVideoElement>()
const showPreviewTip = ref(false)
let hls: Hls | null = null

function initPlayer() {
  if (!videoRef.value || !props.src) return

  destroyPlayer()

  if (props.src.includes('.m3u8')) {
    if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      })
      hls.loadSource(props.src)
      hls.attachMedia(videoRef.value)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.value?.play().catch(() => {})
      })
    } else if (videoRef.value.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari 原生支持
      videoRef.value.src = props.src
    }
  } else {
    videoRef.value.src = props.src
  }
}

function destroyPlayer() {
  if (hls) {
    hls.destroy()
    hls = null
  }
}

function onTimeUpdate() {
  if (
    props.previewSeconds &&
    props.previewSeconds > 0 &&
    !props.isUnlocked &&
    videoRef.value
  ) {
    if (videoRef.value.currentTime >= props.previewSeconds) {
      videoRef.value.pause()
      showPreviewTip.value = true
    }
  }
}

watch(() => props.src, initPlayer)

onMounted(initPlayer)
onBeforeUnmount(destroyPlayer)
</script>

<style scoped>
.video-player-wrap {
  position: relative;
  width: 100%;
  background: #000;
}
.video-element {
  width: 100%;
  display: block;
  max-height: 422px;
  object-fit: contain;
}
.preview-tip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  text-align: center;
  padding: 20px;
  font-size: 26px;
}
</style>
