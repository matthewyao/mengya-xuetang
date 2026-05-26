<template>
  <div v-if="active" class="celebration">
    <div v-for="i in 30" :key="i" class="confetti" :style="confettiStyle(i)"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const active = ref(false)

function confettiStyle(i) {
  const colors = ['#FF8C42', '#4ECDC4', '#A78BFA', '#FFD700', '#FF5252', '#34D399']
  return {
    left: Math.random() * 100 + '%',
    animationDelay: Math.random() * 0.5 + 's',
    animationDuration: (1 + Math.random()) + 's',
    background: colors[i % colors.length],
    width: (6 + Math.random() * 8) + 'px',
    height: (6 + Math.random() * 8) + 'px',
    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
  }
}

function show() {
  active.value = true
  setTimeout(() => active.value = false, 2000)
}

defineExpose({ show })
</script>

<style scoped>
.celebration { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999; overflow: hidden; }
.confetti { position: absolute; top: -20px; animation: confetti-fall linear forwards; }
</style>
