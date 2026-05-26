<template>
  <div class="page page-no-tab lesson-page english-theme">
    <div class="lesson-header">
      <button class="btn-back" @click="$router.back()">← 返回</button>
      <div class="lesson-title">{{ lessonData?.letter || lessonData?.title || '' }}</div>
      <StarRating :count="stars" />
    </div>

    <div v-if="lessonData" class="lesson-content">
      <!-- Alphabet Lesson -->
      <div v-if="lessonData.letter" class="step-display anim-bounce">
        <div v-if="subStep === 0" class="letter-card">
          <div class="letter-big">{{ lessonData.letter }}</div>
          <div class="letter-emoji">{{ lessonData.emoji }}</div>
          <div class="letter-word">{{ lessonData.word }}</div>
          <button class="btn-listen" @click="speakWord">🔊 {{ lessonData.word }}</button>
          <button class="btn-primary" @click="subStep = 1; userStore.updateTaskProgress('recording')">跟读练习 →</button>
        </div>
        <div v-if="subStep === 1" class="record-step">
          <div class="letter-big-card">{{ lessonData.letter }}</div>
          <div class="record-hint">🎤 读一读：{{ lessonData.word }}</div>
          <RecordingButton @recorded="onRecorded" @playStandard="speakWord" />
          <button class="btn-primary" @click="subStep = 2" :disabled="!hasRecorded">继续 →</button>
        </div>
        <div v-if="subStep === 2" class="match-step">
          <div class="match-hint">🎯 听一听，选出正确的图片</div>
          <div class="match-options">
            <div v-for="opt in matchOptions" :key="opt.emoji" class="match-card" :class="{ selected: selectedMatch === opt.emoji, correct: showMatchResult && opt.emoji === lessonData.emoji, wrong: showMatchResult && selectedMatch === opt.emoji && opt.emoji !== lessonData.emoji }" @click="selectMatch(opt.emoji)">
              <span class="match-emoji">{{ opt.emoji }}</span>
              <span class="match-word">{{ showMatchResult ? opt.word : '' }}</span>
            </div>
          </div>
          <button v-if="selectedMatch && !showMatchResult" class="btn-primary" @click="checkMatch">确定</button>
          <button v-if="showMatchResult" class="btn-primary" @click="completeEnglish">完成 ✅</button>
        </div>
      </div>

      <!-- Word Match Lesson -->
      <div v-if="lessonData.type === 'match'" class="step-match-game">
        <div class="match-hint">🎯 把英文和中文连起来</div>
        <div class="match-game-area">
          <div class="match-col">
            <div v-for="pair in lessonData.pairs" :key="pair.en" class="match-word-card" :class="{ matched: matchedEn.includes(pair.en), selected: selectedEn === pair.en }" @click="selectEn(pair.en)">
              {{ pair.en }}
            </div>
          </div>
          <div class="match-col">
            <div v-for="pair in shuffledPairs" :key="pair.zh" class="match-word-card" :class="{ matched: matchedZh.includes(pair.zh), selected: selectedZh === pair.zh }" @click="selectZh(pair.zh)">
              {{ pair.emoji }} {{ pair.zh }}
            </div>
          </div>
        </div>
        <div class="match-score">配对: {{ matchedEn.length }}/{{ lessonData.pairs.length }}</div>
        <button v-if="matchedEn.length === lessonData.pairs.length" class="btn-primary" @click="completeEnglish">完成 ✅</button>
      </div>

      <!-- Result -->
      <div v-if="step === 'result'" class="step-result anim-bounce">
        <div class="result-emoji">🎉</div>
        <div class="result-title">太棒了！</div>
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
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useProgressStore } from '../stores/progress'
import { getAllEnglishLessons } from '../data/english'
import { speak, playSuccess, playClick } from '../utils/audio'
import StarRating from '../components/common/StarRating.vue'
import RecordingButton from '../components/common/RecordingButton.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const progressStore = useProgressStore()

const step = ref(0)
const subStep = ref(0)
const stars = ref(0)
const hasRecorded = ref(false)
const selectedMatch = ref(null)
const showMatchResult = ref(false)
const rewardCoins = ref(0)
const rewardExp = ref(0)
const selectedEn = ref(null)
const selectedZh = ref(null)
const matchedEn = ref([])
const matchedZh = ref([])

const allLessons = getAllEnglishLessons()
const lessonData = computed(() => allLessons.find(l => l.id === route.params.lessonId))

const matchOptions = computed(() => {
  if (!lessonData.value || !lessonData.value.emoji) return []
  const correct = { emoji: lessonData.value.emoji, word: lessonData.value.word }
  const others = allLessons.filter(l => l.letter && l.id !== lessonData.value.id).sort(() => Math.random() - 0.5).slice(0, 3).map(l => ({ emoji: l.emoji, word: l.word }))
  return [correct, ...others].sort(() => Math.random() - 0.5)
})

const shuffledPairs = computed(() => {
  if (!lessonData.value?.pairs) return []
  return [...lessonData.value.pairs].sort(() => Math.random() - 0.5)
})

