<template>
  <div class="recharge page">
    <van-nav-bar title="充值金币" left-arrow @click-left="$router.back()" />

    <!-- 当前余额 -->
    <div class="balance-card">
      <div class="balance-icon">🪙</div>
      <div class="balance-info">
        <div class="balance-label">当前金币</div>
        <div class="balance-value">{{ userStore.coinBalance }}</div>
      </div>
    </div>

    <!-- 金币套餐 -->
    <div class="section">
      <div class="section-title">选择套餐</div>
      <div class="package-grid">
        <div
          v-for="pkg in packages"
          :key="pkg.id"
          class="package-item"
          :class="{ active: selectedId === pkg.id, popular: pkg.label }"
          @click="selectedId = pkg.id"
        >
          <div v-if="pkg.label" class="pkg-label">{{ pkg.label }}</div>
          <div class="pkg-coins">
            <span class="coin-icon">🪙</span>
            <span class="coin-num">{{ pkg.coins }}</span>
          </div>
          <div v-if="pkg.bonus" class="pkg-bonus">赠{{ pkg.bonus }}金币</div>
          <div class="pkg-price">¥{{ pkg.price }}</div>
        </div>
      </div>
    </div>

    <!-- 支付方式 -->
    <div class="section">
      <div class="section-title">支付方式</div>
      <van-radio-group v-model="payMethod">
        <van-cell-group inset>
          <van-cell clickable @click="payMethod = 'wechat'">
            <template #title>
              <span class="pay-icon">💚</span> 微信支付
            </template>
            <template #right-icon>
              <van-radio name="wechat" />
            </template>
          </van-cell>
          <van-cell clickable @click="payMethod = 'alipay'">
            <template #title>
              <span class="pay-icon">🔵</span> 支付宝
            </template>
            <template #right-icon>
              <van-radio name="alipay" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-radio-group>
    </div>

    <!-- 确认按钮 -->
    <div class="section">
      <van-button
        type="primary"
        block
        round
        size="large"
        :disabled="!selectedId"
        @click="handleRecharge"
      >
        确认充值
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { getCoinPackages, createPaymentOrder } from '@/api/payment'
import type { CoinPackage } from '@/api/payment'

const userStore = useUserStore()

const packages = ref<CoinPackage[]>([])
const selectedId = ref('')
const payMethod = ref('wechat')

async function handleRecharge() {
  if (!selectedId.value) return
  showLoadingToast({ message: '创建订单中...', forbidClick: true })
  try {
    const result = await createPaymentOrder(selectedId.value, 'h5')
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

onMounted(async () => {
  try {
    packages.value = await getCoinPackages()
    if (packages.value.length) {
      selectedId.value = packages.value[0].id
    }
  } catch {}
  await userStore.fetchProfile()
})
</script>

<style scoped>
.balance-card {
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 24px;
  padding: 32px;
  background: linear-gradient(135deg, #ff4d6a, #ff8c8c);
  border-radius: 16px;
  color: #fff;
}
.balance-icon {
  font-size: 56px;
}
.balance-label {
  font-size: 24px;
  opacity: 0.9;
}
.balance-value {
  font-size: 48px;
  font-weight: 700;
  margin-top: 4px;
}

.package-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.package-item {
  position: relative;
  text-align: center;
  padding: 24px 12px;
  background: #fff;
  border-radius: 12px;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}
.package-item.active {
  border-color: var(--primary, #ff4d6a);
  background: #fff0f3;
}
.package-item.popular {
  border-color: #ffd700;
}
.pkg-label {
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  color: #fff;
  font-size: 18px;
  padding: 2px 12px;
  border-radius: 0 0 8px 8px;
}
.pkg-coins {
  font-size: 36px;
  font-weight: 700;
  margin: 12px 0;
}
.coin-icon {
  font-size: 28px;
}
.pkg-bonus {
  font-size: 20px;
  color: #ff4d6a;
  margin-bottom: 8px;
}
.pkg-price {
  font-size: 28px;
  color: #666;
}

.pay-icon {
  margin-right: 8px;
}
</style>
