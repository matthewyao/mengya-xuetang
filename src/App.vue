<template>
  <div class="app-container">
    <!-- 网络状态提示 -->
    <div v-if="showOfflineHint" class="offline-hint">📡 离线模式，数据将在联网后自动同步</div>

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <TabBar v-if="showTabBar" />
    <SignInModal v-if="showSignIn" @close="showSignIn = false" />
    <CelebrationEffect />
  </div>
</template>

<script setup>
import { ref, computed, provide, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from './stores/user'
import { useProgressStore } from './stores/progress'
import { onOnline } from './utils/offline'
import TabBar from './components/common/TabBar.vue'
import SignInModal from './components/common/SignInModal.vue'
import CelebrationEffect from './components/common/CelebrationEffect.vue'

const route = useRoute()
const userStore = useUserStore()
const progressStore = useProgressStore()
const showSignIn = ref(false)
const showOfflineHint = ref(false)

const tabRoutes = ['/', '/store', '/growth', '/profile']
const showTabBar = computed(() => tabRoutes.includes(route.path))

provide('showSignIn', showSignIn)

// 初始化云端数据
onMounted(async () => {
  // 检测网络状态
  if (!navigator.onLine) {
    showOfflineHint.value = true
  }

  // 监听网络恢复
  const cleanup = onOnline(async () => {
    showOfflineHint.value = false
    // 网络恢复后处理离线队列
    await userStore.processOfflineQueue()
    // 重新同步云端数据
    await userStore.loadFromCloud()
    await progressStore.loadFromCloud()
  })

  onUnmounted(cleanup)

  // 加载云端数据
  if (navigator.onLine) {
    try {
      await userStore.loadFromCloud()
      await progressStore.loadFromCloud()
    } catch (e) {
      console.error('云端初始化失败，使用本地数据:', e)
    }
  }
})
</script>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  background: #C6C6C6;
}
.offline-hint {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  max-width: 480px;
  width: 100%;
  background: #C8302D;
  color: #fff;
  text-align: center;
  padding: 8px 16px;
  font-size: 8px;
  font-family: 'Press Start 2P', monospace;
  z-index: 9999;
  animation: slideDown 0.3s ease;
  border-bottom: 3px solid #373737;
  text-shadow: 1px 1px 0 #373737;
}
@keyframes slideDown {
  from { transform: translateX(-50%) translateY(-100%); }
  to { transform: translateX(-50%) translateY(0); }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
