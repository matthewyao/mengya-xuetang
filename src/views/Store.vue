<template>
  <div class="page store">
    <div class="store-header">
      <div class="store-title">🛒 积分商城</div>
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
.store-title { font-size: 20px; font-weight: 700; }
.coin-balance { background: #fff; border-radius: 20px; padding: 6px 16px; font-size: 15px; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

.category-tabs { display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; }
.cat-tab { background: #fff; border: 2px solid #E0E0E0; border-radius: 20px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
.cat-tab.active { border-color: var(--color-primary); background: #FFF3E0; color: var(--color-primary); }

.items-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
.item-card { background: #fff; border-radius: 16px; padding: 16px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.item-emoji { font-size: 36px; margin-bottom: 8px; }
.item-name { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
.item-desc { font-size: 11px; color: #999; margin-bottom: 8px; }
.item-price { font-size: 15px; font-weight: 700; color: var(--color-primary); margin-bottom: 8px; }
.btn-buy { background: linear-gradient(135deg, #FF8C42, #FF6B2B); color: #fff; border: none; border-radius: 20px; padding: 8px 20px; font-size: 13px; font-weight: 600; cursor: pointer; width: 100%; }
.btn-buy.owned { background: #E0E0E0; color: #999; }

.section { margin-bottom: 20px; }
.section-title { font-size: 16px; font-weight: 700; margin-bottom: 10px; }
.my-items { display: flex; flex-wrap: wrap; gap: 8px; }
.my-item { background: #fff; border-radius: 12px; padding: 8px 14px; font-size: 13px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; border-radius: 20px; padding: 24px; text-align: center; width: 80%; max-width: 320px; }
.modal-emoji { font-size: 48px; margin-bottom: 8px; }
.modal-title { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.modal-item { font-size: 15px; color: #666; margin-bottom: 8px; }
.modal-price { font-size: 20px; font-weight: 700; color: var(--color-primary); margin-bottom: 16px; }
.modal-buttons { display: flex; gap: 12px; justify-content: center; }
.btn-cancel { background: #f5f5f5; border: none; border-radius: 20px; padding: 10px 24px; font-size: 14px; cursor: pointer; }
.btn-confirm { background: linear-gradient(135deg, #FF8C42, #FF6B2B); color: #fff; border: none; border-radius: 20px; padding: 10px 24px; font-size: 14px; font-weight: 600; cursor: pointer; }
</style>
