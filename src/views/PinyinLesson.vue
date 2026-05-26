<template>
  <div class="page page-no-tab lesson-page pinyin-theme">
    <div class="lesson-header">
      <button class="btn-back" @click="$router.back()">← 返回</button>
      <div class="lesson-title">{{ lessonData?.pinyin || '' }}</div>
      <StarRating :count="stars" />
    </div>

    <div v-if="lessonData" class="lesson-content">
      <!-- Step 1: Display -->
      <div v-if="step === 0" class="step-display anim-bounce">
        <div class="pinyin-card">
          <div class="pinyin-big">{{ lessonData.pinyin }}</div>
          <div class="pinyin-emoji">{{ lessonData.emoji }}</div>
          <div class="pinyin-word">{{ lessonData.word }}</div>
          <div class="pinyin-desc">{{ lessonData.desc }}</div>
        </div>
        <button class="btn-primary" @click="nextStep">开始学习 →</button>
      </div>

      <!-- Step 2: Listen -->
      <div v-if="step === 1" class="step-listen">
        <div class="pinyin-big-card">{{ lessonData.pinyin }}</div>
        <div class="listen-hint">👆 点击听发音</div>
        <button class="btn-listen" @click="playPronunciation">🔊 听一听</button>
        <div class="desc-text">{{ lessonData.desc }}</div>
        <button class="btn-primary" @click="nextStep">我学会了 →</button>
      </div>

      <!-- Step 3: Record -->
      <div v-if="step === 2" class="step-record">
        <div class="pinyin-big-card">{{ lessonData.pinyin }}</div>
        <div class="record-hint">🎤 跟我读：{{ lessonData.pinyin }}</div>
        <RecordingButton @recorded="onRecorded" @playStandard="playPronunciation" />
        <button class="btn-primary" @click="nextStep" :disabled="!hasRecorded">继续 →</button>
      </div>

      <!-- Step 4: Game -->
      <div v-if="step === 3" class="step-game">
        <div class="game-hint">🎯 选出正确的拼音：{{ lessonData.word }}</div>
        <div class="bubble-area">
          <div v-for="bubble in bubbles" :key="bubble.id" class="bubble" :class="{ hit: bubble.hit, wrong: bubble.wrong }"
            @click="hitBubble(bubble)" :style="bubble.style">
            {{ bubble.pinyin }}
          </div>
        </div>
        <div class="game-score">得分: {{ gameScore }}/3</div>
      </div>

      <!-- Step 5: Result -->
      <div v-if="step === 4" class="step-result anim-bounce">
        <div class="result-emoji">{{ stars >= 3 ? '🎉' : stars >= 2 ? '👍' : '💪' }}</div>
        <div class="result-title">{{ stars >= 3 ? '太棒了！' : stars >= 2 ? '不错哦！' : '继续加油！' }}</div>
        <StarRating :count="stars" />
        <div class="result-rewards">
          <div class="reward-item">🪙 +{{ rewardCoins }}</div>
          <div class="reward-item">⭐ +{{ rewardExp }}</div>
        </div>
        <div class="result-buttons">
          <button class="btn-secondary" @click="retryLesson">再来一次</button>
          <button class="btn-primary" @click="nextLesson">下一课 →</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useProgressStore } from '../stores/progress'
import { getAllPinyinLessons, pinyinSections } from '../data/pinyin'
import { speak, playSuccess, playClick } from '../utils/audio'
import StarRating from '../components/common/StarRating.vue'
import RecordingButton from '../components/common/RecordingButton.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const progressStore = useProgressStore()

const step = ref(0)
const stars = ref(0)
const hasRecorded = ref(false)
const gameScore = ref(0)
const rewardCoins = ref(0)
const rewardExp = ref(0)

const allLessons = getAllPinyinLessons()
const lessonData = computed(() => allLessons.find(l => l.id === route.params.lessonId))

const bubbles = ref([])

function initBubbles() {
  if (!lessonData.value) return
  const correct = lessonData.value.pinyin
  const wrongPool = allLessons.filter(l => l.pinyin !== correct).map(l => l.pinyin)
  const wrong = wrongPool.sort(() => Math.random() - 0.5).slice(0, 3)
  const options = [correct, ...wrong].sort(() => Math.random() - 0.5)
  bubbles.value = options.map((p, i) => ({
    id: i, pinyin: p, hit: false, wrong: false,
    style: {
      left: (10 + Math.random() * 60) + '%',
      top: (10 + Math.random() * 50) + '%',
      animationDelay: (Math.random() * 2) + 's',
    }
  }))
}

