<template>
  <div class="drama-detail page" v-if="drama">
    <!-- 封面 -->
    <div class="hero">
      <img :src="drama.coverUrl" :alt="drama.title" class="hero-cover" />
      <div class="hero-overlay">
        <van-nav-bar
          left-arrow
          @click-left="$router.back()"
          :border="false"
          class="nav-transparent"
        />
        <div class="hero-info">
          <h1 class="hero-title">{{ drama.title }}</h1>
          <div class="hero-meta">
            <span>{{ drama.totalEpisodes }}集</span>
            <span>{{ formatCount(drama.playCount) }}次播放</span>
            <span v-if="drama.category">{{ drama.category }}</span>
          </div>
          <div class="hero-tags" v-if="drama.tags?.length">
            <span v-for="tag in drama.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 简介 -->
    <div class="section">
      <div class="desc card" :class="{ expanded: descExpanded }">
        <div class="desc-text">{{ drama.description }}</div>
        <div class="desc-toggle" @click="descExpanded = !descExpanded">
          {{ descExpanded ? '收起' : '展开' }}
        </div>
      </div>
    </div>

    <!-- 播放按钮 -->
    <div class="section">
      <van-button
        type="primary"
        block
        round
        size="large"
        class="play-btn"
        @click="playEpisode(firstEpisode)"
      >
        ▶ 从第1集开始播放
      </van-button>
    </div>

    <!-- 集数列表 -->
    <div class="section">
      <div class="section-title">剧集列表</div>
      <EpisodeList
        :episodes="drama.episodes"
        @play="playEpisode"
      />
    </div>

    <div style="height: 32px" />
  </div>

  <div v-else class="loading page">
    <van-loading size="48px" vertical>加载中...</van-loading>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EpisodeList from '@/components/EpisodeList.vue'
import { getDramaDetail } from '@/api/drama'
import type { DramaDetail, Episode } from '@/api/drama'

const route = useRoute()
const router = useRouter()

const drama = ref<DramaDetail | null>(null)
const descExpanded = ref(false)

const firstEpisode = computed(() => drama.value?.episodes?.[0])

function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return String(n)
}

function playEpisode(ep?: Episode) {
  if (ep) {
    router.push(`/play/${ep.id}`)
  }
}

onMounted(async () => {
  const id = route.params.id as string
  try {
    drama.value = await getDramaDetail(id)
  } catch {}
})
</script>

<style scoped>
.hero {
  position: relative;
  height: 480px;
}
.hero-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 30%, rgba(0, 0, 0, 0.8));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
:deep(.nav-transparent) {
  background: transparent;
}
:deep(.nav-transparent .van-nav-bar__arrow) {
  color: #fff;
}
:deep(.nav-transparent .van-nav-bar__text) {
  color: #fff;
}
.hero-info {
  padding: 24px;
}
.hero-title {
  font-size: 40px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px;
}
.hero-meta {
  display: flex;
  gap: 16px;
  font-size: 24px;
  color: rgba(255, 255, 255, 0.8);
}
.hero-tags {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.tag {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 22px;
}

.desc {
  padding: 20px;
}
.desc-text {
  font-size: 26px;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.desc.expanded .desc-text {
  -webkit-line-clamp: unset;
}
.desc-toggle {
  text-align: center;
  color: var(--primary, #ff4d6a);
  font-size: 24px;
  margin-top: 12px;
  cursor: pointer;
}

.play-btn {
  background: linear-gradient(135deg, #ff4d6a, #ff8c8c);
  border: none;
  height: 88px;
  font-size: 30px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
</style>
