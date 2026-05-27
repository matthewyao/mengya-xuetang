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
.lesson-page { background: var(--mc-light); min-height: 100vh; }
.lesson-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; }
.btn-back {
  background: #8B8B8B; border: 2px solid #373737; border-top-color: #C6C6C6; border-left-color: #C6C6C6;
  box-shadow: inset -2px -2px 0 #555, inset 2px 2px 0 #aaa;
  padding: 6px 12px; font-size: 8px; font-family: 'Press Start 2P', monospace; color: #fff;
  text-shadow: 1px 1px 0 #373737; cursor: pointer;
}
.btn-back:active { border-top-color: #373737; border-left-color: #373737; border-bottom-color: #C6C6C6; border-right-color: #C6C6C6; }
.lesson-title { font-size: 12px; font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 2px 2px 0 #373737; }
.lesson-content { padding: 16px; display: flex; flex-direction: column; align-items: center; }

.math-card, .calc-card {
  background: #8B8B8B; padding: 24px; text-align: center; margin-bottom: 20px; width: 100%;
  border: 3px solid #373737; border-top-color: #C6C6C6; border-left-color: #C6C6C6;
  box-shadow: inset -3px -3px 0 #555, inset 3px 3px 0 #aaa;
}
.number-big { font-size: 80px; font-weight: 700; color: var(--mc-red); text-shadow: 4px 4px 0 #373737; }
.items-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 16px 0; }
.item-emoji { font-size: 32px; }
.count-text { font-size: 10px; font-family: 'Press Start 2P', monospace; color: #C6C6C6; text-shadow: 1px 1px 0 #373737; }

.tap-area { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin: 16px 0; }
.tap-item { font-size: 36px; cursor: pointer; padding: 8px; border: 2px solid transparent; }
.tap-item:active { transform: scale(0.9); }
.tap-item.tapped { background: var(--mc-green); border: 2px solid #373737; transform: scale(1.1); }
.count-display { font-size: 20px; font-family: 'Press Start 2P', monospace; color: var(--mc-red); text-shadow: 2px 2px 0 #373737; margin-bottom: 16px; }

.calc-visual { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.calc-items-left, .calc-items-right { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; }
.calc-item { font-size: 24px; }
.calc-op { font-size: 32px; font-weight: 700; color: var(--mc-red); text-shadow: 2px 2px 0 #373737; }
.calc-formula { font-size: 28px; font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 3px 3px 0 #373737; }

.answer-options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; max-width: 280px; margin-bottom: 16px; }
.btn-answer {
  background: #8B8B8B; border: 3px solid #373737; border-top-color: #C6C6C6; border-left-color: #C6C6C6;
  box-shadow: inset -3px -3px 0 #555, inset 3px 3px 0 #aaa;
  padding: 16px; font-size: 20px; font-family: 'Press Start 2P', monospace; color: #fff;
  text-shadow: 2px 2px 0 #373737; cursor: pointer;
}
.btn-answer:active { border-top-color: #373737; border-left-color: #373737; border-bottom-color: #C6C6C6; border-right-color: #C6C6C6; }
.btn-answer.selected { background: var(--mc-blue); border-color: #373737; }
.btn-answer.correct { background: var(--mc-green); border-color: #373737; }
.btn-answer.wrong { background: var(--mc-red); border-color: #373737; }

.result-msg { font-size: 10px; font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 2px 2px 0 #373737; margin-bottom: 16px; text-align: center; }
.step-result { text-align: center; width: 100%; }
.result-emoji { font-size: 64px; margin-bottom: 8px; }
.result-title { font-size: 14px; font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 2px 2px 0 #373737; margin-bottom: 12px; }
.result-rewards { display: flex; justify-content: center; gap: 24px; margin: 16px 0; }
.reward-item { font-size: 10px; font-family: 'Press Start 2P', monospace; color: var(--mc-gold); text-shadow: 1px 1px 0 #373737; }
.result-buttons { display: flex; gap: 12px; justify-content: center; margin-top: 16px; }
.btn-secondary {
  background: #555; border: 2px solid #373737; border-top-color: #8B8B8B; border-left-color: #8B8B8B;
  box-shadow: inset -2px -2px 0 #373737, inset 2px 2px 0 #8B8B8B;
  padding: 12px 24px; font-size: 8px; font-family: 'Press Start 2P', monospace; color: #fff;
  text-shadow: 1px 1px 0 #373737; cursor: pointer;
}
</style>
