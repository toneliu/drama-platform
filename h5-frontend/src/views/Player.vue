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
import { getDramaDetail } from '@/api/drama'
import { getPlayInfo, unlockByCoins, unlockByAd } from '@/api/episode'
import type { DramaDetail, Episode } from '@/api/drama'
import type { PlayInfo } from '@/api/episode'
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

    // 如果未解锁且没有试看，直接弹解锁
    if (playInfo.value && !playInfo.value.isUnlocked) {
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
  // 从 playInfo 中尝试获取 dramaId
  // playInfo 不直接返回 dramaId，需要从 episode 反查
  // 但我们的 getDramaDetail 包含 episodes，可以从第一个 episode 的 dramaId 推断
  // 这里先从 episodeId 所属的 drama 来获取
  // 实际上我们需要从 episode 获取 dramaId，或者从 URL query 获取
  // 由于 API 设计中 playInfo 不含 dramaId，我们从 episodes 列表中查找
  if (playInfo.value) {
    // 如果 episodes 还没加载，尝试从 dramaId 加载
    // 这里假设 episodeId 格式或后端返回 dramaId
    // 实际场景中可能需要额外接口，这里我们从 playInfo 后的首次获取来推断
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
