import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { load, save } from '../utils/storage'

export const useUserStore = defineStore('user', () => {
  const coins = ref(load('coins', 100))
  const exp = ref(load('exp', 0))
  const level = ref(load('level', 1))
  const streakDays = ref(load('streakDays', 0))
  const lastSignIn = ref(load('lastSignIn', ''))
  const signedToday = computed(() => lastSignIn.value === today())
  const badges = ref(load('badges', []))
  const purchasedItems = ref(load('purchasedItems', []))
  const dailyTasks = ref(load('dailyTasks', null))
  const dailyTasksDate = ref(load('dailyTasksDate', ''))

  const levelConfig = [
    { name: '萌芽宝宝', exp: 0 },
    { name: '小小探索者', exp: 100 },
    { name: '知识萌芽', exp: 300 },
    { name: '学习小达人', exp: 600 },
    { name: '智慧之星', exp: 1000 },
    { name: '超级学霸', exp: 1500 },
    { name: '知识大师', exp: 2000 },
    { name: '萌芽王者', exp: 3000 },
    { name: '传说学者', exp: 4000 },
    { name: '萌芽之巅', exp: 5000 },
  ]

  function today() {
    return new Date().toISOString().slice(0, 10)
  }

  function calcLevel() {
    let lv = 1
    for (let i = levelConfig.length - 1; i >= 0; i--) {
      if (exp.value >= levelConfig[i].exp) { lv = i + 1; break }
    }
    return Math.min(lv, 10)
  }

  const currentLevelName = computed(() => levelConfig[Math.min(level.value - 1, 9)]?.name || '萌芽宝宝')
  const currentLevelExp = computed(() => levelConfig[Math.min(level.value - 1, 9)]?.exp || 0)
  const nextLevelExp = computed(() => levelConfig[Math.min(level.value, 9)]?.exp || levelConfig[9].exp)
  const expProgress = computed(() => {
    const range = nextLevelExp.value - currentLevelExp.value
    return range > 0 ? Math.min((exp.value - currentLevelExp.value) / range, 1) : 1
  })

  function addCoins(amount) {
    coins.value += amount
    save('coins', coins.value)
  }

  function spendCoins(amount) {
    if (coins.value >= amount) {
      coins.value -= amount
      save('coins', coins.value)
      return true
    }
    return false
  }

  function addExp(amount) {
    exp.value += amount
    const newLevel = calcLevel()
    const leveledUp = newLevel > level.value
    level.value = newLevel
    save('exp', exp.value)
    save('level', level.value)
    return leveledUp
  }

  function signIn() {
    if (signedToday.value) return null
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    if (lastSignIn.value === yesterday) {
      streakDays.value++
    } else {
      streakDays.value = 1
    }
    lastSignIn.value = today()
    save('streakDays', streakDays.value)
    save('lastSignIn', lastSignIn.value)

    const day = ((streakDays.value - 1) % 7) + 1
    const rewards = { 1: { coins: 5, exp: 5 }, 2: { coins: 8, exp: 8 }, 3: { coins: 10, exp: 10 },
      4: { coins: 15, exp: 15 }, 5: { coins: 20, exp: 20 }, 6: { coins: 25, exp: 25 },
      7: { coins: 50, exp: 50 } }
    const reward = rewards[day]
    addCoins(reward.coins)
    addExp(reward.exp)
    return { day, ...reward, isSeventh: day === 7 }
  }

  function addBadge(badge) {
    if (!badges.value.find(b => b.id === badge.id)) {
      badges.value.push({ ...badge, date: today() })
      save('badges', badges.value)
      return true
    }
    return false
  }

  function purchaseItem(item) {
    if (spendCoins(item.price)) {
      purchasedItems.value.push({ id: item.id, date: today() })
      save('purchasedItems', purchasedItems.value)
      return true
    }
    return false
  }

  function initDailyTasks() {
    if (dailyTasksDate.value === today()) return
    const allTasks = [
      { id: 't1', desc: '完成1个拼音关卡', subject: 'pinyin', target: 1, coins: 10, exp: 15 },
      { id: 't2', desc: '完成1个数学关卡', subject: 'math', target: 1, coins: 10, exp: 15 },
      { id: 't3', desc: '完成1个英语关卡', subject: 'english', target: 1, coins: 10, exp: 15 },
      { id: 't4', desc: '完成1个围棋关卡', subject: 'weiqi', target: 1, coins: 10, exp: 15 },
      { id: 't5', desc: '进行1次录音练习', subject: 'recording', target: 1, coins: 5, exp: 10 },
      { id: 't6', desc: '玩2次趣味游戏', subject: 'game', target: 2, coins: 10, exp: 10 },
    ]
    const shuffled = allTasks.sort(() => Math.random() - 0.5)
    dailyTasks.value = shuffled.slice(0, 4).map(t => ({ ...t, progress: 0, done: false }))
    dailyTasksDate.value = today()
    save('dailyTasks', dailyTasks.value)
    save('dailyTasksDate', dailyTasksDate.value)
  }

  function updateTaskProgress(subject, amount = 1) {
    if (!dailyTasks.value) return
    let updated = false
    dailyTasks.value.forEach(t => {
      if (t.subject === subject && !t.done) {
        t.progress = Math.min(t.progress + amount, t.target)
        if (t.progress >= t.target) {
          t.done = true
          addCoins(t.coins)
          addExp(t.exp)
        }
        updated = true
      }
    })
    if (updated) save('dailyTasks', dailyTasks.value)
  }

  const allTasksDone = computed(() => dailyTasks.value?.every(t => t.done) || false)
  const completedTasksCount = computed(() => dailyTasks.value?.filter(t => t.done).length || 0)

  return {
    coins, exp, level, streakDays, lastSignIn, signedToday, badges, purchasedItems,
    dailyTasks, dailyTasksDate, currentLevelName, currentLevelExp, nextLevelExp, expProgress,
    allTasksDone, completedTasksCount,
    addCoins, spendCoins, addExp, signIn, addBadge, purchaseItem, initDailyTasks, updateTaskProgress,
  }
})
