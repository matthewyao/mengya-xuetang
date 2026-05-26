const audioCtx = typeof AudioContext !== 'undefined' ? new AudioContext() : null

export function playTone(freq, duration = 0.3) {
  if (!audioCtx) return
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.frequency.value = freq
  osc.type = 'sine'
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration)
  osc.start()
  osc.stop(audioCtx.currentTime + duration)
}

export function playSuccess() {
  playTone(523, 0.15)
  setTimeout(() => playTone(659, 0.15), 150)
  setTimeout(() => playTone(784, 0.3), 300)
}

export function playClick() {
  playTone(800, 0.08)
}

export function playError() {
  playTone(300, 0.2)
}

export function playLevelUp() {
  const notes = [523, 587, 659, 698, 784, 880, 988, 1047]
  notes.forEach((n, i) => setTimeout(() => playTone(n, 0.2), i * 100))
}

export function speak(text, lang = 'zh-CN') {
  if (!('speechSynthesis' in window)) return
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = lang
  utter.rate = 0.8
  utter.pitch = 1.2
  speechSynthesis.speak(utter)
}
