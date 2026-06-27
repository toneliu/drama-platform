import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DramaDetail, Episode } from '@/api/drama'

export const usePlayerStore = defineStore('player', () => {
  const currentDrama = ref<DramaDetail | null>(null)
  const currentEpisode = ref<Episode | null>(null)
  const isPlaying = ref(false)
  const progress = ref(0)
  const duration = ref(0)

  function setCurrentDrama(drama: DramaDetail) {
    currentDrama.value = drama
  }

  function setCurrentEpisode(episode: Episode) {
    currentEpisode.value = episode
  }

  function setPlaying(playing: boolean) {
    isPlaying.value = playing
  }

  function setProgress(current: number, total: number) {
    progress.value = current
    duration.value = total
  }

  function reset() {
    currentDrama.value = null
    currentEpisode.value = null
    isPlaying.value = false
    progress.value = 0
    duration.value = 0
  }

  return {
    currentDrama,
    currentEpisode,
    isPlaying,
    progress,
    duration,
    setCurrentDrama,
    setCurrentEpisode,
    setPlaying,
    setProgress,
    reset,
  }
})
