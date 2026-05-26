<template>
  <div class="page page-no-tab lesson-page weiqi-theme">
    <div class="lesson-header">
      <button class="btn-back" @click="$router.back()">← 返回</button>
      <div class="lesson-title">{{ lessonData?.title || '' }}</div>
      <StarRating :count="stars" />
    </div>

    <div v-if="lessonData" class="lesson-content">
      <!-- Intro type -->
      <div v-if="lessonData.type === 'intro'" class="step-intro anim-bounce">
        <div class="intro-card">
          <div class="intro-emoji">{{ lessonData.emoji }}</div>
          <div class="intro-title">{{ lessonData.title }}</div>
          <div class="intro-desc">{{ lessonData.desc }}</div>
          <div v-if="lessonData.id === 'board'" class="mini-board-demo">
            <canvas ref="demoCanvas" width="240" height="240"></canvas>
          </div>
          <div v-if="lessonData.id === 'stone'" class="stone-demo">
            <div class="stone black">⚫</div>
            <div class="stone white">⚪</div>
          </div>
        </div>
        <button class="btn-primary" @click="completeLesson">我知道了 ✅</button>
      </div>

      <!-- Practice type -->
      <div v-if="lessonData.type === 'practice' || lessonData.type === 'puzzle'" class="step-practice">
        <div class="practice-desc">{{ lessonData.desc }}</div>
        <div class="board-container">
          <canvas ref="boardCanvas" :width="boardSize" :height="boardSize" @click="handleBoardClick"></canvas>
        </div>
        <div class="practice-info">
          <span v-if="lessonData.type === 'practice'">点击交叉点落子</span>
          <span v-if="lessonData.type === 'puzzle'">找出最佳落子点</span>
        </div>
        <button class="btn-primary" @click="completeLesson">完成 ✅</button>
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useProgressStore } from '../stores/progress'
import { getAllWeiqiLessons } from '../data/weiqi'
import { playSuccess, playClick } from '../utils/audio'
import StarRating from '../components/common/StarRating.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const progressStore = useProgressStore()

const step = ref(0)
const stars = ref(0)
const rewardCoins = ref(0)
const rewardExp = ref(0)
const boardCanvas = ref(null)
const demoCanvas = ref(null)

const allLessons = getAllWeiqiLessons()
const lessonData = computed(() => allLessons.find(l => l.id === route.params.lessonId))
const boardSize = computed(() => {
  const s = lessonData.value?.size || 9
  return s * 32 + 32
})

const boardState = ref([])
const liberties = ref([])
const lastMove = ref(null)

function initBoard() {
  const size = lessonData.value?.size || 9
  boardState.value = Array(size).fill(null).map(() => Array(size).fill(0))
  // For puzzle/capture lessons, set up some stones
  if (lessonData.value?.type === 'puzzle' && size >= 5) {
    const mid = Math.floor(size / 2)
    boardState.value[mid][mid] = 2 // white
    if (mid > 0) boardState.value[mid - 1][mid] = 1 // black
    if (mid < size - 1) boardState.value[mid + 1][mid] = 1 // black
    if (mid > 0) boardState.value[mid][mid - 1] = 1 // black
  }
}

