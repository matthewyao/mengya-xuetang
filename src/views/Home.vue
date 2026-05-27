<template>
  <div class="page home">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <div class="logo">⛏️ 萌芽学堂</div>
      </div>
      <div class="header-right">
        <div class="stat-badge">🪙 {{ user.coins }}</div>
        <div class="stat-badge">⭐ Lv.{{ user.level }}</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <div class="action-card sign-in-card" @click="openSignIn">
        <div class="action-emoji">📅</div>
        <div class="action-info">
          <div class="action-title">每日签到</div>
          <div class="action-sub">{{ user.signedToday ? '已签到 ✅' : '连续' + user.streakDays + '天' }}</div>
        </div>
      </div>
      <div class="action-card task-card" @click="$router.push('/growth')">
        <div class="action-emoji">📋</div>
        <div class="action-info">
          <div class="action-title">今日任务</div>
          <div class="action-sub">{{ user.completedTasksCount }}/4</div>
        </div>
      </div>
    </div>

    <!-- Daily Tasks Preview -->
    <div class="section" v-if="user.dailyTasks">
      <div class="section-title">📋 今日任务</div>
      <div class="task-list">
        <div v-for="task in user.dailyTasks" :key="task.id" class="task-item" :class="{ done: task.done }">
          <span class="task-check">{{ task.done ? '✅' : '☐' }}</span>
          <span class="task-desc">{{ task.desc }}</span>
          <span class="task-reward">🪙{{ task.coins }}</span>
        </div>
      </div>
    </div>

    <!-- Subject Cards -->
    <div class="section">
      <div class="section-title">📚 学习科目</div>
      <div class="subject-grid">
        <div v-for="sub in subjects" :key="sub.type" class="subject-card" :style="{ borderColor: sub.color }" @click="$router.push('/subject/' + sub.type)">
          <div class="subject-emoji">{{ sub.emoji }}</div>
          <div class="subject-name">{{ sub.name }}</div>
          <div class="subject-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: sub.progress + '%', background: sub.color }"></div>
            </div>
            <span class="progress-text">{{ sub.progress }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Motivational Banner -->
    <div class="banner">
      <div class="banner-text">⛏️ 每天进步一点点，快乐学习每一天！</div>
    </div>
  </div>
</template>

<script setup>
import { inject, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { useProgressStore } from '../stores/progress'
import { getAllPinyinLessons } from '../data/pinyin'
import { getAllMathLessons } from '../data/math'
import { getAllEnglishLessons } from '../data/english'
import { getAllWeiqiLessons } from '../data/weiqi'

const user = useUserStore()
const progress = useProgressStore()
const showSignIn = inject('showSignIn')

onMounted(() => user.initDailyTasks())

function openSignIn() {
  showSignIn.value = true
}

function getSubjectProgress(type, total) {
  const stats = progress.getSubjectStats(type)
  return total > 0 ? Math.round((stats.completed / total) * 100) : 0
}

const subjects = computed(() => [
  { type: 'pinyin', name: '拼音', emoji: '📖', color: '#5D8C28', progress: getSubjectProgress('pinyin', getAllPinyinLessons().length) },
  { type: 'math', name: '数学', emoji: '🔢', color: '#C8302D', progress: getSubjectProgress('math', getAllMathLessons().length) },
  { type: 'english', name: '英语', emoji: '🔤', color: '#3C5AA2', progress: getSubjectProgress('english', getAllEnglishLessons().length) },
  { type: 'weiqi', name: '围棋', emoji: '♟️', color: '#1B9E5B', progress: getSubjectProgress('weiqi', getAllWeiqiLessons().length) },
])
</script>

<style scoped>
.home { padding: 16px; padding-bottom: 80px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.logo { font-size: 14px; font-family: 'Press Start 2P', monospace; text-shadow: 2px 2px 0 #373737; color: #fff; }
.header-right { display: flex; gap: 8px; }
.stat-badge {
  background: #555; padding: 6px 10px; font-size: 10px; font-weight: 400;
  font-family: 'Press Start 2P', monospace; color: #fff;
  border: 2px solid #373737; border-top-color: #8B8B8B; border-left-color: #8B8B8B;
  box-shadow: inset -2px -2px 0 #373737, inset 2px 2px 0 #8B8B8B;
}

.quick-actions { display: flex; gap: 12px; margin-bottom: 16px; }
.action-card {
  flex: 1; display: flex; align-items: center; gap: 10px;
  background: #8B8B8B; padding: 12px; cursor: pointer;
  border: 3px solid #373737; border-top-color: #C6C6C6; border-left-color: #C6C6C6;
  box-shadow: inset -3px -3px 0 #555, inset 3px 3px 0 #aaa;
}
.action-card:active {
  border-top-color: #373737; border-left-color: #373737;
  border-bottom-color: #C6C6C6; border-right-color: #C6C6C6;
}
.sign-in-card { border-left: 4px solid var(--mc-green); }
.task-card { border-left: 4px solid var(--mc-red); }
.action-emoji { font-size: 24px; }
.action-title { font-size: 10px; font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 1px 1px 0 #373737; }
.action-sub { font-size: 8px; color: #C6C6C6; font-family: 'Press Start 2P', monospace; margin-top: 4px; }

.section { margin-bottom: 16px; }
.section-title { font-size: 12px; font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 2px 2px 0 #373737; margin-bottom: 10px; }

.task-list {
  background: #8B8B8B; padding: 12px;
  border: 3px solid #373737; border-top-color: #C6C6C6; border-left-color: #C6C6C6;
  box-shadow: inset -3px -3px 0 #555, inset 3px 3px 0 #aaa;
}
.task-item {
  display: flex; align-items: center; gap: 8px; padding: 8px 0;
  border-bottom: 2px solid #555;
}
.task-item:last-child { border-bottom: none; }
.task-item.done { opacity: 0.5; }
.task-check { font-size: 14px; }
.task-desc { flex: 1; font-size: 8px; font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 1px 1px 0 #373737; }
.task-reward { font-size: 8px; color: var(--mc-gold); font-family: 'Press Start 2P', monospace; text-shadow: 1px 1px 0 #373737; }

.subject-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.subject-card {
  background: #8B8B8B; padding: 16px 12px; text-align: center; cursor: pointer;
  border: 3px solid #373737; border-top-color: #C6C6C6; border-left-color: #C6C6C6;
  box-shadow: inset -3px -3px 0 #555, inset 3px 3px 0 #aaa;
}
.subject-card:active {
  border-top-color: #373737; border-left-color: #373737;
  border-bottom-color: #C6C6C6; border-right-color: #C6C6C6;
}
.subject-emoji { font-size: 32px; margin-bottom: 8px; }
.subject-name { font-size: 12px; font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 2px 2px 0 #373737; margin-bottom: 8px; }
.progress-bar { height: 8px; background: #373737; border: 2px solid #373737; overflow: hidden; margin-bottom: 4px; }
.progress-fill { height: 100%; transition: width 0.5s ease; image-rendering: pixelated; }
.progress-text { font-size: 8px; color: #C6C6C6; font-family: 'Press Start 2P', monospace; }

.banner {
  background: #555; padding: 16px; text-align: center; margin-bottom: 16px;
  border: 3px solid #373737; border-top-color: #8B8B8B; border-left-color: #8B8B8B;
  box-shadow: inset -3px -3px 0 #373737, inset 3px 3px 0 #8B8B8B;
}
.banner-text { font-size: 10px; font-family: 'Press Start 2P', monospace; color: var(--mc-gold); text-shadow: 2px 2px 0 #373737; }
</style>
