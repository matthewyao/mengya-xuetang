<template>
  <div class="page profile">
    <div class="profile-header">
      <div class="avatar">{{ avatarEmoji }}</div>
      <div class="user-info">
        <div class="username">萌芽小学员</div>
        <div class="user-level">Lv.{{ userStore.level }} {{ userStore.currentLevelName }}</div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats">
      <div class="qs-item">
        <div class="qs-value">{{ userStore.coins }}</div>
        <div class="qs-label">金币</div>
      </div>
      <div class="qs-item">
        <div class="qs-value">{{ progressStore.totalLessonsCompleted }}</div>
        <div class="qs-label">课时</div>
      </div>
      <div class="qs-item">
        <div class="qs-value">{{ userStore.streakDays }}</div>
        <div class="qs-label">连续天</div>
      </div>
    </div>

    <!-- Menu Items -->
    <div class="menu-section">
      <div class="menu-item" @click="$router.push('/growth')">
        <span class="menu-emoji">📊</span>
        <span class="menu-label">成长报告</span>
        <span class="menu-arrow">›</span>
      </div>
      <div class="menu-item" @click="$router.push('/store')">
        <span class="menu-emoji">🛒</span>
        <span class="menu-label">积分商城</span>
        <span class="menu-arrow">›</span>
      </div>
      <div class="menu-item" @click="openParentMode">
        <span class="menu-emoji">👨‍👩‍👧</span>
        <span class="menu-label">家长中心</span>
        <span class="menu-arrow">›</span>
      </div>
    </div>

    <!-- Settings -->
    <div class="menu-section">
      <div class="menu-item">
        <span class="menu-emoji">🔔</span>
        <span class="menu-label">护眼提醒</span>
        <label class="switch">
          <input type="checkbox" v-model="eyeProtect" @change="saveSetting" />
          <span class="slider"></span>
        </label>
      </div>
      <div class="menu-item">
        <span class="menu-emoji">⏱️</span>
        <span class="menu-label">每日时长限制</span>
        <span class="menu-value">{{ timeLimit }}分钟</span>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="menu-section">
      <div class="menu-item danger" @click="resetData">
        <span class="menu-emoji">🗑️</span>
        <span class="menu-label">重置所有数据</span>
      </div>
    </div>

    <div class="version">萌芽学堂 v1.0</div>

    <!-- Parent Mode Modal -->
    <div v-if="showParentModal" class="modal-overlay" @click.self="showParentModal = false">
      <div class="modal anim-bounce">
        <div class="modal-title">👨‍👩‍👧 家长中心</div>
        <div v-if="!parentAuthed" class="parent-auth">
          <div class="auth-hint">请输入家长密码（默认: 1234）</div>
          <input type="password" v-model="parentPassword" class="auth-input" placeholder="密码" />
          <button class="btn-confirm" @click="authParent">确认</button>
        </div>
        <div v-else class="parent-dashboard">
          <div class="pd-title">学习报告</div>
          <div class="pd-stats">
            <div class="pd-item">总学习课时: {{ progressStore.totalLessonsCompleted }}</div>
            <div class="pd-item">拼音: {{ progressStore.getSubjectStats('pinyin').completed }}课</div>
            <div class="pd-item">数学: {{ progressStore.getSubjectStats('math').completed }}课</div>
            <div class="pd-item">英语: {{ progressStore.getSubjectStats('english').completed }}课</div>
            <div class="pd-item">围棋: {{ progressStore.getSubjectStats('weiqi').completed }}课</div>
            <div class="pd-item">连续签到: {{ userStore.streakDays }}天</div>
            <div class="pd-item">金币余额: {{ userStore.coins }}</div>
            <div class="pd-item">当前等级: Lv.{{ userStore.level }}</div>
          </div>
        </div>
        <button class="btn-close" @click="showParentModal = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { useProgressStore } from '../stores/progress'
import { load, save, clearAll } from '../utils/storage'

const userStore = useUserStore()
const progressStore = useProgressStore()

const eyeProtect = ref(load('eyeProtect', true))
const timeLimit = ref(load('timeLimit', 20))
const showParentModal = ref(false)
const parentAuthed = ref(false)
const parentPassword = ref('')

const avatarEmoji = computed(() => {
  const emojis = ['🐣', '🐥', '🐰', '🐻', '🦊', '🐱', '🐶', '🐼']
  return emojis[userStore.level % emojis.length]
})

function saveSetting() {
  save('eyeProtect', eyeProtect.value)
}

function openParentMode() {
  parentAuthed.value = false
  parentPassword.value = ''
  showParentModal.value = true
}

function authParent() {
  if (parentPassword.value === '1234') {
    parentAuthed.value = true
  } else {
    alert('密码错误')
  }
}

function resetData() {
  if (confirm('确定要重置所有学习数据吗？此操作不可恢复。')) {
    clearAll()
    location.reload()
  }
}
</script>

<style scoped>
.profile { padding: 16px; padding-bottom: 80px; }
.profile-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; background: #fff; border-radius: 16px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.avatar { font-size: 48px; background: #FFF3E0; border-radius: 50%; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; }
.username { font-size: 18px; font-weight: 700; }
.user-level { font-size: 13px; color: #999; margin-top: 2px; }

.quick-stats { display: flex; gap: 10px; margin-bottom: 20px; }
.qs-item { flex: 1; background: #fff; border-radius: 12px; padding: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.qs-value { font-size: 22px; font-weight: 700; color: #FF8C42; }
.qs-label { font-size: 11px; color: #999; }

.menu-section { background: #fff; border-radius: 12px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }
.menu-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid #f5f5f5; cursor: pointer; }
.menu-item:last-child { border-bottom: none; }
.menu-item.danger { color: #FF5252; }
.menu-emoji { font-size: 20px; }
.menu-label { flex: 1; font-size: 15px; font-weight: 500; }
.menu-arrow { font-size: 20px; color: #ccc; }
.menu-value { font-size: 13px; color: #999; }

.switch { position: relative; width: 44px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #ccc; border-radius: 24px; transition: 0.3s; }
.slider:before { position: absolute; content: ''; height: 18px; width: 18px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: 0.3s; }
input:checked + .slider { background: #FF8C42; }
input:checked + .slider:before { transform: translateX(20px); }

.version { text-align: center; font-size: 12px; color: #ccc; margin-top: 20px; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; border-radius: 20px; padding: 24px; width: 90%; max-width: 360px; max-height: 80vh; overflow-y: auto; }
.modal-title { font-size: 20px; font-weight: 700; text-align: center; margin-bottom: 16px; }
.auth-hint { font-size: 14px; color: #666; text-align: center; margin-bottom: 12px; }
.auth-input { width: 100%; border: 2px solid #E0E0E0; border-radius: 12px; padding: 10px 14px; font-size: 16px; text-align: center; margin-bottom: 12px; }
.btn-confirm { width: 100%; background: linear-gradient(135deg, #FF8C42, #FF6B2B); color: #fff; border: none; border-radius: 20px; padding: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }
.btn-close { width: 100%; background: #f5f5f5; border: none; border-radius: 20px; padding: 10px; font-size: 14px; cursor: pointer; margin-top: 12px; }
.pd-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
.pd-stats { display: flex; flex-direction: column; gap: 8px; }
.pd-item { font-size: 14px; color: #666; }
</style>