function drawBoard() {
  const canvas = boardCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const size = lessonData.value?.size || 9
  const cellSize = 32
  const padding = 16
  const total = cellSize * (size - 1) + padding * 2

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Board background
  ctx.fillStyle = '#DEB887'
  ctx.fillRect(0, 0, total, total)

  // Grid lines
  ctx.strokeStyle = '#8B7355'
  ctx.lineWidth = 1
  for (let i = 0; i < size; i++) {
    ctx.beginPath()
    ctx.moveTo(padding + i * cellSize, padding)
    ctx.lineTo(padding + i * cellSize, padding + (size - 1) * cellSize)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(padding, padding + i * cellSize)
    ctx.lineTo(padding + (size - 1) * cellSize, padding + i * cellSize)
    ctx.stroke()
  }

  // Star points (for 9x9)
  if (size === 9) {
    const starPoints = [[2, 2], [2, 6], [6, 2], [6, 6], [4, 4]]
    ctx.fillStyle = '#8B7355'
    starPoints.forEach(([r, c]) => {
      ctx.beginPath()
      ctx.arc(padding + c * cellSize, padding + r * cellSize, 3, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  // Stones
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (boardState.value[r][c] > 0) {
        const x = padding + c * cellSize
        const y = padding + r * cellSize
        const radius = cellSize / 2 - 2

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        if (boardState.value[r][c] === 1) {
          // Black stone
          const grad = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, radius)
          grad.addColorStop(0, '#555')
          grad.addColorStop(1, '#000')
          ctx.fillStyle = grad
        } else {
          // White stone
          const grad = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, radius)
          grad.addColorStop(0, '#fff')
          grad.addColorStop(1, '#ddd')
          ctx.fillStyle = grad
        }
        ctx.fill()

        // Last move marker
        if (lastMove.value && lastMove.value[0] === r && lastMove.value[1] === c) {
          ctx.fillStyle = boardState.value[r][c] === 1 ? '#fff' : '#000'
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }

  // Liberty indicators for practice mode
  if (lessonData.value?.id === 'liberty') {
    const mid = Math.floor(size / 2)
    if (boardState.value[mid][mid] === 0) {
      const liberties = [[mid - 1, mid], [mid + 1, mid], [mid, mid - 1], [mid, mid + 1]].filter(([r, c]) => r >= 0 && r < size && c >= 0 && c < size)
      liberties.forEach(([r, c]) => {
        const x = padding + c * cellSize
        const y = padding + r * cellSize
        ctx.fillStyle = 'rgba(76, 175, 80, 0.4)'
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fill()
      })
    }
  }
}

function drawDemoBoard() {
  const canvas = demoCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const size = 9
  const cellSize = 24
  const padding = 12

  ctx.fillStyle = '#DEB887'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#8B7355'
  ctx.lineWidth = 1
  for (let i = 0; i < size; i++) {
    ctx.beginPath()
    ctx.moveTo(padding + i * cellSize, padding)
    ctx.lineTo(padding + i * cellSize, padding + (size - 1) * cellSize)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(padding, padding + i * cellSize)
    ctx.lineTo(padding + (size - 1) * cellSize, padding + i * cellSize)
    ctx.stroke()
  }
  // Demo stones
  const stones = [[2, 2, 1], [2, 3, 2], [3, 2, 2], [4, 4, 1], [5, 5, 2]]
  stones.forEach(([r, c, color]) => {
    const x = padding + c * cellSize
    const y = padding + r * cellSize
    ctx.beginPath()
    ctx.arc(x, y, cellSize / 2 - 2, 0, Math.PI * 2)
    ctx.fillStyle = color === 1 ? '#333' : '#eee'
    ctx.fill()
    if (color === 2) ctx.strokeStyle = '#ccc'
    if (color === 2) ctx.stroke()
  })
}

function handleBoardClick(e) {
  const canvas = boardCanvas.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const size = lessonData.value?.size || 9
  const cellSize = 32
  const padding = 16
  const col = Math.round((x - padding) / cellSize)
  const row = Math.round((y - padding) / cellSize)

  if (row < 0 || row >= size || col < 0 || col >= size) return
  if (boardState.value[row][col] !== 0) return

  boardState.value[row][col] = 1 // Place black stone
  lastMove.value = [row, col]
  playClick()

  // Simple capture check
  checkCapture(row, col, size)
  drawBoard()
  userStore.updateTaskProgress('weiqi')
}

function checkCapture(r, c, size) {
  // Check adjacent white stones for capture
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  dirs.forEach(([dr, dc]) => {
    const nr = r + dr
    const nc = c + dc
    if (nr < 0 || nr >= size || nc < 0 || nc >= size) return
    if (boardState.value[nr][nc] !== 2) return
    // Check if this white stone has liberties
    let hasLiberty = false
    dirs.forEach(([dr2, dc2]) => {
      const nr2 = nr + dr2
      const nc2 = nc + dc2
      if (nr2 >= 0 && nr2 < size && nc2 >= 0 && nc2 < size && boardState.value[nr2][nc2] === 0) {
        hasLiberty = true
      }
    })
    if (!hasLiberty) {
      boardState.value[nr][nc] = 0 // Capture
    }
  })
}

function completeLesson() {
  stars.value = 3
  rewardCoins.value = 17
  rewardExp.value = 29
  userStore.addCoins(rewardCoins.value)
  userStore.addExp(rewardExp.value)
  progressStore.completeLesson('weiqi', lessonData.value.id, stars.value)
  userStore.updateTaskProgress('weiqi')
  playSuccess()
  step.value = 'result'
}

function retryLesson() {
  step.value = 0
  stars.value = 0
  initBoard()
  nextTick(() => {
    drawBoard()
    if (lessonData.value?.id === 'board') drawDemoBoard()
  })
}

function nextLesson() {
  const idx = allLessons.findIndex(l => l.id === route.params.lessonId)
  if (idx < allLessons.length - 1) {
    router.replace('/weiqi/' + allLessons[idx + 1].id)
    step.value = 0
    stars.value = 0
  } else {
    router.push('/subject/weiqi')
  }
}

onMounted(() => {
  initBoard()
  nextTick(() => {
    drawBoard()
    if (lessonData.value?.id === 'board') drawDemoBoard()
  })
})
</script>

<style scoped>
.lesson-page { background: linear-gradient(180deg, #E8F5E9, #F1F8E9); min-height: 100vh; }
.lesson-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; }
.btn-back { background: rgba(255,255,255,0.7); border: none; border-radius: 20px; padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer; }
.lesson-title { font-size: 18px; font-weight: 700; }
.lesson-content { padding: 16px; display: flex; flex-direction: column; align-items: center; }

.intro-card { background: #fff; border-radius: 20px; padding: 24px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.08); width: 100%; margin-bottom: 20px; }
.intro-emoji { font-size: 48px; margin-bottom: 12px; }
.intro-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.intro-desc { font-size: 15px; color: #666; line-height: 1.6; text-align: left; }
.mini-board-demo { display: flex; justify-content: center; margin-top: 16px; }
.stone-demo { display: flex; justify-content: center; gap: 24px; margin-top: 16px; }
.stone { font-size: 48px; }

.practice-desc { font-size: 14px; color: #666; margin-bottom: 12px; text-align: center; background: #fff; padding: 12px; border-radius: 12px; width: 100%; }
.board-container { display: flex; justify-content: center; margin-bottom: 12px; overflow: auto; }
canvas { border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
.practice-info { font-size: 14px; color: #999; margin-bottom: 16px; }

.step-result { text-align: center; width: 100%; }
.result-emoji { font-size: 64px; margin-bottom: 8px; }
.result-title { font-size: 24px; font-weight: 700; margin-bottom: 12px; }
.result-rewards { display: flex; justify-content: center; gap: 24px; margin: 16px 0; }
.reward-item { font-size: 18px; font-weight: 600; }
.result-buttons { display: flex; gap: 12px; justify-content: center; margin-top: 16px; }
.btn-secondary { background: #fff; border: 2px solid #34D399; border-radius: 30px; padding: 12px 24px; font-size: 15px; font-weight: 600; color: #34D399; cursor: pointer; }
</style>
