import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useExperimentStore = defineStore('experiment', () => {
  // 從 localStorage 讀取初始階段，預設為 1
  const currentStage = ref<number>(
    parseInt(localStorage.getItem('experimentStage') || '1')
  )

  /**
   * 設置當前實驗階段
   * @param stage - 實驗階段 (1 或 2)
   */
  function setStage(stage: number) {
    if (stage !== 1 && stage !== 2) {
      console.warn(`Invalid stage value: ${stage}, using 1 instead`)
      stage = 1
    }
    currentStage.value = stage
    // 持久化到 localStorage
    localStorage.setItem('experimentStage', stage.toString())
    console.log(`Experiment stage set to: ${stage}`)
  }

  /**
   * 重置實驗階段到第一階段
   */
  function resetStage() {
    setStage(1)
  }

  /**
   * 進入下一個階段
   */
  function nextStage() {
    if (currentStage.value === 1) {
      setStage(2)
    } else {
      console.warn('Already at the last stage')
    }
  }

  return {
    currentStage,
    setStage,
    resetStage,
    nextStage
  }
})
