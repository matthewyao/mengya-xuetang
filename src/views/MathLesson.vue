<template>
  <div class="page page-no-tab lesson-page math-theme">
    <div class="lesson-header">
      <button class="btn-back" @click="$router.back()">← 返回</button>
      <div class="lesson-title">{{ lessonData?.title || '' }}</div>
      <StarRating :count="stars" />
    </div>

    <div v-if="lessonData" class="lesson-content">
      <!-- Number Recognition -->
      <div v-if="!lessonData.type" class="step-display anim-bounce">
        <div class="math-card">
          <div class="number-big">{{ lessonData.number }}</div>
          <div class="items-row">
            <span v-for="(item, i) in lessonData.items" :key="i" class="item-emoji anim-bounce" :style="{ animationDelay: i * 0.1 + 's' }">{{ item }}</span>
          </div>
          <div class="count-text">数一数：有 {{ lessonData.number }} 个{{ lessonData.emoji }}</div>
        </div>
        <div class="tap-area">
          <div v-for="(item, i) in lessonData.items" :key="'tap-'+i" class="tap-item" :class="{ tapped: tappedItems.includes(i) }" @click="tapItem(i)">
            {{ item }}
          </div>
        </div>
        <div class="count-display">{{ tappedCount }} / {{ lessonData.number }}</div>
        <button class="btn-primary" @click="completeMath" :disabled="tappedCount < lessonData.number">完成 ✅</button>
      </div>

      <!-- Addition/Subtraction -->
      <div v-if="lessonData.type === 'add' || lessonData.type === 'sub'" class="step-calc">
        <div class="calc-card">
          <div class="calc-visual">
            <div class="calc-items-left">
              <span v-for="i in lessonData.a" :key="'a'+i" class="calc-item anim-bounce" :style="{ animationDelay: i * 0.08 + 's' }">🍎</span>
            </div>
            <div class="calc-op">{{ lessonData.type === 'add' ? '+' : '-' }}</div>
            <div class="calc-items-right" v-if="lessonData.type === 'add'">
              <span v-for="i in lessonData.b" :key="'b'+i" class="calc-item anim-bounce" :style="{ animationDelay: (i + lessonData.a) * 0.08 + 's' }">🍊</span>
            </div>
          </div>
          <div class="calc-formula">{{ lessonData.a }} {{ lessonData.type === 'add' ? '+' : '-' }} {{ lessonData.b }} = ?</div>
        </div>
        <div class="answer-options">
          <button v-for="opt in answerOptions" :key="opt" class="btn-answer" :class="{ selected: selectedAnswer === opt, correct: showResult && opt === correctAnswer, wrong: showResult && selectedAnswer === opt && opt !== correctAnswer }" @click="selectAnswer(opt)">
            {{ opt }}
          </button>
        </div>
        <button v-if="selectedAnswer !== null && !showResult" class="btn-primary" @click="checkAnswer">确定</button>
        <div v-if="showResult" class="result-msg anim-bounce">
          {{ selectedAnswer === correctAnswer ? '🎉 答对了！' : '😅 再想想哦！正确答案是 ' + correctAnswer }}
        </div>
        <button v-if="showResult" class="btn-primary" @click="completeMath">继续 →</button>
      </div>

      <!-- Result -->
      <div v-if="step === 'result'" class="step-result anim-bounce">
        <div class="result-emoji">{{ stars >= 3 ? '🎉' : '👍' }}</div>
        <div class="result-title">{{ stars >= 3 ? '太棒了！' : '不错哦！' }}</div>
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
import { getAllMathLessons } from '../data/math'
import { playSuccess, playClick } from '../utils/audio'
import StarRating from '../components/common/StarRating.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const progressStore = useProgressStore()

const step = ref(0)
const stars = ref(0)
const tappedItems = ref([])
const tappedCount = computed(() => tappedItems.value.length)
const selectedAnswer = ref(null)
const showResult = ref(false)
const rewardCoins = ref(0)
const rewardExp = ref(0)

const allLessons = getAllMathLessons()
const lessonData = computed(() => allLessons.find(l => l.id === route.params.lessonId))

const correctAnswer = computed(() => {
  if (!lessonData.value) return 0
  const d = lessonData.value
  if (d.type === 'add') return d.a + d.b
  if (d.type === 'sub') return d.a - d.b
  return 0
})