function speakWord() {
  if (lessonData.value?.word) speak(lessonData.value.word, 'en-US')
}

function onRecorded() {
  hasRecorded.value = true
  userStore.updateTaskProgress('recording')
}

function selectMatch(emoji) {
  selectedMatch.value = emoji
  playClick()
}

function checkMatch() {
  showMatchResult.value = true
  if (selectedMatch.value === lessonData.value.emoji) playSuccess()
}

function selectEn(en) {
  if (matchedEn.value.includes(en)) return
  selectedEn.value = en
  playClick()
  tryMatch()
}

function selectZh(zh) {
  if (matchedZh.value.includes(zh)) return
  selectedZh.value = zh
  playClick()
  tryMatch()
}

function tryMatch() {
  if (!selectedEn.value || !selectedZh.value) return
  const pair = lessonData.value.pairs.find(p => p.en === selectedEn.value && p.zh === selectedZh.value)
  if (pair) {
    matchedEn.value.push(selectedEn.value)
    matchedZh.value.push(selectedZh.value)
    playSuccess()
  }
  selectedEn.value = null
  selectedZh.value = null
}

function completeEnglish() {
  stars.value = 3
  rewardCoins.value = 17
  rewardExp.value = 29
  userStore.addCoins(rewardCoins.value)
  userStore.addExp(rewardExp.value)
  progressStore.completeLesson('english', lessonData.value.id, stars.value)
  userStore.updateTaskProgress('english')
  playSuccess()
  step.value = 'result'
}

function retryLesson() {
  step.value = 0
  subStep.value = 0
  stars.value = 0
  hasRecorded.value = false
  selectedMatch.value = null
  showMatchResult.value = false
  matchedEn.value = []
  matchedZh.value = []
}

function nextLesson() {
  const idx = allLessons.findIndex(l => l.id === route.params.lessonId)
  if (idx < allLessons.length - 1) {
    router.replace('/english/' + allLessons[idx + 1].id)
    retryLesson()
  } else {
    router.push('/subject/english')
  }
}
</script>

<style scoped>
.lesson-page { background: linear-gradient(180deg, #EDE7F6, #F3E5F5); min-height: 100vh; }
.lesson-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; }
.btn-back { background: rgba(255,255,255,0.7); border: none; border-radius: 20px; padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer; }
.lesson-title { font-size: 18px; font-weight: 700; }
.lesson-content { padding: 16px; display: flex; flex-direction: column; align-items: center; }

.letter-card { background: #fff; border-radius: 20px; padding: 32px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.08); width: 100%; margin-bottom: 20px; }
.letter-big, .letter-big-card { font-size: 80px; font-weight: 700; color: #A78BFA; line-height: 1; }
.letter-big-card { background: #fff; border-radius: 20px; padding: 24px 48px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 16px; }
.letter-emoji { font-size: 48px; margin: 12px 0; }
.letter-word { font-size: 24px; font-weight: 600; margin-bottom: 12px; color: #666; }
.btn-listen { background: linear-gradient(135deg, #A78BFA, #7C3AED); color: #fff; border: none; border-radius: 30px; padding: 12px 24px; font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: 12px; }

.record-step, .match-step { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.record-hint, .match-hint { font-size: 16px; font-weight: 600; color: #666; }

.match-options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; max-width: 300px; }
.match-card { background: #fff; border: 3px solid #E0E0E0; border-radius: 16px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; }
.match-card.selected { border-color: #A78BFA; background: #EDE7F6; }
.match-card.correct { border-color: #4CAF50; background: #C8E6C9; }
.match-card.wrong { border-color: #FF5252; background: #FFCDD2; }
.match-emoji { font-size: 32px; display: block; }
.match-word { font-size: 14px; color: #666; }

.match-game-area { display: flex; gap: 24px; width: 100%; justify-content: center; margin: 16px 0; }
.match-col { display: flex; flex-direction: column; gap: 10px; }
.match-word-card { background: #fff; border: 2px solid #E0E0E0; border-radius: 12px; padding: 12px 20px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; text-align: center; min-width: 100px; }
.match-word-card.selected { border-color: #A78BFA; background: #EDE7F6; }
.match-word-card.matched { background: #C8E6C9; border-color: #4CAF50; opacity: 0.6; }
.match-score { font-size: 16px; font-weight: 600; color: #A78BFA; }

.step-result { text-align: center; width: 100%; }
.result-emoji { font-size: 64px; margin-bottom: 8px; }
.result-title { font-size: 24px; font-weight: 700; margin-bottom: 12px; }
.result-rewards { display: flex; justify-content: center; gap: 24px; margin: 16px 0; }
.reward-item { font-size: 18px; font-weight: 600; }
.result-buttons { display: flex; gap: 12px; justify-content: center; margin-top: 16px; }
.btn-secondary { background: #fff; border: 2px solid #A78BFA; border-radius: 30px; padding: 12px 24px; font-size: 15px; font-weight: 600; color: #A78BFA; cursor: pointer; }
</style>