function nextStep() {
  playClick()
  if (step.value === 3) {
    // Calculate stars
    stars.value = gameScore.value >= 3 ? 3 : gameScore.value >= 2 ? 2 : 1
    rewardCoins.value = stars.value * 5 + 2
    rewardExp.value = stars.value * 8 + 5
    userStore.addCoins(rewardCoins.value)
    userStore.addExp(rewardExp.value)
    progressStore.completeLesson('pinyin', lessonData.value.id, stars.value)
    userStore.updateTaskProgress('pinyin')
    playSuccess()
  }
  step.value++
  if (step.value === 3) initBubbles()
}

function playPronunciation() {
  if (lessonData.value) speak(lessonData.value.pinyin)
}

function onRecorded() {
  hasRecorded.value = true
  userStore.updateTaskProgress('recording')
}

function hitBubble(bubble) {
  if (bubble.hit || bubble.wrong) return
  if (bubble.pinyin === lessonData.value.pinyin) {
    bubble.hit = true
    gameScore.value++
    playSuccess()
    if (gameScore.value >= 3) {
      setTimeout(() => nextStep(), 600)
    }
  } else {
    bubble.wrong = true
    setTimeout(() => bubble.wrong = false, 500)
  }
}

function retryLesson() {
  step.value = 0
  stars.value = 0
  hasRecorded.value = false
  gameScore.value = 0
}

function nextLesson() {
  const idx = allLessons.findIndex(l => l.id === route.params.lessonId)
  if (idx < allLessons.length - 1) {
    router.replace('/pinyin/' + allLessons[idx + 1].id)
    step.value = 0
    stars.value = 0
    hasRecorded.value = false
    gameScore.value = 0
  } else {
    router.push('/subject/pinyin')
  }
}

onMounted(() => initBubbles())
</script>

<style scoped>
.lesson-page { background: linear-gradient(180deg, #FFF8E1, #FFF3E0); min-height: 100vh; }
.pinyin-theme { --theme-color: #FF8C42; }
.lesson-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; }
.btn-back { background: rgba(255,255,255,0.7); border: none; border-radius: 20px; padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer; }
.lesson-title { font-size: 20px; font-weight: 700; }
.lesson-content { padding: 16px; display: flex; flex-direction: column; align-items: center; }

.pinyin-card { background: #fff; border-radius: 20px; padding: 32px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 24px; width: 100%; }
.pinyin-big, .pinyin-big-card { font-size: 72px; font-weight: 700; color: #FF8C42; line-height: 1; }
.pinyin-big-card { background: #fff; border-radius: 20px; padding: 24px 48px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 16px; }
.pinyin-emoji { font-size: 48px; margin: 12px 0; }
.pinyin-word { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
.pinyin-desc { font-size: 14px; color: #666; }

.step-listen, .step-record, .step-game { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.listen-hint, .record-hint, .game-hint { font-size: 16px; font-weight: 600; color: #666; }
.desc-text { font-size: 14px; color: #999; text-align: center; }

.btn-listen { background: linear-gradient(135deg, #FF8C42, #FF6B2B); color: #fff; border: none; border-radius: 30px; padding: 14px 32px; font-size: 16px; font-weight: 600; cursor: pointer; }

.bubble-area { width: 100%; height: 280px; position: relative; background: rgba(255,255,255,0.5); border-radius: 20px; overflow: hidden; }
.bubble {
  position: absolute; width: 64px; height: 64px; border-radius: 50%;
  background: linear-gradient(135deg, #FF8C42, #FFB74D); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; cursor: pointer;
  animation: float 3s ease-in-out infinite;
  box-shadow: 0 4px 12px rgba(255,140,66,0.3);
  transition: transform 0.2s;
}
.bubble:active { transform: scale(0.9); }
.bubble.hit { background: #4CAF50; animation: none; transform: scale(0); transition: transform 0.3s; }
.bubble.wrong { background: #FF5252; animation: shake 0.3s; }

@keyframes shake { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-8px); } }
.game-score { font-size: 18px; font-weight: 700; color: #FF8C42; }

.step-result { text-align: center; width: 100%; }
.result-emoji { font-size: 64px; margin-bottom: 8px; }
.result-title { font-size: 24px; font-weight: 700; margin-bottom: 12px; }
.result-rewards { display: flex; justify-content: center; gap: 24px; margin: 16px 0; }
.reward-item { font-size: 18px; font-weight: 600; }
.result-buttons { display: flex; gap: 12px; justify-content: center; margin-top: 16px; }
.btn-secondary { background: #fff; border: 2px solid #FF8C42; border-radius: 30px; padding: 12px 24px; font-size: 15px; font-weight: 600; color: #FF8C42; cursor: pointer; }
</style>
