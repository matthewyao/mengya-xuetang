<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal anim-bounce">
      <div class="title">⛏️ 每日签到 ⛏️</div>
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
        {{ signedToday ? '✅ 已签到' : '⛏️ 立即签到' }}
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
.overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal {
  background: #8B8B8B; padding: 24px; width: 90%; max-width: 360px; text-align: center;
  border: 4px solid #373737; border-top-color: #C6C6C6; border-left-color: #C6C6C6;
  box-shadow: inset -4px -4px 0 #555, inset 4px 4px 0 #aaa;
}
.title { font-size: 12px; font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 2px 2px 0 #373737; margin-bottom: 16px; }
.grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 16px; }
.day-cell {
  display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 2px;
  background: #555; border: 2px solid #373737;
}
.day-cell.done { background: var(--mc-green); }
.day-cell.today { background: var(--mc-gold); border-color: #373737; }
.day-label { font-size: 8px; color: #C6C6C6; font-family: 'Press Start 2P', monospace; }
.day-icon { font-size: 16px; }
.day-reward { font-size: 7px; color: #C6C6C6; font-family: 'Press Start 2P', monospace; }
.streak-info { font-size: 8px; color: #C6C6C6; font-family: 'Press Start 2P', monospace; margin-bottom: 8px; text-shadow: 1px 1px 0 #373737; }
.reward-info { font-size: 8px; color: var(--mc-gold); font-family: 'Press Start 2P', monospace; font-weight: 400; margin-bottom: 16px; text-shadow: 1px 1px 0 #373737; }
.btn-sign {
  background: var(--mc-green); color: #fff;
  border: 3px solid #373737; border-top-color: #8B8B8B; border-left-color: #8B8B8B;
  box-shadow: inset -3px -3px 0 #373737, inset 3px 3px 0 #8B8B8B;
  padding: 12px 40px; font-size: 10px; font-family: 'Press Start 2P', monospace;
  text-shadow: 1px 1px 0 #373737; cursor: pointer; width: 100%;
}
.btn-sign:active {
  border-top-color: #373737; border-left-color: #373737;
  border-bottom-color: #8B8B8B; border-right-color: #8B8B8B;
}
.btn-sign.done { background: #555; color: #8B8B8B; text-shadow: none; }
</style>
