<template>
  <div class="search-page safe-area-top">
    <!-- 搜索栏 -->
    <div class="search-header">
      <van-icon name="arrow-left" size="20" @click="$router.back()" />
      <van-search
        v-model="keyword"
        placeholder="搜索短剧名称"
        shape="round"
        background="transparent"
        autofocus
        @search="doSearch"
      />
    </div>

    <!-- 热门搜索 -->
    <div class="hot-search" v-if="!keyword && !results.length">
      <h3>热门搜索</h3>
      <div class="hot-tags">
        <van-tag
          v-for="tag in hotTags"
          :key="tag"
          size="medium"
          round
          @click="keyword = tag; doSearch()"
        >
          {{ tag }}
        </van-tag>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results" v-if="results.length">
      <div class="result-count">找到 {{ total }} 个结果</div>
      <div
        v-for="d in results"
        :key="d.id"
        class="result-item"
        @click="$router.push(`/drama/${d.id}`)"
      >
        <img :src="d.cover" :alt="d.title" class="result-cover" />
        <div class="result-info">
          <div class="result-title">{{ d.title }}</div>
          <div class="result-meta">
            <van-tag type="primary" size="mini">{{ d.category }}</van-tag>
            <span>{{ d.total_episodes }}集</span>
            <span>评分 {{ d.score }}</span>
          </div>
          <div class="result-desc">{{ d.description }}</div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <van-empty
      v-if="searched && !results.length && keyword"
      description="没有找到相关短剧"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { dramaApi, type Drama } from '@/api/drama'

const keyword = ref('')
const results = ref<Drama[]>([])
const total = ref(0)
const searched = ref(false)

const hotTags = ['霸总', '逆袭', '甜宠', '古装', '穿越', '复仇', '豪门', '赘婿']

async function doSearch() {
  if (!keyword.value.trim()) return
  try {
    const res = await dramaApi.search(keyword.value.trim(), { page: 1 })
    results.value = res.data
    total.value = res.total
  } catch {
    // Mock
    results.value = Array.from({ length: 5 }, (_, i) => ({
      id: `s${i}`,
      title: `${keyword.value}相关剧集${i + 1}`,
      cover: `https://picsum.photos/seed/search${i}/120/160`,
      description: '精彩短剧，不容错过',
      category: '推荐',
      total_episodes: 60 + i * 10,
      is_new: false,
      is_hot: i < 2,
      tags: [],
      score: (4 + Math.random()).toFixed(1) as any,
    }))
    total.value = results.value.length
  }
  searched.value = true
}
</script>

<style scoped>
.search-page {
  min-height: 100vh;
}
.search-header {
  display: flex;
  align-items: center;
  padding: 8px 8px 0;
  gap: 4px;
}
.search-header .van-search {
  flex: 1;
  padding: 8px 0;
}
.hot-search {
  padding: 16px;
}
.hot-search h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}
.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.search-results {
  padding: 0 16px;
}
.result-count {
  font-size: 12px;
  color: var(--color-text-hint);
  margin-bottom: 12px;
}
.result-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}
.result-cover {
  width: 80px;
  height: 106px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}
.result-info {
  flex: 1;
  min-width: 0;
}
.result-title {
  font-size: 15px;
  font-weight: 600;
}
.result-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-hint);
  margin-top: 6px;
}
.result-desc {
  font-size: 12px;
  color: var(--color-text-hint);
  margin-top: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
