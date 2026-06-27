<template>
  <div class="checkin-page safe-area-top">
    <van-nav-bar title="每日签到" left-arrow @click-left="$router.back()" />

    <!-- 签到状态 -->
    <div class="checkin-banner">
      <div class="streak-info">
        <div class="streak-num">{{ streak }}</div>
        <div class="streak-label">连续签到天数</div>
      </div>
      <van-button
        type="primary"
        round
        :disabled="checkedToday"
        :loading="checking"
        @click="handleCheckin"
      >
        {{ checkedToday ? '已签到 ✓' : '立即签到' }}
      </van-button>
    </div>

    <!-- 签到奖励日历 -->
    <div class="reward-calendar">
      <h3>签到奖励</h3>
      <div class="calendar-grid">
        <div
          v-for="day in 7"
          :key="day"
          class="calendar-day"
          :class="{
            checked: day <= streak % 7 || (streak % 7 === 0 && day <= 7 && streak > 0),
            today: day === (streak % 7 || 7),
          }"
        >
          <div class="day-label">第{{ day }}天</div>
          <div class="day-reward">
            <span class="coin-icon">🪙</span>
            {{ getReward(day) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 签到规则 -->
    <div class="checkin-rules">
      <h3>签到规则</h3>
      <ul>
        <li>每天可签到1次，连续签到奖励递增</li>
        <li>断签后重新从第1天开始计算</li>
        <li>金币可用于解锁付费剧集</li>
        <li>VIP会员签到可获得双倍奖励</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api/user'
import { ttSDK } from '@/utils/tt'

const userStore = useUserStore()
const checking = ref(false)
const checkedToday = ref(false)
const streak = ref(0)

const rewards = [10, 20, 30, 50, 50, 80, 100]

function getReward(day: number) {
  const base = rewards[day - 1] || 10
  return userStore.isVip ? base * 2 : base
}

onMounted(async () => {
  try {
    const res = await userApi.getCheckinStatus()
    checkedToday.value = res.data.checked_today
    streak.value = res.data.streak
  } catch {
    // mock
    streak.value = 3
    checkedToday.value = false
  }
})

async function handleCheckin() {
  if (checkedToday.value) return
  checking.value = true
  try {
    const res = await userApi.checkin()
    checkedToday.value = true
    streak.value = res.data.streak
    userStore.coins += res.data.reward_coins
    ttSDK.showToast(`签到成功！获得 ${res.data.reward_coins} 金币`)
  } catch (e: any) {
    ttSDK.showToast(e.message || '签到失败')
  } finally {
    checking.value = false
  }
}
</script>

<style scoped>
.checkin-page {
  min-height: 100vh;
}
.checkin-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #1a0f00, #2d1b00);
  border-radius: 12px;
}
.streak-num {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-gold);
}
.streak-label {
  font-size: 12px;
  color: var(--color-text-hint);
  margin-top: 2px;
}
.reward-calendar {
  padding: 0 16px;
  margin-top: 20px;
}
.reward-calendar h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}
.calendar-day {
  background: var(--color-bg-card);
  border-radius: 8px;
  padding: 8px 2px;
  text-align: center;
  opacity: 0.5;
}
.calendar-day.checked {
  opacity: 1;
  background: rgba(254, 44, 85, 0.15);
}
.calendar-day.today {
  border: 1px solid var(--color-primary);
  opacity: 1;
}
.day-label {
  font-size: 10px;
  color: var(--color-text-hint);
}
.day-reward {
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
}
.coin-icon {
  font-size: 10px;
}
.checkin-rules {
  padding: 0 16px;
  margin-top: 24px;
}
.checkin-rules h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
}
.checkin-rules ul {
  list-style: none;
  padding: 0;
}
.checkin-rules li {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 2;
  padding-left: 16px;
  position: relative;
}
.checkin-rules li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-primary);
}
</style>
