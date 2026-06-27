import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dramaApi, episodeApi } from '@/api'

export const useDramaStore = defineStore('drama', () => {
  const featured = ref<any[]>([])
  const newRelease = ref<any[]>([])
  const ranking = ref<any[]>([])
  const searchResults = ref<any[]>([])
  const currentDrama = ref<any>(null)

  async function fetchFeatured(limit = 10) {
    try { featured.value = await dramaApi.getFeatured(limit) as any } catch (e) { console.error(e) }
  }

  async function fetchNewRelease(limit = 10) {
    try { newRelease.value = await dramaApi.getNewRelease(limit) as any } catch (e) { console.error(e) }
  }

  async function fetchRanking(type: string, limit = 10) {
    try { ranking.value = await dramaApi.getRanking(type, limit) as any } catch (e) { console.error(e) }
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

  return {
    featured, newRelease, ranking, searchResults, currentDrama,
    fetchFeatured, fetchNewRelease, fetchRanking, fetchDetail, search,
  }
})
