<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    closeable
    @update:show="$emit('update:show', $event)"
  >
    <div class="unlock-dialog">
      <div class="title">解锁本集</div>
      <div class="subtitle">选择解锁方式</div>

      <div class="methods">
        <!-- VIP 解锁 -->
        <div
          v-if="methods.vip"
          class="method-item vip"
          @click="$emit('unlock', 'vip')"
        >
          <div class="method-icon">👑</div>
          <div class="method-info">
            <div class="method-name">VIP 免费看</div>
            <div class="method-desc">VIP会员专享</div>
          </div>
          <van-button
            :type="isVip ? 'primary' : 'default'"
            round
            size="small"
          >
            {{ isVip ? '立即观看' : '开通VIP' }}
          </van-button>
        </div>

        <!-- 金币解锁 -->
        <div
          v-if="methods.coins"
          class="method-item coins"
          @click="$emit('unlock', 'coins')"
        >
          <div class="method-icon">🪙</div>
          <div class="method-info">
            <div class="method-name">金币解锁</div>
            <div class="method-desc">
              需要 {{ methods.coins }} 金币
              <span class="balance">（余额: {{ coinBalance }}）</span>
            </div>
          </div>
          <van-button
            :type="coinBalance >= methods.coins ? 'primary' : 'default'"
            round
            size="small"
            :disabled="coinBalance < methods.coins"
          >
            {{ coinBalance >= methods.coins ? '解锁' : '余额不足' }}
          </van-button>
        </div>

        <!-- 广告解锁 -->
        <div
          v-if="methods.ad"
          class="method-item ad"
          @click="$emit('unlock', 'ad')"
        >
          <div class="method-icon">📺</div>
          <div class="method-info">
            <div class="method-name">看广告免费解锁</div>
            <div class="method-desc">观看30秒广告即可</div>
          </div>
          <van-button type="primary" round size="small">
            看广告
          </van-button>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  methods: {
    coins?: number
    vip?: boolean
    ad?: boolean
  }
  isVip: boolean
  coinBalance: number
}>()

defineEmits<{
  'update:show': [value: boolean]
  unlock: [method: 'vip' | 'coins' | 'ad']
}>()
</script>

<style scoped>
.unlock-dialog {
  padding: 32px 24px 48px;
}
.title {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
}
.subtitle {
  font-size: 24px;
  color: #999;
  text-align: center;
  margin-bottom: 32px;
}
.methods {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.method-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f8f8;
  border-radius: 12px;
  cursor: pointer;
}
.method-item:active {
  background: #f0f0f0;
}
.method-icon {
  font-size: 40px;
}
.method-info {
  flex: 1;
}
.method-name {
  font-size: 28px;
  font-weight: 600;
}
.method-desc {
  font-size: 22px;
  color: #999;
  margin-top: 4px;
}
.balance {
  color: var(--primary, #ff4d6a);
}
</style>
