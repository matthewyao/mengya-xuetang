import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { load, save } from '../utils/storage'
import { supabase, ensureAuth } from '../services/supabase'
import { isOnline, addToSyncQueue, processSyncQueue } from '../utils/offline'

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
  const cloudReady = ref(false)

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

  // === 云端同步 ===

  // 推送 profile 到云端
  async function pushProfile() {
    if (!isOnline()) {
      addToSyncQueue({ type: 'profile', data: getProfileSnapshot() })
      return
    }
    try {
      const user = await ensureAuth()
      if (!user) return
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        nickname: '萌芽小学员',
        avatar_emoji: '🐣',
        level: level.value,
        exp: exp.value,
        coins: coins.value,
        streak_days: streakDays.value,
        last_sign_in: lastSignIn.value || null,
        updated_at: new Date().toISOString(),
      })
      if (error) {
        console.error('推送profile失败:', error)
        addToSyncQueue({ type: 'profile', data: getProfileSnapshot() })
      }
    } catch (e) {
      console.error('推送profile异常:', e)
      addToSyncQueue({ type: 'profile', data: getProfileSnapshot() })
    }
  }

  function getProfileSnapshot() {
    return {
      level: level.value,
      exp: exp.value,
      coins: coins.value,
      streak_days: streakDays.value,
      last_sign_in: lastSignIn.value,
    }
  }

  // 从云端拉取数据
  async function loadFromCloud() {
    try {
      const user = await ensureAuth()
      if (!user) return false

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        // 云端有数据，覆盖本地
        coins.value = profile.coins ?? coins.value
        exp.value = profile.exp ?? exp.value
        level.value = profile.level ?? level.value
        streakDays.value = profile.streak_days ?? streakDays.value
        lastSignIn.value = profile.last_sign_in ?? lastSignIn.value
        saveLocal()
      } else {
        // 云端无数据，推送本地数据
        await pushProfile()
      }

      // 拉取徽章
      const { data: cloudBadges } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id)

      if (cloudBadges && cloudBadges.length > 0) {
        badges.value = cloudBadges.map(b => ({
          id: b.badge_id,
          name: b.badge_name,
          emoji: b.badge_emoji,
          date: b.earned_at?.slice(0, 10),
        }))
        save('badges', badges.value)
      }

      // 拉取购买记录
      const { data: cloudPurchases } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)

      if (cloudPurchases && cloudPurchases.length > 0) {
        purchasedItems.value = cloudPurchases.map(p => ({
          id: p.item_id,
          date: p.purchased_at?.slice(0, 10),
        }))
        save('purchasedItems', purchasedItems.value)
      }

      cloudReady.value = true
      return true
    } catch (e) {
      console.error('云端加载失败:', e)
      return false
    }
  }

  // 推送徽章到云端
  async function pushBadge(badge) {
    if (!isOnline()) {
      addToSyncQueue({ type: 'badge', data: badge })
      return
    }
    try {
      const user = await ensureAuth()
      if (!user) return
      await supabase.from('badges').upsert({
        user_id: user.id,
        badge_id: badge.id,
        badge_name: badge.name,
        badge_emoji: badge.emoji,
      }, { onConflict: 'user_id,badge_id' })
    } catch (e) {
      addToSyncQueue({ type: 'badge', data: badge })
    }
  }

  // 推送购买到云端
  async function pushPurchase(item) {
    if (!isOnline()) {
      addToSyncQueue({ type: 'purchase', data: item })
      return
    }
    try {
      const user = await ensureAuth()
      if (!user) return
      await supabase.from('purchases').insert({
        user_id: user.id,
        item_id: item.id,
        item_name: item.name,
        price: item.price,
      })
    } catch (e) {
      addToSyncQueue({ type: 'purchase', data: item })
    }
  }

  // === 本地操作 (立即生效 + 异步同步) ===

  function saveLocal() {
    save('coins', coins.value)
    save('exp', exp.value)
    save('level', level.value)
    save('streakDays', streakDays.value)
    save('lastSignIn', lastSignIn.value)
    save('badges', badges.value)
    save('purchasedItems', purchasedItems.value)
    save('dailyTasks', dailyTasks.value)
    save('dailyTasksDate', dailyTasksDate.value)
  }

  function addCoins(amount) {
    coins.value += amount
    save('coins', coins.value)
    pushProfile()
  }

  function spendCoins(amount) {
    if (coins.value >= amount) {
      coins.value -= amount
      save('coins', coins.value)
      pushProfile()
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
    pushProfile()
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

    // 推送签到记录到云端
    pushSignIn(day, reward)

    return { day, ...reward, isSeventh: day === 7 }
  }

  async function pushSignIn(day, reward) {
    if (!isOnline()) {
      addToSyncQueue({ type: 'sign_in', data: { day, reward, date: today() } })
      return
    }
    try {
      const user = await ensureAuth()
      if (!user) return
      await supabase.from('sign_ins').upsert({
        user_id: user.id,
        sign_date: today(),
        streak_day: day,
        coins_earned: reward.coins,
        exp_earned: reward.exp,
      }, { onConflict: 'user_id,sign_date' })
    } catch (e) {
      addToSyncQueue({ type: 'sign_in', data: { day, reward, date: today() } })
    }
  }

  function addBadge(badge) {
    if (!badges.value.find(b => b.id === badge.id)) {
      badges.value.push({ ...badge, date: today() })
      save('badges', badges.value)
      pushBadge(badge)
      return true
    }
    return false
  }

  function purchaseItem(item) {
    if (spendCoins(item.price)) {
      purchasedItems.value.push({ id: item.id, date: today() })
      save('purchasedItems', purchasedItems.value)
      pushPurchase(item)
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
    pushDailyTasks()
  }

  async function pushDailyTasks() {
    if (!isOnline()) {
      addToSyncQueue({ type: 'daily_tasks', data: { tasks: dailyTasks.value, date: today() } })
      return
    }
    try {
      const user = await ensureAuth()
      if (!user) return
      const rows = dailyTasks.value.map(t => ({
        user_id: user.id,
        task_date: today(),
        task_id: t.id,
        task_desc: t.desc,
        subject: t.subject,
        target: t.target,
        progress: t.progress,
        done: t.done,
        coins_reward: t.coins,
        exp_reward: t.exp,
      }))
      await supabase.from('daily_tasks').upsert(rows, { onConflict: 'user_id,task_date,task_id' })
    } catch (e) {
      addToSyncQueue({ type: 'daily_tasks', data: { tasks: dailyTasks.value, date: today() } })
    }
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
    if (updated) {
      save('dailyTasks', dailyTasks.value)
      pushDailyTasks()
    }
  }

  // 处理离线队列
  async function processOfflineQueue() {
    await processSyncQueue(async (action) => {
      const user = await ensureAuth()
      if (!user) return
      switch (action.type) {
        case 'profile':
          await supabase.from('profiles').upsert({ id: user.id, ...action.data, updated_at: new Date().toISOString() })
          break
        case 'badge':
          await supabase.from('badges').upsert({ user_id: user.id, badge_id: action.data.id, badge_name: action.data.name, badge_emoji: action.data.emoji }, { onConflict: 'user_id,badge_id' })
          break
        case 'purchase':
          await supabase.from('purchases').insert({ user_id: user.id, item_id: action.data.id, item_name: action.data.name, price: action.data.price })
          break
        case 'sign_in':
          await supabase.from('sign_ins').upsert({ user_id: user.id, sign_date: action.data.date, streak_day: action.data.day, coins_earned: action.data.reward.coins, exp_earned: action.data.reward.exp }, { onConflict: 'user_id,sign_date' })
          break
        case 'daily_tasks':
          if (action.data.tasks) {
            const rows = action.data.tasks.map(t => ({
              user_id: user.id, task_date: action.data.date, task_id: t.id, task_desc: t.desc,
              subject: t.subject, target: t.target, progress: t.progress, done: t.done,
              coins_reward: t.coins, exp_reward: t.exp,
            }))
            await supabase.from('daily_tasks').upsert(rows, { onConflict: 'user_id,task_date,task_id' })
          }
          break
      }
    })
  }

  const allTasksDone = computed(() => dailyTasks.value?.every(t => t.done) || false)
  const completedTasksCount = computed(() => dailyTasks.value?.filter(t => t.done).length || 0)

  return {
    coins, exp, level, streakDays, lastSignIn, signedToday, badges, purchasedItems,
    dailyTasks, dailyTasksDate, currentLevelName, currentLevelExp, nextLevelExp, expProgress,
    allTasksDone, completedTasksCount, cloudReady,
    addCoins, spendCoins, addExp, signIn, addBadge, purchaseItem, initDailyTasks, updateTaskProgress,
    loadFromCloud, processOfflineQueue,
  }
})
