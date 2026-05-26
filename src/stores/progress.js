import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { load, save } from '../utils/storage'

export const useProgressStore = defineStore('progress', () => {
  const pinyinProgress = ref(load('pinyinProgress', {}))
  const mathProgress = ref(load('mathProgress', {}))
  const englishProgress = ref(load('englishProgress', {}))
  const weiqiProgress = ref(load('weiqiProgress', {}))

  const progressMap = { pinyin: pinyinProgress, math: mathProgress, english: englishProgress, weiqi: weiqiProgress }

  function getProgress(subject) {
    return progressMap[subject]?.value || {}
  }

  function completeLesson(subject, lessonId, stars) {
    const prog = progressMap[subject]
    if (!prog.value[lessonId] || prog.value[lessonId].stars < stars) {
      prog.value[lessonId] = { stars, date: new Date().toISOString().slice(0, 10), completed: true }
    }
    save(subject + 'Progress', prog.value)
  }

  function getLessonStars(subject, lessonId) {
    return progressMap[subject]?.value[lessonId]?.stars || 0
  }

  function isLessonUnlocked(subject, lessonId, allLessons) {
    const idx = allLessons.findIndex(l => l.id === lessonId)
    if (idx <= 0) return true
    const prevId = allLessons[idx - 1].id
    return !!progressMap[subject]?.value[prevId]?.completed
  }

  function getSubjectStats(subject) {
    const prog = progressMap[subject]?.value || {}
    const completed = Object.values(prog).filter(v => v.completed).length
    const totalStars = Object.values(prog).reduce((s, v) => s + (v.stars || 0), 0)
    return { completed, totalStars }
  }

  const totalLessonsCompleted = computed(() => {
    return ['pinyin', 'math', 'english', 'weiqi'].reduce((sum, s) => sum + getSubjectStats(s).completed, 0)
  })

  return {
    pinyinProgress, mathProgress, englishProgress, weiqiProgress,
    getProgress, completeLesson, getLessonStars, isLessonUnlocked, getSubjectStats, totalLessonsCompleted,
  }
})