const answerOptions = computed(() => {
  const correct = correctAnswer.value
  const opts = new Set([correct])
  while (opts.size < 4) {
    const r = correct + Math.floor(Math.random() * 7) - 3
    if (r >= 0 && r !== correct) opts.add(r)
  }
  return [...opts].sort(() => Math.random() - 0.5)
})

function tapItem(i) {
  if (!tappedItems.value.includes(i)) {
    tappedItems.value.push(i)
    playClick()
  }
}

function selectAnswer(opt) {
  selectedAnswer.value = opt
  playClick()
}

function checkAnswer() {
  showResult.value = true
  if (selectedAnswer.value === correctAnswer.value) {
    playSuccess()
  }
}

function completeMath() {
  playClick()
  if (step.value !== 'result') {
    stars.value = (lessonData.value.type ? (selectedAnswer.value === correctAnswer.value ? 3 : 1) : (tappedCount.value >= lessonData.value.number ? 3 : 2))
    rewardCoins.value = stars.value * 5 + 2
    rewardExp.value = stars.value * 8 + 5
    userStore.addCoins(rewardCoins.value)
    userStore.addExp(rewardExp.value)
    progressStore.completeLesson('math', lessonData.value.id, stars.value)
    userStore.updateTaskProgress('math')
    playSuccess()
    step.value = 'result'
  }
}

function retryLesson() {
  step.value = 0
  stars.value = 0
  tappedItems.value = []
  selectedAnswer.value = null
  showResult.value = false
}

function nextLesson() {
  const idx = allLessons.findIndex(l => l.id === route.params.lessonId)
  if (idx < allLessons.length - 1) {
    router.replace('/math/' + allLessons[idx + 1].id)
    step.value = 0
    stars.value = 0
    tappedItems.value = []
    selectedAnswer.value = null
    showResult.value = false
  } else {
    router.push('/subject/math')
  }
}
</script>

<style scoped>
.lesson-page { background: linear-gradient(180deg, #E0F7FA, #E0F2F1); min-height: 100vh; }
.lesson-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; }
.btn-back { background: rgba(255,255,255,0.7); border: none; border-radius: 20px; padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer; }
.lesson-title { font-size: 18px; font-weight: 700; }
.lesson-content { padding: 16px; display: flex; flex-direction: column; align-items: center; }

.math-card, .calc-card { background: #fff; border-radius: 20px; padding: 24px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 20px; width: 100%; }
.number-big { font-size: 80px; font-weight: 700; color: #4ECDC4; }
.items-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 16px 0; }
.item-emoji { font-size: 32px; }
.count-text { font-size: 16px; font-weight: 600; color: #666; }

.tap-area { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin: 16px 0; }
.tap-item { font-size: 36px; cursor: pointer; transition: transform 0.15s; padding: 8px; border-radius: 12px; }
.tap-item:active { transform: scale(0.9); }
.tap-item.tapped { background: #C8E6C9; transform: scale(1.1); }
.count-display { font-size: 24px; font-weight: 700; color: #4ECDC4; margin-bottom: 16px; }

.calc-visual { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.calc-items-left, .calc-items-right { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; }
.calc-item { font-size: 24px; }
.calc-op { font-size: 32px; font-weight: 700; color: #4ECDC4; }
.calc-formula { font-size: 36px; font-weight: 700; color: #333; }

.answer-options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; max-width: 280px; margin-bottom: 16px; }
.btn-answer { background: #fff; border: 3px solid #E0E0E0; border-radius: 16px; padding: 16px; font-size: 24px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.btn-answer.selected { border-color: #4ECDC4; background: #E0F7FA; }
.btn-answer.correct { border-color: #4CAF50; background: #C8E6C9; }
.btn-answer.wrong { border-color: #FF5252; background: #FFCDD2; }

.result-msg { font-size: 18px; font-weight: 600; margin-bottom: 16px; text-align: center; }
.step-result { text-align: center; width: 100%; }
.result-emoji { font-size: 64px; margin-bottom: 8px; }
.result-title { font-size: 24px; font-weight: 700; margin-bottom: 12px; }
.result-rewards { display: flex; justify-content: center; gap: 24px; margin: 16px 0; }
.reward-item { font-size: 18px; font-weight: 600; }
.result-buttons { display: flex; gap: 12px; justify-content: center; margin-top: 16px; }
.btn-secondary { background: #fff; border: 2px solid #4ECDC4; border-radius: 30px; padding: 12px 24px; font-size: 15px; font-weight: 600; color: #4ECDC4; cursor: pointer; }
</style>
