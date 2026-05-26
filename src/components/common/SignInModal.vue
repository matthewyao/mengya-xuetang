<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal anim-bounce">
      <div class="title">🌟 每日签到 🌟</div>
      <div class="grid">
        <div v-for="d in 7" :key="d" class="day-cell" :class="{ done: d <= currentDay, today: d === currentDay + 1 }">
          <div class="day-label">{{ ['一','二','三','四','五','六','日'][d-1] }}</div>
          <div class="day-icon">{{ d <= currentDay ? '✅' : d === 7 ? '🎁' : '⬜' }}</div>
          <div class="day-reward">+{{ rewards[d].coins }}🪙</div>
        </div>
      </div>
      <div class="streak-info">连续签到: {{ streakDays }}天</div>
      <div class="reward-info" v-if="!signedToday">
        今日奖励: 🪙{{ rewards[currentDay + 1]?.coins || 5 }} + ⭐{{ rewards[currentDay + 1]?.exp || 5 }}
      </div>
      <button class="btn-sign" :class="{ done: signedToday }" @click="handleSignIn" :disabled="signedToday">
        {{ signedToday ? '✅ 已签到' : '✨ 立即签到' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../../stores/user'
import { playSuccess } from '../../utils/audio'

const emit = defineEmits(['close'])
const user = useUserStore()

const rewards = {
  1: { coins: 5, exp: 5 }, 2: { coins: 8, exp: 8 }, 3: { coins: 10, exp: 10 },
  4: { coins: 15, exp: 15 }, 5: { coins: 20, exp: 20 }, 6: { coins: 25, exp: 25 },
  7: { coins: 50, exp: 50 },
}

const streakDays = computed(() => user.streakDays)
const currentDay = computed(() => ((user.streakDays - 1) % 7) + (user.signedToday ? 1 : 0))
const signedToday = computed(() => user.signedToday)

function handleSignIn() {
  const result = user.signIn()
  if (result) {
    playSuccess()
  }
}
</script>

<style scoped>
.overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; border-radius: 20px; padding: 24px; width: 90%; max-width: 360px; text-align: center; }
.title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 16px; }
.day-cell { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 2px; border-radius: 8px; }
.day-cell.done { background: #FFF3E0; }
.day-cell.today { background: #FFE0B2; }
.day-label { font-size: 11px; color: #999; }
.day-icon { font-size: 18px; }
.day-reward { font-size: 9px; color: #999; }
.streak-info { font-size: 14px; color: #666; margin-bottom: 8px; }
.reward-info { font-size: 14px; color: var(--color-primary); font-weight: 600; margin-bottom: 16px; }
.btn-sign { background: linear-gradient(135deg, #FF8C42, #FF6B2B); color: #fff; border: none; border-radius: 30px; padding: 12px 40px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; }
.btn-sign.done { background: #E0E0E0; color: #999; }
</style>
