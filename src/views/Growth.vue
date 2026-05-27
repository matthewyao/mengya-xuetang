<template>
  <div class="page growth">
    <div class="growth-header">
      <div class="growth-title">📈 成长中心</div>
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
    { type: 'pinyin', name: '拼音', emoji: '📖', color: '#5D8C28', total: getAllPinyinLessons().length },
    { type: 'math', name: '数学', emoji: '🔢', color: '#C8302D', total: getAllMathLessons().length },
    { type: 'english', name: '英语', emoji: '🔤', color: '#3C5AA2', total: getAllEnglishLessons().length },
    { type: 'weiqi', name: '围棋', emoji: '♟️', color: '#1B9E5B', total: getAllWeiqiLessons().length },
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
.growth-title { font-size: 14px; font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 2px 2px 0 #373737; }

.level-card {
  background: var(--mc-green); padding: 24px; text-align: center; color: #fff; margin-bottom: 16px;
  border: 4px solid #373737; border-top-color: #8B8B8B; border-left-color: #8B8B8B;
  box-shadow: inset -4px -4px 0 #373737, inset 4px 4px 0 #8B8B8B;
}
.level-badge { font-size: 28px; font-family: 'Press Start 2P', monospace; text-shadow: 3px 3px 0 #373737; }
.level-name { font-size: 10px; font-family: 'Press Start 2P', monospace; margin-bottom: 12px; opacity: 0.9; text-shadow: 1px 1px 0 #373737; }
.exp-bar { height: 12px; background: #373737; border: 2px solid #373737; overflow: hidden; margin-bottom: 8px; }
.exp-fill { height: 100%; background: linear-gradient(180deg, #7FFF00 0%, #3FBF00 50%, #2B8A00 100%); transition: width 0.5s ease; image-rendering: pixelated; }
.exp-text { font-size: 8px; font-family: 'Press Start 2P', monospace; opacity: 0.8; text-shadow: 1px 1px 0 #373737; }

.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.stat-card {
  background: #8B8B8B; padding: 14px; text-align: center;
  border: 3px solid #373737; border-top-color: #C6C6C6; border-left-color: #C6C6C6;
  box-shadow: inset -3px -3px 0 #555, inset 3px 3px 0 #aaa;
}
.stat-value { font-size: 20px; font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 2px 2px 0 #373737; }
.stat-label { font-size: 8px; color: #C6C6C6; font-family: 'Press Start 2P', monospace; margin-top: 4px; }

.section { margin-bottom: 16px; }
.section-title { font-size: 12px; font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 2px 2px 0 #373737; margin-bottom: 10px; }

.subject-progress-list {
  background: #8B8B8B; padding: 12px;
  border: 3px solid #373737; border-top-color: #C6C6C6; border-left-color: #C6C6C6;
  box-shadow: inset -3px -3px 0 #555, inset 3px 3px 0 #aaa;
}
.subject-progress-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
.sp-label { font-size: 8px; font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 1px 1px 0 #373737; min-width: 70px; }
.sp-bar { flex: 1; height: 10px; background: #373737; border: 2px solid #373737; overflow: hidden; }
.sp-fill { height: 100%; transition: width 0.5s ease; image-rendering: pixelated; }
.sp-text { font-size: 8px; color: #C6C6C6; font-family: 'Press Start 2P', monospace; min-width: 40px; text-align: right; }

.task-list {
  background: #8B8B8B; padding: 12px;
  border: 3px solid #373737; border-top-color: #C6C6C6; border-left-color: #C6C6C6;
  box-shadow: inset -3px -3px 0 #555, inset 3px 3px 0 #aaa;
}
.task-item { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 2px solid #555; }
.task-item:last-child { border-bottom: none; }
.task-item.done { opacity: 0.5; }
.task-check { font-size: 14px; }
.task-desc { flex: 1; font-size: 8px; font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 1px 1px 0 #373737; }
.task-reward { font-size: 8px; color: var(--mc-gold); font-family: 'Press Start 2P', monospace; text-shadow: 1px 1px 0 #373737; }
.task-bonus { text-align: center; padding: 8px; color: var(--mc-gold); font-size: 8px; font-family: 'Press Start 2P', monospace; text-shadow: 1px 1px 0 #373737; }

.badges-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.badge-card {
  background: #8B8B8B; padding: 12px 8px; text-align: center;
  border: 2px solid #373737; border-top-color: #C6C6C6; border-left-color: #C6C6C6;
  box-shadow: inset -2px -2px 0 #555, inset 2px 2px 0 #aaa;
}
.badge-emoji { font-size: 24px; margin-bottom: 4px; }
.badge-name { font-size: 7px; font-family: 'Press Start 2P', monospace; color: #C6C6C6; text-shadow: 1px 1px 0 #373737; }
.empty-hint {
  text-align: center; color: #C6C6C6; font-size: 8px; padding: 20px;
  font-family: 'Press Start 2P', monospace;
  background: #8B8B8B; border: 3px solid #373737; border-top-color: #C6C6C6; border-left-color: #C6C6C6;
  box-shadow: inset -3px -3px 0 #555, inset 3px 3px 0 #aaa;
}
</style>
