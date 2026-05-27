<template>
  <div class="page page-no-tab subject-map">
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
  pinyin: { name: '📖 拼音冒险', color: '#5D8C28' },
  math: { name: '🔢 数学王国', color: '#C8302D' },
  english: { name: '🔤 英语乐园', color: '#3C5AA2' },
  weiqi: { name: '♟️ 围棋天地', color: '#1B9E5B' },
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
.subject-map { min-height: 100vh; overflow-y: auto; background: var(--mc-light); }
.map-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; }
.btn-back {
  background: #8B8B8B; border: 2px solid #373737; border-top-color: #C6C6C6; border-left-color: #C6C6C6;
  box-shadow: inset -2px -2px 0 #555, inset 2px 2px 0 #aaa;
  padding: 6px 12px; font-size: 8px; font-family: 'Press Start 2P', monospace; color: #fff;
  text-shadow: 1px 1px 0 #373737; cursor: pointer;
}
.btn-back:active {
  border-top-color: #373737; border-left-color: #373737;
  border-bottom-color: #C6C6C6; border-right-color: #C6C6C6;
}
.map-title { font-size: 12px; font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 2px 2px 0 #373737; }
.map-coins {
  background: #555; padding: 6px 10px; font-size: 10px;
  font-family: 'Press Start 2P', monospace; color: #fff;
  border: 2px solid #373737; border-top-color: #8B8B8B; border-left-color: #8B8B8B;
  box-shadow: inset -2px -2px 0 #373737, inset 2px 2px 0 #8B8B8B;
}

.map-body { padding: 8px 16px 24px; }
.map-section { margin-bottom: 24px; }
.section-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
  background: #8B8B8B; padding: 10px 14px;
  border: 2px solid #373737; border-top-color: #C6C6C6; border-left-color: #C6C6C6;
  box-shadow: inset -2px -2px 0 #555, inset 2px 2px 0 #aaa;
}
.section-emoji { font-size: 20px; }
.section-name { font-size: 10px; font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 1px 1px 0 #373737; flex: 1; }
.section-count { font-size: 8px; color: #C6C6C6; font-family: 'Press Start 2P', monospace; }

.lesson-path { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; align-items: center; }
.lesson-node-wrap { display: flex; align-items: center; }
.path-line { width: 20px; height: 4px; background: #555; }
.path-line.done { background: var(--mc-green); }

.lesson-node { display: flex; flex-direction: column; align-items: center; cursor: pointer; }
.lesson-node:active .node-inner { transform: scale(0.9); }
.lesson-node.locked { opacity: 0.35; pointer-events: none; }
.lesson-node.completed .node-inner { background: var(--mc-green); border-color: #373737; }
.lesson-node.current .node-inner { border-color: var(--mc-gold); box-shadow: 0 0 0 4px rgba(252,219,5,0.4); animation: pulse 2s infinite; }

.node-inner {
  width: 52px; height: 52px; background: #8B8B8B;
  display: flex; align-items: center; justify-content: center;
  border: 3px solid #373737; border-top-color: #C6C6C6; border-left-color: #C6C6C6;
  box-shadow: inset -3px -3px 0 #555, inset 3px 3px 0 #aaa;
  transition: all 0.2s;
}
.node-emoji { font-size: 22px; }
.node-stars { display: flex; gap: 1px; margin-top: 2px; }
.mini-star { font-size: 10px; color: #555; }
.mini-star.filled { color: var(--mc-gold); }
.node-label { font-size: 8px; font-family: 'Press Start 2P', monospace; margin-top: 4px; color: #C6C6C6; text-shadow: 1px 1px 0 #373737; }
</style>
