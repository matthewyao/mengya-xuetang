<template>
  <div class="page page-no-tab subject-map" :style="{ background: subjectConfig.bg }">
    <!-- Header -->
    <div class="map-header">
      <button class="btn-back" @click="$router.back()">← 返回</button>
      <div class="map-title">{{ subjectConfig.name }}</div>
      <div class="map-coins">🪙 {{ userStore.coins }}</div>
    </div>

    <!-- Sections -->
    <div class="map-body">
      <div v-for="(section, si) in sections" :key="section.id" class="map-section">
        <div class="section-header">
          <span class="section-emoji">{{ section.emoji }}</span>
          <span class="section-name">{{ section.name }}</span>
          <span class="section-count">{{ getSectionCompleted(section) }}/{{ section.lessons.length }}</span>
        </div>
        <div class="lesson-path">
          <div v-for="(lesson, li) in section.lessons" :key="lesson.id" class="lesson-node-wrap">
            <div class="path-line" v-if="li > 0" :class="{ done: isCompleted(section.lessons[li-1]) }"></div>
            <div class="lesson-node" :class="nodeClass(lesson, section)" @click="goLesson(lesson)">
              <div class="node-inner">
                <span class="node-emoji">{{ lesson.emoji }}</span>
              </div>
              <div class="node-stars" v-if="getStars(lesson) > 0">
                <span v-for="s in 3" :key="s" class="mini-star" :class="{ filled: s <= getStars(lesson) }">★</span>
              </div>
              <div class="node-label">{{ lesson.pinyin || lesson.title || lesson.letter }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useProgressStore } from '../stores/progress'
import { pinyinSections, getAllPinyinLessons } from '../data/pinyin'
import { mathSections, getAllMathLessons } from '../data/math'
import { englishSections, getAllEnglishLessons } from '../data/english'
import { weiqiSections, getAllWeiqiLessons } from '../data/weiqi'
import { playClick } from '../utils/audio'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const progressStore = useProgressStore()

const subjectType = computed(() => route.params.type)

const subjectConfigMap = {
  pinyin: { name: '📖 拼音冒险', bg: 'linear-gradient(180deg, #FFF8E1, #FFF3E0)', color: '#FF8C42' },
  math: { name: '🔢 数学王国', bg: 'linear-gradient(180deg, #E0F7FA, #E0F2F1)', color: '#4ECDC4' },
  english: { name: '🔤 英语乐园', bg: 'linear-gradient(180deg, #EDE7F6, #F3E5F5)', color: '#A78BFA' },
  weiqi: { name: '♟️ 围棋天地', bg: 'linear-gradient(180deg, #E8F5E9, #F1F8E9)', color: '#34D399' },
}

const subjectConfig = computed(() => subjectConfigMap[subjectType.value] || subjectConfigMap.pinyin)

const sectionsMap = { pinyin: pinyinSections, math: mathSections, english: englishSections, weiqi: weiqiSections }
const allLessonsMap = { pinyin: getAllPinyinLessons, math: getAllMathLessons, english: getAllEnglishLessons, weiqi: getAllWeiqiLessons }

const sections = computed(() => sectionsMap[subjectType.value] || [])

function getStars(lesson) {
  return progressStore.getLessonStars(subjectType.value, lesson.id)
}

function isCompleted(lesson) {
  return getStars(lesson) > 0
}

function isUnlocked(lesson) {
  const allLessons = allLessonsMap[subjectType.value]()
  return progressStore.isLessonUnlocked(subjectType.value, lesson.id, allLessons)
}

function getSectionCompleted(section) {
  return section.lessons.filter(l => isCompleted(l)).length
}

function nodeClass(lesson, section) {
  return {
    completed: isCompleted(lesson),
    current: isUnlocked(lesson) && !isCompleted(lesson),
    locked: !isUnlocked(lesson),
  }
}

function goLesson(lesson) {
  if (!isUnlocked(lesson)) return
  playClick()
  const typeMap = { pinyin: 'pinyin', math: 'math', english: 'english', weiqi: 'weiqi' }
  router.push('/' + typeMap[subjectType.value] + '/' + lesson.id)
}
</script>

<style scoped>
.subject-map { min-height: 100vh; overflow-y: auto; }
.map-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; }
.btn-back { background: rgba(255,255,255,0.7); border: none; border-radius: 20px; padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer; }
.map-title { font-size: 18px; font-weight: 700; }
.map-coins { background: rgba(255,255,255,0.7); border-radius: 20px; padding: 4px 12px; font-size: 13px; font-weight: 600; }

.map-body { padding: 8px 16px 24px; }
.map-section { margin-bottom: 24px; }
.section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; background: rgba(255,255,255,0.6); border-radius: 12px; padding: 10px 14px; }
.section-emoji { font-size: 22px; }
.section-name { font-size: 15px; font-weight: 700; flex: 1; }
.section-count { font-size: 12px; color: #999; background: rgba(255,255,255,0.5); padding: 2px 8px; border-radius: 10px; }

.lesson-path { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; align-items: center; }
.lesson-node-wrap { display: flex; align-items: center; }
.path-line { width: 20px; height: 3px; background: #ddd; border-radius: 2px; }
.path-line.done { background: var(--color-primary); }

.lesson-node { display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.15s; }
.lesson-node:active { transform: scale(0.9); }
.lesson-node.locked { opacity: 0.35; pointer-events: none; }
.lesson-node.completed .node-inner { background: #C8E6C9; border-color: #4CAF50; }
.lesson-node.current .node-inner { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(255,140,66,0.3); animation: pulse 2s infinite; }

.node-inner {
  width: 52px; height: 52px; border-radius: 50%; background: #fff;
  display: flex; align-items: center; justify-content: center;
  border: 3px solid #ddd; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.2s;
}
.node-emoji { font-size: 22px; }
.node-stars { display: flex; gap: 1px; margin-top: 2px; }
.mini-star { font-size: 10px; color: #ddd; }
.mini-star.filled { color: #FFD700; }
.node-label { font-size: 11px; font-weight: 600; margin-top: 2px; color: #666; }
</style>
