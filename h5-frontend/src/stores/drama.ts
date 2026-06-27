import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dramaApi, episodeApi } from '@/api'

export const useDramaStore = defineStore('drama', () => {
  const featured = ref<any[]>([])
  const newRelease = ref<any[]>([])
  const ranking = ref<any[]>([])
  const rankingType = ref('hot')
  const searchResults = ref<any[]>([])
  const currentDrama = ref<any>(null)
  const categories = ref<any[]>([])

  async function fetchHomeData() {
    await Promise.all([fetchFeatured(), fetchNewRelease(), fetchRanking('hot')])
  }

  async function fetchFeatured(limit = 10) {
    try {
      featured.value = await dramaApi.getFeatured(limit) as any
    } catch (e) { console.error(e) }
  }

  async function fetchNewRelease(limit = 10) {
    try {
      newRelease.value = await dramaApi.getNewRelease(limit) as any
    } catch (e) { console.error(e) }
  }

  async function fetchRanking(type: string, limit = 10) {
    try {
      ranking.value = await dramaApi.getRanking(type, limit) as any
    } catch (e) { console.error(e) }
  }

  async function fetchDetail(id: number) {
    try {
      currentDrama.value = await dramaApi.getDetail(id)
      return currentDrama.value
    } catch (e) { console.error(e) }
  }

  async function search(keyword: string, page = 1) {
    try {
      const res: any = await dramaApi.search(keyword, page)
      searchResults.value = res.items || res
      return res
    } catch (e) { console.error(e) }
  }

  async function fetchCategories() {
    try {
      categories.value = await dramaApi.getCategories() as any
    } catch (e) { console.error(e) }
  }

  return {
    featured, newRelease, ranking, rankingType, searchResults, currentDrama, categories,
    fetchFeatured, fetchNewRelease, fetchRanking, fetchDetail, search, fetchCategories, fetchHomeData,
  }
})
