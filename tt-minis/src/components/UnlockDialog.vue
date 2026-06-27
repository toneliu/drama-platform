<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    :style="{ background: 'var(--color-bg-dialog)' }"
    @update:show="$emit('update:show', $event)"
  >
    <div class="unlock-dialog">
      <div class="dialog-title">解锁剧集</div>
      <div class="dialog-desc">
        第{{ episode?.episode_number }}集 需要解锁后观看
      </div>

      <!-- 解锁方式 -->
      <div class="unlock-options">
        <!-- 金币解锁 -->
        <div class="unlock-option" @click="$emit('unlock-by-coins')">
          <div class="option-icon">🪙</div>
          <div class="option-info">
            <div class="option-title">金币解锁</div>
            <div class="option-desc">
              消耗 {{ episode?.unlock_cost }} 金币
              <span class="balance">（余额 {{ userCoins }}）</span>
            </div>
          </div>
          <van-button
            type="primary"
            size="small"
            round
            :disabled="userCoins < (episode?.unlock_cost || 0)"
          >
            解锁
          </van-button>
        </div>

        <!-- VIP免费 -->
        <div class="unlock-option" v-if="isVip" @click="$emit('update:show', false)">
          <div class="option-icon">👑</div>
          <div class="option-info">
            <div class="option-title">VIP免费看</div>
            <div class="option-desc">您是VIP会员，可免费观看</div>
          </div>
          <van-button type="warning" size="small" round>观看</van-button>
        </div>

        <!-- 看广告解锁 -->
        <div class="unlock-option" @click="$emit('unlock-by-ad')">
          <div class="option-icon">📺</div>
          <div class="option-info">
            <div class="option-title">看广告免费解锁</div>
            <div class="option-desc">观看一段广告即可解锁本集</div>
          </div>
          <van-button size="small" round plain>看广告</van-button>
        </div>
      </div>

      <!-- 充值/订阅入口 -->
      <div class="dialog-links">
        <span @click="$emit('go-recharge'); $emit('update:show', false)">
          充值金币 >
        </span>
        <span @click="$emit('go-subscribe'); $emit('update:show', false)" v-if="!isVip">
          开通VIP >
        </span>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import type { Episode } from '@/api/drama'

defineProps<{
  show: boolean
  episode?: Episode
  userCoins: number
  isVip: boolean
}>()

defineEmits<{
  'update:show': [value: boolean]
  'unlock-by-coins': []
  'unlock-by-ad': []
  'go-recharge': []
  'go-subscribe': []
}>()
</script>

<style scoped>
.unlock-dialog {
  padding: 20px 16px calc(20px + var(--safe-bottom));
}
.dialog-title {
  font-size: 18px;
  font-weight: 700;
  text-align: center;
}
.dialog-desc {
  font-size: 13px;
  color: var(--color-text-hint);
  text-align: center;
  margin-top: 4px;
}
.unlock-options {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.unlock-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--color-bg-card);
  border-radius: 10px;
}
.option-icon {
  font-size: 28px;
}
.option-info {
  flex: 1;
}
.option-title {
  font-size: 14px;
  font-weight: 600;
}
.option-desc {
  font-size: 12px;
  color: var(--color-text-hint);
  margin-top: 2px;
}
.balance {
  color: var(--color-gold);
}
.dialog-links {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
  font-size: 13px;
  color: var(--color-primary);
}
</style>
