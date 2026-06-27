<template>
  <div class="subscription-page safe-area-top">
    <van-nav-bar title="订阅会员" left-arrow @click-left="$router.back()" />

    <!-- 当前状态 -->
    <div class="status-card" v-if="currentStatus">
      <div class="status-icon">{{ userStore.isVip ? '👑' : '🔒' }}</div>
      <div class="status-text">
        <div class="status-title">
          {{ currentStatus.plan ? currentStatus.plan.name : '未订阅' }}
        </div>
        <div class="status-expire" v-if="userStore.isVip">
          有效期至 {{ currentStatus.expire_at }}
        </div>
      </div>
      <van-button
        v-if="currentStatus.plan"
        plain
        round
        size="small"
        @click="handleCancel"
      >
        取消续费
      </van-button>
    </div>

    <!-- 订阅档位 -->
    <div class="plan-list">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="plan-card"
        :class="{ active: selectedPlan?.id === plan.id, recommended: plan.id === plans[1]?.id }"
        @click="selectedPlan = plan"
      >
        <div v-if="plan.id === plans[1]?.id" class="plan-badge">推荐</div>
        <div class="plan-name">{{ plan.name }}</div>
        <div class="plan-price">
          <span class="price-value">¥{{ plan.price }}</span>
          <span class="price-unit">/{{ plan.duration_days }}天</span>
        </div>
        <ul class="plan-features">
          <li v-for="f in plan.features" :key="f">✓ {{ f }}</li>
        </ul>
      </div>
    </div>

    <!-- 订阅按钮 -->
    <div class="subscribe-action safe-area-bottom">
      <van-button
        type="primary"
        round
        block
        :disabled="!selectedPlan"
        :loading="subscribing"
        @click="handleSubscribe"
      >
        立即订阅 ¥{{ selectedPlan?.price || 0 }}
      </van-button>
      <div class="subscribe-hint">订阅后自动续费，可随时取消</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { subscriptionApi, type SubscriptionPlan } from '@/api/subscription'
import { ttSDK } from '@/utils/tt'

const userStore = useUserStore()
const subscribing = ref(false)
const selectedPlan = ref<SubscriptionPlan | null>(null)
const currentStatus = ref<{ plan: SubscriptionPlan | null; expire_at: string; auto_renew: boolean } | null>(null)

const plans = ref<SubscriptionPlan[]>([
  {
    id: '1',
    name: '月度会员',
    planId: 'vip_monthly',
    price: 18,
    duration_days: 30,
    description: '',
    features: ['全站免费看', '去广告', '高清画质'],
  },
  {
    id: '2',
    name: '季度会员',
    planId: 'vip_quarterly',
    price: 48,
    duration_days: 90,
    description: '',
    features: ['全站免费看', '去广告', '高清画质', '专属客服'],
  },
  {
    id: '3',
    name: '年度会员',
    planId: 'vip_yearly',
    price: 168,
    duration_days: 365,
    description: '',
    features: ['全站免费看', '去广告', '4K画质', '专属客服', '抢先看'],
  },
])

onMounted(async () => {
  try {
    const [planRes, statusRes] = await Promise.all([
      subscriptionApi.getPlans(),
      subscriptionApi.getStatus(),
    ])
    if (planRes.data?.length) plans.value = planRes.data
    currentStatus.value = statusRes.data
  } catch { /* use mock */ }
})

async function handleSubscribe() {
  if (!selectedPlan.value) return
  subscribing.value = true
  try {
    await ttSDK.subscribe({ planId: selectedPlan.value.planId || selectedPlan.value.id })
    await userStore.refreshUserInfo()
    ttSDK.showToast('订阅成功')
  } catch (e: any) {
    ttSDK.showToast(e.message || '订阅失败')
  } finally {
    subscribing.value = false
  }
}

async function handleCancel() {
  try {
    await subscriptionApi.cancel()
    await userStore.refreshUserInfo()
    ttSDK.showToast('已取消续费')
  } catch (e: any) {
    ttSDK.showToast(e.message || '取消失败')
  }
}
</script>

<style scoped>
.subscription-page {
  min-height: 100vh;
}
.status-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #2d1b00, #1a0f00);
  border-radius: 12px;
}
.status-icon {
  font-size: 32px;
}
.status-text {
  flex: 1;
}
.status-title {
  font-size: 16px;
  font-weight: 600;
}
.status-expire {
  font-size: 12px;
  color: var(--color-text-hint);
  margin-top: 2px;
}
.plan-list {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}
.plan-card {
  position: relative;
  background: var(--color-bg-card);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 20px 16px;
  transition: border-color 0.2s;
}
.plan-card.active {
  border-color: var(--color-primary);
}
.plan-card.recommended {
  border-color: var(--color-vip);
}
.plan-badge {
  position: absolute;
  top: -1px;
  right: 16px;
  background: var(--color-vip);
  color: #fff;
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 0 0 8px 8px;
}
.plan-name {
  font-size: 18px;
  font-weight: 600;
}
.plan-price {
  margin-top: 8px;
}
.price-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
}
.price-unit {
  font-size: 13px;
  color: var(--color-text-hint);
}
.plan-features {
  margin-top: 12px;
  list-style: none;
  padding: 0;
}
.plan-features li {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 2;
}
.subscribe-action {
  padding: 24px 16px;
}
.subscribe-hint {
  text-align: center;
  font-size: 11px;
  color: var(--color-text-hint);
  margin-top: 8px;
}
</style>
