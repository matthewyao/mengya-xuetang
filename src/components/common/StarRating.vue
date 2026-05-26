<template>
  <div class="stars">
    <span v-for="i in 3" :key="i" class="star" :class="{ filled: i <= count, empty: i > count }">⭐</span>
  </div>
</template>

<script setup>
defineProps({ count: { type: Number, default: 0 } })
</script>

<style scoped>
.stars { display: flex; gap: 4px; justify-content: center; }
.star { font-size: 20px; transition: transform 0.3s; }
.star.empty { filter: grayscale(1); opacity: 0.3; }
.star.filled { animation: star-pop 0.4s ease forwards; }
@keyframes star-pop { 0% { transform: scale(0); } 60% { transform: scale(1.3); } 100% { transform: scale(1); } }
</style>
