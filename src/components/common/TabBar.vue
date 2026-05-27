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
  { path: '/', emoji: '🏠', label: '主城' },
  { path: '/store', emoji: '⚒️', label: '商店' },
  { path: '/growth', emoji: '📈', label: '成长' },
  { path: '/profile', emoji: '🛡️', label: '我的' },
]
</script>

<style scoped>
.tabbar {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 480px; height: 64px;
  background: #555; display: flex; align-items: center; justify-content: space-around;
  border-top: 4px solid #373737; z-index: 100;
  box-shadow: inset 0 4px 0 #8B8B8B, inset 0 -2px 0 #373737;
}
.tab-item {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  text-decoration: none; color: #8B8B8B; font-size: 8px; padding: 4px 12px;
  font-family: 'Press Start 2P', monospace; transition: color 0.2s;
}
.tab-item.active { color: var(--mc-green); }
.tab-emoji { font-size: 20px; transition: transform 0.2s; }
.tab-item.active .tab-emoji { transform: scale(1.1); }
.tab-label { font-weight: 400; }
</style>
