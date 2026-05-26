<template>
  <nav class="tabbar">
    <router-link v-for="tab in tabs" :key="tab.path" :to="tab.path" class="tab-item" :class="{ active: $route.path === tab.path }">
      <span class="tab-emoji">{{ tab.emoji }}</span>
      <span class="tab-label">{{ tab.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
const tabs = [
  { path: '/', emoji: '🏠', label: '主页' },
  { path: '/store', emoji: '🛒', label: '商城' },
  { path: '/growth', emoji: '📊', label: '成长' },
  { path: '/profile', emoji: '👤', label: '我的' },
]
</script>

<style scoped>
.tabbar {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 480px; height: 64px;
  background: #fff; display: flex; align-items: center; justify-content: space-around;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.08); z-index: 100; border-radius: 16px 16px 0 0;
}
.tab-item {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  text-decoration: none; color: #999; font-size: 11px; padding: 4px 12px;
  transition: color 0.2s;
}
.tab-item.active { color: var(--color-primary); }
.tab-emoji { font-size: 22px; transition: transform 0.2s; }
.tab-item.active .tab-emoji { transform: scale(1.15); }
.tab-label { font-weight: 500; }
</style>
