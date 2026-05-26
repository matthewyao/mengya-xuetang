import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { load, save } from '../utils/storage'
import { supabase, ensureAuth } from '../services/supabase'
import { isOnline, addToSyncQueue } from '../utils/offline'

export const useProgressStore = defineStore('progress', () => {
  const pinyinProgress = ref(load('pinyinProgress', {}))
  const mathProgress = ref(load('mathProgress', {}))
  const englishProgress = ref(load('englishProgress', {}))
  const weiqiProgress = ref(load('weiqiProgress', {}))

  const progressMap = { pinyin: pinyinProgress, math: mathProgress, english: englishProgress, weiqi: weiqiProgress }

  function getProgress(subject) {
    return progressMap[subject]?.value || {}
  }

  // 推送单条进度到云端
  async function pushLessonProgress(subject, lessonId, stars) {
    if (!isOnline()) {
      addToSyncQueue({ type: 'lesson_progress', data: { subject, lessonId, stars, date: new Date().toISOString().slice(0, 10) } })
      return
    }
    try {
      const user = await ensureAuth()
      if (!user) return
      await supabase.from('lesson_progress').upsert({
        user_id: user.id,
        subject,
        lesson_id: lessonId,
        stars,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,subject,lesson_id' })
    } catch (e) {
      addToSyncQueue({ type: 'lesson_progress', data: { subject, lessonId, stars, date: new Date().toISOString().slice(0, 10) } })
    }
  }

  function completeLesson(subject, lessonId, stars) {
    const prog = progressMap[subject]
    if (!prog.value[lessonId] || prog.value[lessonId].stars < stars) {
      prog.value[lessonId] = { stars, date: new Date().toISOString().slice(0, 10), completed: true }
    }
    save(subject + 'Progress', prog.value)
    pushLessonProgress(subject, lessonId, stars)
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

  // 从云端加载所有进度
  async function loadFromCloud() {
    try {
      const user = await ensureAuth()
      if (!user) return false

      const { data: rows } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)

      if (rows && rows.length > 0) {
        // 按科目分组
        const grouped = { pinyin: {}, math: {}, english: {}, weiqi: {} }
        rows.forEach(r => {
          if (grouped[r.subject]) {
            grouped[r.subject][r.lesson_id] = {
              stars: r.stars,
              date: r.completed_at?.slice(0, 10),
              completed: r.completed,
            }
          }
        })
        // 合并云端数据 (取更高星级)
        for (const subject of ['pinyin', 'math', 'english', 'weiqi']) {
          const cloud = grouped[subject]
          const local = progressMap[subject].value
          for (const [lessonId, data] of Object.entries(cloud)) {
            if (!local[lessonId] || local[lessonId].stars < data.stars) {
              local[lessonId] = data
            }
          }
          progressMap[subject].value = { ...local }
          save(subject + 'Progress', progressMap[subject].value)
        }
      }
      return true
    } catch (e) {
      console.error('云端进度加载失败:', e)
      return false
    }
  }

  return {
    pinyinProgress, mathProgress, englishProgress, weiqiProgress,
    getProgress, completeLesson, getLessonStars, isLessonUnlocked, getSubjectStats, totalLessonsCompleted,
    loadFromCloud,
  }
})
