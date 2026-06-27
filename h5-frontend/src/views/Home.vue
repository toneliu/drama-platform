<template>
  <div class="home page">
    <!-- 搜索栏 -->
    <div class="search-bar" @click="$router.push('/search')">
      <van-search
        shape="round"
        placeholder="搜索短剧"
        disabled
        background="transparent"
      />
    </div>

    <!-- Banner 轮播 -->
    <div class="banner-wrap" v-if="featured.length">
      <van-swipe :autoplay="4000" indicator-color="#ff4d6a" class="banner-swipe">
        <van-swipe-item v-for="item in featured.slice(0, 5)" :key="item.id">
          <div class="banner-item" @click="goDetail(item.id)">
            <img :src="item.coverUrl" :alt="item.title" />
            <div class="banner-title">{{ item.title }}</div>
          </div>
        </van-swipe-item>
      </van-swipe>
    </div>

    <!-- 分类导航 -->
    <div class="categories section">
      <div class="cat-grid">
        <div
          v-for="cat in categories"
          :key="cat.name"
          class="cat-item"
          @click="goCategory(cat.name)"
        >
          <span class="cat-icon">{{ cat.icon }}</span>
          <span class="cat-name">{{ cat.name }}</span>
        </div>
      </div>
    </div>

    <!-- 精选推荐 -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">🔥 精选推荐</span>
      </div>
      <div class="drama-scroll">
        <DramaCard
          v-for="item in featured"
          :key="item.id"
          :drama="item"
          class="drama-scroll-item"
          @click="goDetail(item.id)"
        />
      </div>
    </div>

    <!-- 新剧上线 -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">🆕 新剧上线</span>
      </div>
      <div class="drama-grid">
        <DramaCard
          v-for="item in newRelease"
          :key="item.id"
          :drama="item"
          @click="goDetail(item.id)"
        />
      </div>
    </div>

    <!-- 排行榜入口 -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">🏆 排行榜</span>
      </div>
      <div class="rank-tabs">
        <span
          v-for="t in rankTypes"
          :key="t.value"
          :class="{ active: rankType === t.value }"
          @click="switchRank(t.value)"
        >
          {{ t.label }}
        </span>
      </div>
      <div class="rank-list">
        <div
          v-for="(item, i) in ranking"
          :key="item.drama.id"
          class="rank-item"
          @click="goDetail(item.drama.id)"
        >
          <span class="rank-num" :class="{ top: i < 3 }">{{ i + 1 }}</span>
          <img v-lazy="item.drama.coverUrl" class="rank-cover" />
          <div class="rank-info">
            <div class="rank-title">{{ item.drama.title }}</div>
            <div class="rank-meta">{{ formatCount(item.drama.playCount) }}次播放</div>
          </div>
        </div>
      </div>
    </div>

    <div style="height: 100px" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DramaCard from '@/components/DramaCard.vue'
import { getFeatured, getNewRelease, getRanking } from '@/api/drama'
import type { Drama, RankingItem } from '@/api/drama'

const router = useRouter()

const featured = ref<Drama[]>([])
const newRelease = ref<Drama[]>([])
const ranking = ref<RankingItem[]>([])
const rankType = ref('hot')

const categories = [
  { name: '甜宠', icon: '💕' },
  { name: '逆袭', icon: '⚡' },
  { name: '穿越', icon: '🌀' },
  { name: '复仇', icon: '🔥' },
  { name: '豪门', icon: '👑' },
  { name: '都市', icon: '🏙️' },
  { name: '古装', icon: '🏯' },
  { name: '悬疑', icon: '🔍' },
]

const rankTypes = [
  { label: '最热', value: 'hot' },
  { label: '最新', value: 'new' },
  { label: '好评', value: 'rating' },
]

function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return String(n)
}

function goDetail(id: string) {
  router.push(`/drama/${id}`)
}

function goCategory(name: string) {
  router.push(`/search?category=${name}`)
}

async function switchRank(type: string) {
  rankType.value = type
  try {
    ranking.value = await getRanking(type)
  } catch {}
}

onMounted(async () => {
  try {
    const [f, n, r] = await Promise.allSettled([
      getFeatured(),
      getNewRelease(),
      getRanking('hot'),
    ])
    if (f.status === 'fulfilled') featured.value = f.value
    if (n.status === 'fulfilled') newRelease.value = n.value
    if (r.status === 'fulfilled') ranking.value = r.value
  } catch {}
})
</script>

<style scoped>
.search-bar {
  padding: 12px 16px 0;
  background: linear-gradient(135deg, #ff4d6a 0%, #ff8c8c 100%);
}
:deep(.van-search__content) {
  background: rgba(255, 255, 255, 0.9);
}

.banner-wrap {
  padding: 0 16px;
  margin-top: -4px;
}
.banner-swipe {
  border-radius: 16px;
  overflow: hidden;
}
.banner-item {
  position: relative;
  height: 320px;
}
.banner-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.banner-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px 20px 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: #fff;
  font-size: 30px;
  font-weight: 600;
}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 20px 0;
}
.cat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.cat-icon {
  font-size: 40px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.cat-name {
  font-size: 22px;
  color: #666;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.drama-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 8px;
}
.drama-scroll::-webkit-scrollbar {
  display: none;
}
.drama-scroll-item {
  flex-shrink: 0;
  width: 240px;
}

.drama-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.rank-tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}
.rank-tabs span {
  font-size: 26px;
  color: #999;
  cursor: pointer;
  padding-bottom: 6px;
  border-bottom: 3px solid transparent;
}
.rank-tabs span.active {
  color: var(--primary, #ff4d6a);
  font-weight: 600;
  border-bottom-color: var(--primary, #ff4d6a);
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rank-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
}
.rank-num {
  font-size: 28px;
  font-weight: 700;
  color: #ccc;
  width: 40px;
  text-align: center;
}
.rank-num.top {
  color: #ff4d6a;
}
.rank-cover {
  width: 100px;
  height: 133px;
  border-radius: 8px;
  object-fit: cover;
}
.rank-info {
  flex: 1;
  min-width: 0;
}
.rank-title {
  font-size: 26px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rank-meta {
  font-size: 22px;
  color: #999;
  margin-top: 8px;
}
</style>
