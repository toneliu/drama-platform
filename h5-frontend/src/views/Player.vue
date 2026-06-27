<template>
  <div class="player page">
    <!-- 导航 -->
    <van-nav-bar
      :title="episodeTitle"
      left-arrow
      @click-left="$router.back()"
      :border="false"
    />

    <!-- 视频播放器 -->
    <VideoPlayer
      v-if="playInfo"
      :src="playInfo.videoUrl"
      :preview-seconds="playInfo.previewSeconds"
      :is-unlocked="playInfo.isUnlocked"
      @ended="onVideoEnded"
      @preview-end="showUnlock = true"
    />

    <!-- 加载中 -->
    <div v-else class="video-placeholder">
      <van-loading size="48px" />
    </div>

    <!-- 剧集信息 -->
    <div class="episode-info section" v-if="dramaInfo">
      <div class="ep-title">{{ dramaInfo.title }} · 第{{ currentEpNum }}集</div>
      <div class="ep-meta">
        <span v-if="playInfo?.isUnlocked" class="unlocked">✅ 已解锁</span>
        <span v-else class="locked">🔒 未解锁</span>
      </div>
    </div>

    <!-- 集数选择 -->
    <div class="section" v-if="episodes.length">
      <div class="section-title">剧集列表</div>
      <EpisodeList
        :episodes="episodes"
        :current-id="episodeId"
        @play="onPlayEpisode"
      />
    </div>

    <!-- 解锁弹窗 -->
    <UnlockDialog
      v-model:show="showUnlock"
      :methods="unlockMethods"
      :is-vip="userStore.isVip"
      :coin-balance="userStore.coinBalance"
      @unlock="handleUnlock"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import VideoPlayer from '@/components/VideoPlayer.vue'
import EpisodeList from '@/components/EpisodeList.vue'
import UnlockDialog from '@/components/UnlockDialog.vue'
import { getPlayInfo, getDramaDetail, unlockByCoins, unlockByAd } from '@/api/drama'
import type { PlayInfo, Episode, DramaDetail } from '@/api/drama'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const episodeId = computed(() => route.params.episodeId as string)
const playInfo = ref<PlayInfo | null>(null)
const dramaInfo = ref<DramaDetail | null>(null)
const episodes = ref<Episode[]>([])
const showUnlock = ref(false)

const episodeTitle = computed(() => {
  const ep = episodes.value.find(e => e.id === episodeId.value)
  return ep ? `第${ep.episodeNumber}集` : '播放中'
})

const currentEpNum = computed(() => {
  const ep = episodes.value.find(e => e.id === episodeId.value)
  return ep?.episodeNumber ?? ''
})

const unlockMethods = computed(() => playInfo.value?.unlockMethods ?? {})

async function loadPlayInfo() {
  try {
    playInfo.value = await getPlayInfo(episodeId.value)

    // 获取剧集详情（含集数列表）
    if (playInfo.value && !dramaInfo.value) {
      // 从 playInfo 反查 dramaId，或从集数信息中获取
      // 这里假设 playInfo 包含 dramaId 或从路由获取
    }

    // 如果未解锁，显示解锁弹窗
    if (playInfo.value && !playInfo.value.isUnlocked) {
      // 试看模式下先不弹，等试看结束再弹
      if (!playInfo.value.previewSeconds || playInfo.value.previewSeconds <= 0) {
        showUnlock.value = true
      }
    }
  } catch {}
}

async function loadDramaInfo(dramaId: string) {
  try {
    dramaInfo.value = await getDramaDetail(dramaId)
    episodes.value = dramaInfo.value?.episodes ?? []
  } catch {}
}

function onPlayEpisode(ep: Episode) {
  router.replace(`/play/${ep.id}`)
}

function onVideoEnded() {
  // 自动播放下一集
  const currentIdx = episodes.value.findIndex(e => e.id === episodeId.value)
  if (currentIdx >= 0 && currentIdx < episodes.value.length - 1) {
    const next = episodes.value[currentIdx + 1]
    router.replace(`/play/${next.id}`)
  }
}

async function handleUnlock(method: 'vip' | 'coins' | 'ad') {
  if (method === 'vip') {
    if (userStore.isVip) {
      // VIP 用户直接播放，重新加载
      showUnlock.value = false
      await loadPlayInfo()
    } else {
      router.push('/subscription')
    }
    return
  }

  showLoadingToast({ message: '解锁中...', forbidClick: true })

  try {
    if (method === 'coins') {
      await unlockByCoins(episodeId.value)
      await userStore.fetchProfile()
    } else if (method === 'ad') {
      await unlockByAd(episodeId.value)
    }
    closeToast()
    showUnlock.value = false
    showToast('解锁成功')
    await loadPlayInfo()
  } catch {
    closeToast()
  }
}

// 监听 episodeId 变化（切集）
watch(episodeId, () => {
  playInfo.value = null
  loadPlayInfo()
})

onMounted(async () => {
  await loadPlayInfo()
  // 尝试从 playInfo 获取 dramaId 来加载剧集列表
  // 这里我们从 URL 或 playInfo 中推断
  // 假设 playInfo 返回后包含 dramaId 字段
  if ((playInfo.value as any)?.dramaId) {
    await loadDramaInfo((playInfo.value as any).dramaId)
  }
})
</script>

<style scoped>
.player {
  background: #000;
  min-height: 100vh;
}
:deep(.van-nav-bar) {
  background: transparent;
  color: #fff;
}
:deep(.van-nav-bar__title) {
  color: #fff;
}
:deep(.van-nav-bar__arrow) {
  color: #fff;
}

.video-placeholder {
  height: 422px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #111;
}

.episode-info {
  background: #fff;
}
.ep-title {
  font-size: 30px;
  font-weight: 600;
}
.ep-meta {
  margin-top: 8px;
  font-size: 24px;
}
.unlocked {
  color: #52c41a;
}
.locked {
  color: #ff4d6a;
}
</style>
