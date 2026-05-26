<template>
  <div class="page home">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <div class="logo">🌱 萌芽学堂</div>
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
        <div v-for="sub in subjects" :key="sub.type" class="subject-card" :style="{ background: sub.bg }" @click="$router.push('/subject/' + sub.type)">
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
      <div class="banner-text">🌈 每天进步一点点，快乐学习每一天！</div>
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
  { type: 'pinyin', name: '拼音', emoji: '📖', bg: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)', color: '#FF8C42', progress: getSubjectProgress('pinyin', getAllPinyinLessons().length) },
  { type: 'math', name: '数学', emoji: '🔢', bg: 'linear-gradient(135deg, #E0F7FA, #B2EBF2)', color: '#4ECDC4', progress: getSubjectProgress('math', getAllMathLessons().length) },
  { type: 'english', name: '英语', emoji: '🔤', bg: 'linear-gradient(135deg, #EDE7F6, #D1C4E9)', color: '#A78BFA', progress: getSubjectProgress('english', getAllEnglishLessons().length) },
  { type: 'weiqi', name: '围棋', emoji: '♟️', bg: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', color: '#34D399', progress: getSubjectProgress('weiqi', getAllWeiqiLessons().length) },
])
</script>

<style scoped>
.home { padding: 16px; padding-bottom: 80px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.logo { font-size: 20px; font-weight: 700; }
.header-right { display: flex; gap: 8px; }
.stat-badge { background: #fff; border-radius: 20px; padding: 4px 12px; font-size: 13px; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

.quick-actions { display: flex; gap: 12px; margin-bottom: 16px; }
.action-card { flex: 1; display: flex; align-items: center; gap: 10px; background: #fff; border-radius: 12px; padding: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); cursor: pointer; transition: transform 0.15s; }
.action-card:active { transform: scale(0.97); }
.sign-in-card { border-left: 4px solid #FF8C42; }
.task-card { border-left: 4px solid #4ECDC4; }
.action-emoji { font-size: 28px; }
.action-title { font-size: 14px; font-weight: 600; }
.action-sub { font-size: 12px; color: #999; }

.section { margin-bottom: 16px; }
.section-title { font-size: 16px; font-weight: 700; margin-bottom: 10px; }

.task-list { background: #fff; border-radius: 12px; padding: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.task-item { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
.task-item:last-child { border-bottom: none; }
.task-item.done { opacity: 0.5; }
.task-check { font-size: 16px; }
.task-desc { flex: 1; font-size: 13px; }
.task-reward { font-size: 12px; color: #FF8C42; font-weight: 600; }

.subject-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.subject-card { border-radius: 16px; padding: 20px 16px; text-align: center; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.subject-card:active { transform: scale(0.96); }
.subject-emoji { font-size: 36px; margin-bottom: 8px; }
.subject-name { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
.progress-bar { height: 6px; background: rgba(0,0,0,0.08); border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
.progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
.progress-text { font-size: 11px; color: #999; }

.banner { background: linear-gradient(135deg, #FFE0B2, #FFCC80); border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 16px; }
.banner-text { font-size: 14px; font-weight: 600; color: #E65100; }
</style>
