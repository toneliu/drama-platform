<template>
  <div class="subscription page">
    <van-nav-bar title="订阅会员" left-arrow @click-left="$router.back()" />

    <!-- 当前状态 -->
    <div v-if="status?.isSubscribed" class="status-card active">
      <div class="status-icon">👑</div>
      <div class="status-info">
        <div class="status-tier">{{ status.tier?.name }}</div>
        <div class="status-expire">
          有效期至 {{ formatDate(status.expireAt) }}
        </div>
        <div class="status-auto">
          自动续费: {{ status.autoRenew ? '已开启' : '已关闭' }}
        </div>
      </div>
      <van-button
        v-if="status.autoRenew"
        plain
        round
        size="small"
        @click="handleCancelAutoRenew"
      >
        取消续费
      </van-button>
    </div>
    <div v-else class="status-card inactive">
      <div class="status-icon">🔒</div>
      <div class="status-info">
        <div class="status-tier">未订阅</div>
        <div class="status-desc">开通会员享受免费看剧特权</div>
      </div>
    </div>

    <!-- 订阅档位 -->
    <div class="section">
      <div class="section-title">选择订阅档位</div>
      <div class="tier-list">
        <div
          v-for="tier in tiers"
          :key="tier.id"
          class="tier-item"
          :class="{ active: selectedTier === tier.id, popular: tier.isPopular }"
          @click="selectedTier = tier.id"
        >
          <div v-if="tier.isPopular" class="tier-badge">推荐</div>
          <div class="tier-name">{{ tier.name }}</div>
          <div class="tier-duration">{{ tier.duration }}</div>
          <div class="tier-price">
            <span class="price-currency">¥</span>
            <span class="price-amount">{{ tier.price }}</span>
          </div>
          <div class="tier-features">
            <div v-for="f in tier.features" :key="f" class="feature">
              ✅ {{ f }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 订阅按钮 -->
    <div class="section">
      <van-button
        type="primary"
        block
        round
        size="large"
        :disabled="!selectedTier"
        @click="handleSubscribe"
      >
        立即订阅
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { getSubTiers, getSubStatus, createSubOrder, cancelAutoRenew } from '@/api/subscription'
import type { SubTier, SubStatus } from '@/api/subscription'

const tiers = ref<SubTier[]>([])
const status = ref<SubStatus | null>(null)
const selectedTier = ref('')

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

async function handleSubscribe() {
  if (!selectedTier.value) return
  showLoadingToast({ message: '创建订单中...', forbidClick: true })
  try {
    const result = await createSubOrder(selectedTier.value, 'h5')
    closeToast()
    if (result.payUrl) {
      window.location.href = result.payUrl
    } else {
      showToast('订单已创建')
    }
  } catch {
    closeToast()
  }
}

async function handleCancelAutoRenew() {
  try {
    await cancelAutoRenew()
    showToast('已取消自动续费')
    // 重新加载状态
    status.value = await getSubStatus()
  } catch {}
}

onMounted(async () => {
  try {
    const [t, s] = await Promise.allSettled([getSubTiers(), getSubStatus()])
    if (t.status === 'fulfilled') {
      tiers.value = t.value
      if (tiers.value.length) {
        const popular = tiers.value.find(t => t.isPopular)
        selectedTier.value = popular?.id || tiers.value[0].id
      }
    }
    if (s.status === 'fulfilled') status.value = s.value
  } catch {}
})
</script>

<style scoped>
.status-card {
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 24px;
  padding: 32px;
  border-radius: 16px;
}
.status-card.active {
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  color: #fff;
}
.status-card.inactive {
  background: #fff;
  color: #666;
}
.status-icon {
  font-size: 56px;
}
.status-tier {
  font-size: 32px;
  font-weight: 700;
}
.status-expire,
.status-auto,
.status-desc {
  font-size: 24px;
  margin-top: 4px;
  opacity: 0.9;
}

.tier-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.tier-item {
  position: relative;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}
.tier-item.active {
  border-color: var(--primary, #ff4d6a);
}
.tier-item.popular {
  border-color: #ffd700;
}
.tier-badge {
  position: absolute;
  top: -1px;
  right: 24px;
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  color: #fff;
  font-size: 20px;
  padding: 4px 16px;
  border-radius: 0 0 8px 8px;
}
.tier-name {
  font-size: 32px;
  font-weight: 700;
}
.tier-duration {
  font-size: 24px;
  color: #999;
  margin-top: 4px;
}
.tier-price {
  margin-top: 12px;
}
.price-currency {
  font-size: 28px;
  color: var(--primary, #ff4d6a);
}
.price-amount {
  font-size: 48px;
  font-weight: 700;
  color: var(--primary, #ff4d6a);
}
.tier-features {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.feature {
  font-size: 24px;
  color: #666;
}
</style>
