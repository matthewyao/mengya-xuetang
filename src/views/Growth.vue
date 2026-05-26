<template>
  <div class="page growth">
    <div class="growth-header">
      <div class="growth-title">📊 成长中心</div>
    </div>

    <!-- Level Card -->
    <div class="level-card">
      <div class="level-badge">Lv.{{ userStore.level }}</div>
      <div class="level-name">{{ userStore.currentLevelName }}</div>
      <div class="exp-bar">
        <div class="exp-fill" :style="{ width: (userStore.expProgress * 100) + '%' }"></div>
      </div>
      <div class="exp-text">{{ userStore.exp }} / {{ userStore.nextLevelExp }} EXP</div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ userStore.coins }}</div>
        <div class="stat-label">🪙 金币</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ userStore.streakDays }}</div>
        <div class="stat-label">🔥 连续天数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ progressStore.totalLessonsCompleted }}</div>
        <div class="stat-label">📚 已学课时</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ userStore.badges.length }}</div>
        <div class="stat-label">🏅 徽章数</div>
      </div>
    </div>

    <!-- Subject Progress -->
    <div class="section">
      <div class="section-title">📈 各科进度</div>
      <div class="subject-progress-list">
        <div v-for="sub in subjectStats" :key="sub.type" class="subject-progress-item">
          <div class="sp-label">{{ sub.emoji }} {{ sub.name }}</div>
          <div class="sp-bar">
            <div class="sp-fill" :style="{ width: sub.percent + '%', background: sub.color }"></div>
          </div>
          <div class="sp-text">{{ sub.completed }}/{{ sub.total }}</div>
        </div>
      </div>
    </div>

    <!-- Daily Tasks -->
    <div class="section">
      <div class="section-title">📋 今日任务</div>
      <div class="task-list" v-if="userStore.dailyTasks">
        <div v-for="task in userStore.dailyTasks" :key="task.id" class="task-item" :class="{ done: task.done }">
          <span class="task-check">{{ task.done ? '✅' : '☐' }}</span>
          <span class="task-desc">{{ task.desc }}</span>
          <span class="task-reward">🪙{{ task.coins }}</span>
        </div>
        <div class="task-bonus" v-if="userStore.allTasksDone">🎁 全部完成！额外奖励 🪙20 + ⭐30</div>
      </div>
    </div>

    <!-- Badges -->
    <div class="section">
      <div class="section-title">🏅 我的徽章</div>
      <div class="badges-grid" v-if="userStore.badges.length > 0">
        <div v-for="badge in userStore.badges" :key="badge.id" class="badge-card">
          <div class="badge-emoji">{{ badge.emoji }}</div>
          <div class="badge-name">{{ badge.name }}</div>
        </div>
      </div>
      <div class="empty-hint" v-else>还没有获得徽章，继续学习吧！</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../stores/user'
import { useProgressStore } from '../stores/progress'
import { getAllPinyinLessons } from '../data/pinyin'
import { getAllMathLessons } from '../data/math'
import { getAllEnglishLessons } from '../data/english'
import { getAllWeiqiLessons } from '../data/weiqi'

const userStore = useUserStore()
const progressStore = useProgressStore()

const subjectStats = computed(() => {
  const defs = [
    { type: 'pinyin', name: '拼音', emoji: '📖', color: '#FF8C42', total: getAllPinyinLessons().length },
    { type: 'math', name: '数学', emoji: '🔢', color: '#4ECDC4', total: getAllMathLessons().length },
    { type: 'english', name: '英语', emoji: '🔤', color: '#A78BFA', total: getAllEnglishLessons().length },
    { type: 'weiqi', name: '围棋', emoji: '♟️', color: '#34D399', total: getAllWeiqiLessons().length },
  ]
  return defs.map(d => {
    const stats = progressStore.getSubjectStats(d.type)
    return { ...d, completed: stats.completed, percent: d.total > 0 ? Math.round((stats.completed / d.total) * 100) : 0 }
  })
})
</script>

<style scoped>
.growth { padding: 16px; padding-bottom: 80px; }
.growth-header { margin-bottom: 16px; }
.growth-title { font-size: 20px; font-weight: 700; }

.level-card { background: linear-gradient(135deg, #FF8C42, #FF6B2B); border-radius: 20px; padding: 24px; text-align: center; color: #fff; margin-bottom: 16px; box-shadow: 0 4px 16px rgba(255,140,66,0.3); }
.level-badge { font-size: 32px; font-weight: 700; }
.level-name { font-size: 16px; margin-bottom: 12px; opacity: 0.9; }
.exp-bar { height: 8px; background: rgba(255,255,255,0.3); border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
.exp-fill { height: 100%; background: #FFD700; border-radius: 4px; transition: width 0.5s ease; }
.exp-text { font-size: 12px; opacity: 0.8; }

.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.stat-card { background: #fff; border-radius: 12px; padding: 14px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.stat-value { font-size: 24px; font-weight: 700; color: #333; }
.stat-label { font-size: 12px; color: #999; margin-top: 2px; }

.section { margin-bottom: 16px; }
.section-title { font-size: 16px; font-weight: 700; margin-bottom: 10px; }

.subject-progress-list { background: #fff; border-radius: 12px; padding: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.subject-progress-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
.sp-label { font-size: 14px; font-weight: 600; min-width: 70px; }
.sp-bar { flex: 1; height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden; }
.sp-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
.sp-text { font-size: 12px; color: #999; min-width: 40px; text-align: right; }

.task-list { background: #fff; border-radius: 12px; padding: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.task-item { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
.task-item:last-child { border-bottom: none; }
.task-item.done { opacity: 0.5; }
.task-check { font-size: 16px; }
.task-desc { flex: 1; font-size: 13px; }
.task-reward { font-size: 12px; color: #FF8C42; font-weight: 600; }
.task-bonus { text-align: center; padding: 8px; color: #FF8C42; font-weight: 600; font-size: 13px; }

.badges-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.badge-card { background: #fff; border-radius: 12px; padding: 12px 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.badge-emoji { font-size: 28px; margin-bottom: 4px; }
.badge-name { font-size: 11px; font-weight: 600; color: #666; }
.empty-hint { text-align: center; color: #999; font-size: 14px; padding: 20px; background: #fff; border-radius: 12px; }
</style>
