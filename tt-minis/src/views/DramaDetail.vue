<template>
  <div class="drama-detail">
    <!-- 顶部封面 -->
    <div class="detail-cover-wrap">
      <img :src="drama.cover" :alt="drama.title" class="detail-cover" />
      <div class="cover-overlay" />
      <div class="cover-info">
        <h1>{{ drama.title }}</h1>
        <div class="cover-meta">
          <van-tag type="primary">{{ drama.category }}</van-tag>
          <span>{{ drama.total_episodes }}集</span>
          <span>评分 {{ drama.score }}</span>
        </div>
      </div>
      <div class="back-btn" @click="$router.back()">
        <van-icon name="arrow-left" size="20" />
      </div>
    </div>

    <!-- 简介 -->
    <div class="detail-section">
      <h3>简介</h3>
      <p class="desc" :class="{ expanded: descExpanded }">{{ drama.description }}</p>
      <span class="expand-btn" @click="descExpanded = !descExpanded">
        {{ descExpanded ? '收起' : '展开' }}
      </span>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <van-button type="primary" round block @click="playEpisode(1)">
        <van-icon name="play-circle-o" /> 从第1集开始看
      </van-button>
      <div class="action-icons">
        <div class="action-icon" @click="handleShare">
          <van-icon name="share-o" size="22" />
          <span>分享</span>
        </div>
      </div>
    </div>

    <!-- 集数列表 -->
    <EpisodeList
      :episodes="episodes"
      :drama-id="drama.id"
      @play="playEpisode"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { dramaApi, type Drama, type Episode } from '@/api/drama'
import { ttSDK } from '@/utils/tt'
import EpisodeList from '@/components/EpisodeList.vue'

const route = useRoute()
const router = useRouter()
const dramaId = route.params.id as string

const descExpanded = ref(false)
const drama = ref<Drama>({
  id: dramaId,
  title: '加载中...',
  cover: '',
  description: '',
  category: '',
  total_episodes: 0,
  is_new: false,
  is_hot: false,
  tags: [],
  score: 0,
})
const episodes = ref<Episode[]>([])

// Mock
const mockEpisodes: Episode[] = Array.from({ length: 20 }, (_, i) => ({
  id: `ep-${dramaId}-${i + 1}`,
  drama_id: dramaId,
  episode_number: i + 1,
  title: `第${i + 1}集`,
  duration: 120 + Math.floor(Math.random() * 60),
  is_free: i < 3,
  unlock_cost: i < 3 ? 0 : 50,
  video_url: '',
  cover: '',
}))

onMounted(async () => {
  try {
    const res = await dramaApi.getDetail(dramaId)
    drama.value = res.data
    episodes.value = res.data.episodes
  } catch {
    drama.value = {
      ...drama.value,
      title: '闪婚霸总是隐藏大佬',
      cover: `https://picsum.photos/seed/${dramaId}/400/560`,
      description: '一场意外的闪婚，让她嫁给了全城最神秘的男人。人人都说她高攀了，却不知这个"废物"老公竟是隐藏的商业帝国掌舵人。当真相揭开的那一刻，所有人都惊呆了……',
      category: '甜宠',
      total_episodes: 80,
      score: 9.2,
    }
    episodes.value = mockEpisodes
  }
})

function playEpisode(epNumber: number) {
  const ep = episodes.value.find(e => e.episode_number === epNumber)
  if (ep) {
    router.push(`/play/${ep.id}`)
  }
}

function handleShare() {
  ttSDK.share({
    title: `推荐一部好剧：${drama.value.title}`,
    imageUrl: drama.value.cover,
    path: `/pages/drama/detail?id=${dramaId}`,
  })
}
</script>

<style scoped>
.drama-detail {
  padding-bottom: calc(20px + var(--safe-bottom));
}
.detail-cover-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}
.detail-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 40%, rgba(0,0,0,0.85));
}
.cover-info {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
}
.cover-info h1 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}
.cover-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.back-btn {
  position: absolute;
  top: calc(12px + var(--safe-top));
  left: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.detail-section {
  padding: 16px;
}
.detail-section h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
}
.desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.desc.expanded {
  -webkit-line-clamp: unset;
}
.expand-btn {
  font-size: 12px;
  color: var(--color-primary);
  margin-top: 4px;
  display: inline-block;
}
.action-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 16px 16px;
}
.action-bar .van-button {
  flex: 1;
}
.action-icons {
  display: flex;
  gap: 16px;
}
.action-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  color: var(--color-text-secondary);
}
</style>
