<template>
  <div class="page store">
    <div class="store-header">
      <div class="store-title">⚒️ 积分商城</div>
      <div class="coin-balance">🪙 {{ userStore.coins }}</div>
    </div>

    <!-- Category Tabs -->
    <div class="category-tabs">
      <button v-for="cat in categories" :key="cat.id" class="cat-tab" :class="{ active: activeCat === cat.id }" @click="activeCat = cat.id">
        {{ cat.emoji }} {{ cat.name }}
      </button>
    </div>

    <!-- Items Grid -->
    <div class="items-grid">
      <div v-for="item in filteredItems" :key="item.id" class="item-card">
        <div class="item-emoji">{{ item.emoji }}</div>
        <div class="item-name">{{ item.name }}</div>
        <div class="item-desc">{{ item.desc }}</div>
        <div class="item-price">🪙 {{ item.price }}</div>
        <button class="btn-buy" :class="{ owned: isOwned(item.id) }" @click="buyItem(item)" :disabled="isOwned(item.id)">
          {{ isOwned(item.id) ? '已拥有' : '兑换' }}
        </button>
      </div>
    </div>

    <!-- My Items -->
    <div class="section" v-if="userStore.purchasedItems.length > 0">
      <div class="section-title">🎒 我的道具</div>
      <div class="my-items">
        <div v-for="pItem in userStore.purchasedItems" :key="pItem.id + pItem.date" class="my-item">
          {{ getItemById(pItem.id)?.emoji }} {{ getItemById(pItem.id)?.name }}
        </div>
      </div>
    </div>

    <!-- Buy Confirm Modal -->
    <div v-if="showConfirm" class="modal-overlay" @click.self="showConfirm = false">
      <div class="modal anim-bounce">
        <div class="modal-emoji">{{ pendingItem?.emoji }}</div>
        <div class="modal-title">确认兑换</div>
        <div class="modal-item">{{ pendingItem?.name }}</div>
        <div class="modal-price">🪙 {{ pendingItem?.price }}</div>
        <div class="modal-buttons">
          <button class="btn-cancel" @click="showConfirm = false">取消</button>
          <button class="btn-confirm" @click="confirmBuy">确认兑换</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { storeCategories, storeItems } from '../data/store-items'
import { playSuccess, playClick } from '../utils/audio'

const userStore = useUserStore()
const activeCat = ref('virtual')
const showConfirm = ref(false)
const pendingItem = ref(null)

const categories = storeCategories
const filteredItems = computed(() => storeItems.filter(i => i.category === activeCat.value))

function isOwned(id) {
  return userStore.purchasedItems.some(i => i.id === id)
}

function getItemById(id) {
  return storeItems.find(i => i.id === id)
}

function buyItem(item) {
  if (isOwned(item.id)) return
  pendingItem.value = item
  showConfirm.value = true
  playClick()
}

function confirmBuy() {
  if (userStore.purchaseItem(pendingItem.value)) {
    playSuccess()
  }
  showConfirm.value = false
}
</script>

