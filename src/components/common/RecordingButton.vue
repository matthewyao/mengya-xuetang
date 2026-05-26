<template>
  <div class="recording-area">
    <canvas ref="canvasRef" class="waveform" width="280" height="60"></canvas>
    <div class="rec-controls">
      <button class="btn-record" :class="{ recording }" @click="toggleRecord">
        <span class="mic-icon">{{ recording ? '⏹' : '🎤' }}</span>
        <span>{{ recording ? '停止录音' : '按住录音' }}</span>
      </button>
    </div>
    <div v-if="score !== null" class="score-display">
      <div class="score-stars">
        <span v-for="i in 3" :key="i" class="score-star" :class="{ filled: i <= scoreStars }">⭐</span>
      </div>
      <div class="score-text">{{ scoreText }}</div>
    </div>
    <div v-if="hasRecording" class="playback-row">
      <button class="btn-play" @click="playRecording">▶ 我的发音</button>
      <button class="btn-play" @click="$emit('playStandard')">▶ 标准发音</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { playSuccess, playError } from '../../utils/audio'

const emit = defineEmits(['recorded', 'playStandard'])

const canvasRef = ref(null)
const recording = ref(false)
const score = ref(null)
const hasRecording = ref(false)
const scoreStars = ref(0)

let mediaRecorder = null
let audioChunks = []
let audioBlob = null
let audioUrl = null
let analyser = null
let animFrame = null
let audioCtx = null

const scoreText = ref('')

async function toggleRecord() {
  if (recording.value) {
    stopRecord()
  } else {
    await startRecord()
  }
}

async function startRecord() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const source = audioCtx.createMediaStreamSource(stream)
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)

    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data)
    mediaRecorder.onstop = () => {
      audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
      audioUrl = URL.createObjectURL(audioBlob)
      hasRecording.value = true
      stream.getTracks().forEach(t => t.stop())
      emit('recorded', audioBlob)
    }
    mediaRecorder.start()
    recording.value = true
    score.value = null
    drawWaveform()
  } catch (err) {
    console.error('录音失败:', err)
    alert('请允许麦克风权限后重试')
  }
}

function stopRecord() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  recording.value = false
  cancelAnimationFrame(animFrame)
  // Simulate AI scoring
  setTimeout(() => {
    const s = Math.floor(Math.random() * 2) + 2 // 2-3 stars
    scoreStars.value = s
    score.value = s
    scoreText.value = s >= 3 ? '太棒了！发音很标准！' : '不错哦，再练一练更好！'
    if (s >= 3) playSuccess()
    else playError()
  }, 800)
}

function drawWaveform() {
  if (!canvasRef.value || !analyser) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  function draw() {
    if (!recording.value) return
    animFrame = requestAnimationFrame(draw)
    analyser.getByteTimeDomainData(dataArray)
    ctx.fillStyle = '#FFF5EB'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.lineWidth = 2
    ctx.strokeStyle = '#FF8C42'
    ctx.beginPath()
    const sliceWidth = canvas.width / bufferLength
    let x = 0
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0
      const y = (v * canvas.height) / 2
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      x += sliceWidth
    }
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()
  }
  draw()
}

function playRecording() {
  if (audioUrl) {
    const audio = new Audio(audioUrl)
    audio.play()
  }
}

onUnmounted(() => {
  cancelAnimationFrame(animFrame)
  if (audioCtx) audioCtx.close()
})
</script>

<style scoped>
.recording-area { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 12px; }
.waveform { width: 100%; max-width: 280px; height: 60px; border-radius: 12px; background: #FFF5EB; }
.rec-controls { display: flex; gap: 12px; }
.btn-record {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  background: linear-gradient(135deg, #FF8C42, #FF6B2B); color: #fff;
  border: none; border-radius: 50%; width: 80px; height: 80px;
  font-size: 12px; font-weight: 600; cursor: pointer; transition: transform 0.2s;
  box-shadow: 0 4px 16px rgba(255,140,66,0.4);
}
.btn-record.recording { animation: pulse 1s infinite; background: linear-gradient(135deg, #FF5252, #D32F2F); }
.btn-record:active { transform: scale(0.9); }
.mic-icon { font-size: 24px; }
.score-display { text-align: center; }
.score-stars { display: flex; gap: 4px; justify-content: center; margin-bottom: 4px; }
.score-star { font-size: 24px; filter: grayscale(1); opacity: 0.3; }
.score-star.filled { filter: none; opacity: 1; animation: star-pop 0.4s ease forwards; }
.score-text { font-size: 14px; color: #666; }
.playback-row { display: flex; gap: 8px; }
.btn-play {
  background: #FFF3E0; border: 2px solid #FF8C42; border-radius: 20px;
  padding: 8px 16px; font-size: 13px; color: #FF8C42; cursor: pointer;
}
@keyframes star-pop { 0% { transform: scale(0); } 60% { transform: scale(1.3); } 100% { transform: scale(1); } }
</style>
