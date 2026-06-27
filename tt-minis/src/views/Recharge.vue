<template>
  <div class="recharge-page safe-area-top">
    <van-nav-bar title="充值中心" left-arrow @click-left="$router.back()" />

    <!-- 当前余额 -->
    <div class="balance-card">
      <div class="balance-label">当前金币</div>
      <div class="balance-value">{{ userStore.coins }}</div>
    </div>

    <!-- 金币套餐 -->
    <div class="package-section">
      <h3>选择套餐</h3>
      <div class="package-grid">
        <div
          v-for="pkg in packages"
          :key="pkg.id"
          class="package-card"
          :class="{ active: selectedPackage?.id === pkg.id, hot: pkg.label === 'hot' }"
          @click="selectedPackage = pkg"
        >
          <div class="pkg-coins">{{ pkg.coins }}</div>
          <div class="pkg-label">金币</div>
          <div class="pkg-price">¥{{ pkg.price }}</div>
          <div v-if="pkg.bonus" class="pkg-bonus">赠{{ pkg.bonus }}</div>
          <div v-if="pkg.label === 'hot'" class="pkg-tag">热门</div>
        </div>
      </div>
    </div>

    <!-- 支付方式 -->
    <div class="pay-methods">
      <h3>支付方式</h3>
      <van-radio-group v-model="payMethod">
        <van-cell-group :border="false">
          <van-cell title="TikTok Pay" clickable @click="payMethod = 'tt'">
            <template #right-icon>
              <van-radio name="tt" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-radio-group>
    </div>

    <!-- 支付按钮 -->
    <div class="pay-action safe-area-bottom">
      <van-button
        type="primary"
        round
        block
        :disabled="!selectedPackage"
        :loading="paying"
        @click="handlePay"
      >
        确认支付 ¥{{ selectedPackage?.price || 0 }}
      </van-button>
      <div class="pay-hint">支付即表示同意《充值服务协议》</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { paymentApi, type CoinPackage } from '@/api/payment'
import { ttSDK } from '@/utils/tt'

const userStore = useUserStore()
const paying = ref(false)
const payMethod = ref('tt')
const selectedPackage = ref<CoinPackage | null>(null)

const packages = ref<CoinPackage[]>([
  { id: '1', coins: 100, price: 1 },
  { id: '2', coins: 500, price: 6, bonus: 50, label: 'hot' },
  { id: '3', coins: 1000, price: 12, bonus: 150 },
  { id: '4', coins: 2000, price: 25, bonus: 400 },
  { id: '5', coins: 5000, price: 68, bonus: 1200 },
  { id: '6', coins: 10000, price: 128, bonus: 3000 },
])

onMounted(async () => {
  try {
    const res = await paymentApi.getPackages()
    if (res.data?.length) packages.value = res.data
  } catch { /* use mock */ }
})

async function handlePay() {
  if (!selectedPackage.value) return
  paying.value = true
  try {
    // 1. 后端创建订单
    const orderRes = await paymentApi.createOrder(
      selectedPackage.value.id,
      selectedPackage.value.price,
    )

    // 2. 调用 TikTok 支付
    const payResult = await ttSDK.requestPayment({
      orderInfo: JSON.stringify({id: selectedPackage.value.id, amount: selectedPackage.value.price}),
      service: 1,
    })

    // 3. 后端确认
    const confirmRes = await paymentApi.confirmPayment(orderRes.data.order_id, payResult)
    if (confirmRes.data.success) {
      userStore.addCoins(confirmRes.data.coins || selectedPackage.value.coins)
      ttSDK.showToast('充值成功')
    }
  } catch (e: any) {
    ttSDK.showToast(e.message || '支付失败')
  } finally {
    paying.value = false
  }
}
</script>

<style scoped>
.recharge-page {
  min-height: 100vh;
  background: var(--color-bg);
}
.balance-card {
  text-align: center;
  padding: 24px;
  margin: 16px;
  background: linear-gradient(135deg, #2d1b00, #1a0f00);
  border-radius: 12px;
}
.balance-label {
  font-size: 13px;
  color: var(--color-text-hint);
}
.balance-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-gold);
  margin-top: 4px;
}
.package-section, .pay-methods {
  padding: 0 16px;
  margin-top: 20px;
}
.package-section h3, .pay-methods h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}
.package-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.package-card {
  position: relative;
  background: var(--color-bg-card);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 16px 8px;
  text-align: center;
  transition: border-color 0.2s;
}
.package-card.active {
  border-color: var(--color-primary);
}
.package-card.hot {
  border-color: var(--color-gold);
}
.pkg-coins {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-gold);
}
.pkg-label {
  font-size: 11px;
  color: var(--color-text-hint);
}
.pkg-price {
  font-size: 14px;
  margin-top: 8px;
  font-weight: 500;
}
.pkg-bonus {
  font-size: 11px;
  color: var(--color-primary);
  margin-top: 2px;
}
.pkg-tag {
  position: absolute;
  top: -1px;
  right: -1px;
  background: var(--color-gold);
  color: #000;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 0 12px 0 8px;
}
.pay-action {
  padding: 24px 16px;
}
.pay-hint {
  text-align: center;
  font-size: 11px;
  color: var(--color-text-hint);
  margin-top: 8px;
}
</style>