<style scoped>
.store { padding: 16px; padding-bottom: 80px; }
.store-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.store-title { font-size: 14px; font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 2px 2px 0 #373737; }
.coin-balance {
  background: #555; padding: 6px 10px; font-size: 10px;
  font-family: 'Press Start 2P', monospace; color: #fff;
  border: 2px solid #373737; border-top-color: #8B8B8B; border-left-color: #8B8B8B;
  box-shadow: inset -2px -2px 0 #373737, inset 2px 2px 0 #8B8B8B;
}

.category-tabs { display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; }
.cat-tab {
  background: #8B8B8B; border: 2px solid #373737; border-top-color: #C6C6C6; border-left-color: #C6C6C6;
  box-shadow: inset -2px -2px 0 #555, inset 2px 2px 0 #aaa;
  padding: 8px 12px; font-size: 8px; font-family: 'Press Start 2P', monospace; color: #fff;
  text-shadow: 1px 1px 0 #373737; cursor: pointer; white-space: nowrap;
}
.cat-tab.active { background: var(--mc-green); border-color: #373737; }

.items-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
.item-card {
  background: #8B8B8B; padding: 16px; text-align: center;
  border: 3px solid #373737; border-top-color: #C6C6C6; border-left-color: #C6C6C6;
  box-shadow: inset -3px -3px 0 #555, inset 3px 3px 0 #aaa;
}
.item-emoji { font-size: 32px; margin-bottom: 8px; }
.item-name { font-size: 10px; font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 1px 1px 0 #373737; margin-bottom: 4px; }
.item-desc { font-size: 8px; color: #C6C6C6; font-family: 'Press Start 2P', monospace; margin-bottom: 8px; }
.item-price { font-size: 10px; font-family: 'Press Start 2P', monospace; color: var(--mc-gold); text-shadow: 1px 1px 0 #373737; margin-bottom: 8px; }
.btn-buy {
  background: #8B8B8B; color: #fff; border: 2px solid #373737;
  border-top-color: #C6C6C6; border-left-color: #C6C6C6;
  box-shadow: inset -2px -2px 0 #555, inset 2px 2px 0 #aaa;
  padding: 8px 16px; font-size: 8px; font-family: 'Press Start 2P', monospace;
  text-shadow: 1px 1px 0 #373737; cursor: pointer; width: 100%;
}
.btn-buy:active { border-top-color: #373737; border-left-color: #373737; border-bottom-color: #C6C6C6; border-right-color: #C6C6C6; }
.btn-buy.owned { background: #555; color: #8B8B8B; text-shadow: none; }

.section { margin-bottom: 20px; }
.section-title { font-size: 12px; font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 2px 2px 0 #373737; margin-bottom: 10px; }
.my-items { display: flex; flex-wrap: wrap; gap: 8px; }
.my-item {
  background: #8B8B8B; padding: 8px 12px; font-size: 8px;
  font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 1px 1px 0 #373737;
  border: 2px solid #373737; border-top-color: #C6C6C6; border-left-color: #C6C6C6;
  box-shadow: inset -2px -2px 0 #555, inset 2px 2px 0 #aaa;
}

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal {
  background: #8B8B8B; padding: 24px; text-align: center; width: 80%; max-width: 320px;
  border: 4px solid #373737; border-top-color: #C6C6C6; border-left-color: #C6C6C6;
  box-shadow: inset -4px -4px 0 #555, inset 4px 4px 0 #aaa;
}
.modal-emoji { font-size: 48px; margin-bottom: 8px; }
.modal-title { font-size: 12px; font-family: 'Press Start 2P', monospace; color: #fff; text-shadow: 2px 2px 0 #373737; margin-bottom: 4px; }
.modal-item { font-size: 10px; color: #C6C6C6; font-family: 'Press Start 2P', monospace; margin-bottom: 8px; }
.modal-price { font-size: 14px; font-family: 'Press Start 2P', monospace; color: var(--mc-gold); text-shadow: 2px 2px 0 #373737; margin-bottom: 16px; }
.modal-buttons { display: flex; gap: 12px; justify-content: center; }
.btn-cancel {
  background: #555; border: 2px solid #373737; border-top-color: #8B8B8B; border-left-color: #8B8B8B;
  box-shadow: inset -2px -2px 0 #373737, inset 2px 2px 0 #8B8B8B;
  padding: 10px 20px; font-size: 8px; font-family: 'Press Start 2P', monospace; color: #fff; cursor: pointer;
}
.btn-confirm {
  background: var(--mc-green); border: 2px solid #373737; border-top-color: #8B8B8B; border-left-color: #8B8B8B;
  box-shadow: inset -2px -2px 0 #373737, inset 2px 2px 0 #8B8B8B;
  padding: 10px 20px; font-size: 8px; font-family: 'Press Start 2P', monospace; color: #fff;
  text-shadow: 1px 1px 0 #373737; cursor: pointer;
}
</style>
