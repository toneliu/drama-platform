<template>
  <div class="search page">
    <!-- 搜索栏 -->
    <van-search
      v-model="keyword"
      shape="round"
      placeholder="搜索短剧名称"
      show-action
      autofocus
      @search="doSearch"
    >
      <template #action>
        <span @click="doSearch">搜索</span>
      </template>
    </van-search>

    <!-- 分类快捷入口 -->
    <div class="cat-tags" v-if="!keyword && !results.length">
      <div
        v-for="cat in categories"
        :key="cat.name"
        class="cat-tag"
        @click="searchByCategory(cat.name)"
      >
        {{ cat.icon }} {{ cat.name }}
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="results" v-if="results.length">
      <div class="result-count">找到 {{ results.length }} 个结果</div>
      <div class="result-list">
        <div
          v-for="item in results"
          :key="item.id"
          class="result-item"
          @click="goDetail(item.id)"
        >
          <img v-lazy="item.coverUrl" class="result-cover" />
          <div class="result-info">
            <div class="result-title">{{ item.title }}</div>
            <div class="result-desc">{{ item.description }}</div>
            <div class="result-meta">
              <span>{{ item.totalEpisodes }}集</span>
              <span>{{ item.category }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <van-empty
      v-if="searched && !results.length"
      description="没有找到相关短剧"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchDrama, getCategory } from '@/api/drama'
import type { Drama } from '@/api/drama'

const route = useRoute()
const router = useRouter()

const keyword = ref('')
const results = ref<Drama[]>([])
const searched = ref(false)

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

async function doSearch() {
  if (!keyword.value.trim()) return
  searched.value = true
  try {
    results.value = await searchDrama(keyword.value.trim())
  } catch {
    results.value = []
  }
}

async function searchByCategory(name: string) {
  keyword.value = name
  searched.value = true
  try {
    results.value = await getCategory(name)
  } catch {
    results.value = []
  }
}

function goDetail(id: string) {
  router.push(`/drama/${id}`)
}

onMounted(() => {
  const category = route.query.category as string
  if (category) {
    searchByCategory(category)
  }
})
</script>

<style scoped>
.cat-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 24px;
}
.cat-tag {
  padding: 12px 24px;
  background: #fff;
  border-radius: 24px;
  font-size: 26px;
  color: #666;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.cat-tag:active {
  background: #f0f0f0;
}

.result-count {
  padding: 16px 24px;
  font-size: 24px;
  color: #999;
}
.result-list {
  padding: 0 16px;
}
.result-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
}
.result-item:active {
  background: #f8f8f8;
}
.result-cover {
  width: 160px;
  height: 213px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}
.result-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.result-title {
  font-size: 28px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.result-desc {
  font-size: 24px;
  color: #999;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}
.result-meta {
  display: flex;
  gap: 12px;
  font-size: 22px;
  color: #bbb;
}
</style>
