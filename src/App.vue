<template>
  <div class="app-container">
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
import { ref, computed, provide } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from './components/common/TabBar.vue'
import SignInModal from './components/common/SignInModal.vue'
import CelebrationEffect from './components/common/CelebrationEffect.vue'

const route = useRoute()
const showSignIn = ref(false)

const tabRoutes = ['/', '/store', '/growth', '/profile']
const showTabBar = computed(() => tabRoutes.includes(route.path))

provide('showSignIn', showSignIn)
</script>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  background: #FFF8F0;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
