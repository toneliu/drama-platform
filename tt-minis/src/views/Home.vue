<template>
  <div class="home">
    <!-- 顶部搜索栏 -->
    <div class="home-header safe-area-top">
      <div class="search-bar" @click="$router.push('/search')">
        <van-icon name="search" />
        <span>搜索短剧</span>
      </div>
      <div class="header-actions">
        <van-icon name="user-o" @click="$router.push('/profile')" />
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="category-nav">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="category-item"
        :class="{ active: activeCategory === cat.id }"
        @click="activeCategory = cat.id"
      >
        {{ cat.name }}
      </div>
    </div>

    <!-- 精选推荐 -->
    <section class="section">
      <div class="section-header">
        <h3>🔥 精选推荐</h3>
        <span class="more" @click="$router.push('/search')">更多 ></span>
      </div>
      <div class="drama-scroll">
        <DramaCard
          v-for="d in recommendList"
          :key="d.id"
          :drama="d"
          @click="$router.push(`/drama/${d.id}`)"
        />
      </div>
    </section>

    <!-- 新剧上线 -->
    <section class="section">
      <div class="section-header">
        <h3>🆕 新剧上线</h3>
      </div>
      <div class="drama-grid">
        <DramaCard
          v-for="d in newDramas"
          :key="d.id"
          :drama="d"
          mode="grid"
          @click="$router.push(`/drama/${d.id}`)"
        />
      </div>
    </section>

    <!-- 排行榜 -->
    <section class="section">
      <div class="section-header">
        <h3>🏆 排行榜</h3>
      </div>
      <div class="ranking-list">
        <div
          v-for="(d, idx) in rankingList"
          :key="d.id"
          class="ranking-item"
          @click="$router.push(`/drama/${d.id}`)"
        >
          <span class="rank-num" :class="{ top: idx < 3 }">{{ idx + 1 }}</span>
          <img :src="d.cover" :alt="d.title" class="rank-cover" />
          <div class="rank-info">
            <div class="rank-title">{{ d.title }}</div>
            <div class="rank-meta">{{ d.total_episodes }}集 · {{ d.category }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DramaCard from '@/components/DramaCard.vue'
import { dramaApi, type Drama } from '@/api/drama'

const activeCategory = ref('all')
const categories = ref<{ id: string; name: string; icon: string }[]>([
  { id: 'all', name: '全部', icon: '' },
  { id: 'romance', name: '甜宠', icon: '' },
  { id: 'revenge', name: '逆袭', icon: '' },
  { id: 'ceo', name: '霸总', icon: '' },
  { id: 'ancient', name: '古装', icon: '' },
  { id: 'suspense', name: '悬疑', icon: '' },
])
const recommendList = ref<Drama[]>([])
const newDramas = ref<Drama[]>([])
const rankingList = ref<Drama[]>([])

// Mock 数据（开发阶段）
const mockDramas: Drama[] = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  title: ['闪婚霸总', '重生逆袭', '穿越皇后', '豪门千金', '龙王赘婿', '神医下山', '战神归来', '都市修仙', '甜宠小娇妻', '复仇千金'][i],
  cover: `https://picsum.photos/seed/drama${i}/200/280`,
  description: '精彩短剧，不容错过',
  category: ['甜宠', '逆袭', '古装', '霸总', '逆袭', '玄幻', '都市', '修仙', '甜宠', '复仇'][i],
  total_episodes: [80, 60, 100, 75, 120, 50, 90, 88, 65, 70][i],
  is_new: i < 3,
  is_hot: i < 5,
  tags: [],
  score: (4 + Math.random()).toFixed(1) as any,
}))

onMounted(async () => {
  try {
    const [rec, newD, rank] = await Promise.all([
      dramaApi.getRecommend({ page: 1, size: 6 }),
      dramaApi.getNewDramas({ page: 1, size: 6 }),
      dramaApi.getRanking({ type: 'hot', page: 1 }),
    ])
    recommendList.value = rec.data
    newDramas.value = newD.data
    rankingList.value = rank.data
  } catch {
    // 使用 mock 数据
    recommendList.value = mockDramas.slice(0, 6)
    newDramas.value = mockDramas.slice(0, 6)
    rankingList.value = mockDramas
  }

  try {
    const catRes = await dramaApi.getCategories()
    if (catRes.data?.length) categories.value = catRes.data
  } catch { /* use default */ }
})
</script>

<style scoped>
.home {
  padding-bottom: calc(20px + var(--safe-bottom));
}
.home-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
}
.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-bg-card);
  border-radius: 20px;
  padding: 8px 16px;
  color: var(--color-text-hint);
  font-size: 14px;
}
.header-actions {
  font-size: 22px;
}
.category-nav {
  display: flex;
  gap: 12px;
  padding: 8px 16px;
  overflow-x: auto;
}
.category-item {
  flex-shrink: 0;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.category-item.active {
  background: var(--color-primary);
  color: #fff;
}
.section {
  margin-top: 20px;
  padding: 0 16px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.section-header h3 {
  font-size: 16px;
  font-weight: 600;
}
.more {
  font-size: 12px;
  color: var(--color-text-hint);
}
.drama-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;
}
.drama-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.rank-num {
  width: 24px;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-hint);
}
.rank-num.top {
  color: var(--color-primary);
}
.rank-cover {
  width: 56px;
  height: 72px;
  border-radius: 6px;
  object-fit: cover;
}
.rank-info {
  flex: 1;
}
.rank-title {
  font-size: 14px;
  font-weight: 500;
}
.rank-meta {
  font-size: 12px;
  color: var(--color-text-hint);
  margin-top: 4px;
}
</style>
