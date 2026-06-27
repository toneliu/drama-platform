<template>
  <div class="checkin page">
    <van-nav-bar title="每日签到" left-arrow @click-left="$router.back()" />

    <!-- 签到状态 -->
    <div class="checkin-card">
      <div class="streak-info">
        <div class="streak-num">{{ status?.continuousDays ?? 0 }}</div>
        <div class="streak-label">连续签到天数</div>
      </div>
      <van-button
        type="primary"
        round
        size="large"
        :disabled="status?.checkedInToday"
        :loading="loading"
        @click="handleCheckin"
      >
        {{ status?.checkedInToday ? '✅ 今日已签到' : '📅 立即签到' }}
      </van-button>
    </div>

    <!-- 签到日历 -->
    <div class="section">
      <div class="section-title">签到日历</div>
      <div class="calendar">
        <div class="calendar-header">
          <span v-for="d in ['一', '二', '三', '四', '五', '六', '日']" :key="d">
            {{ d }}
          </span>
        </div>
        <div class="calendar-body">
          <div
            v-for="(day, i) in calendarDays"
            :key="i"
            class="calendar-day"
            :class="{
              checked: day.checked,
              today: day.isToday,
              empty: !day.date,
            }"
          >
            <span v-if="day.date">{{ day.day }}</span>
            <span v-if="day.checked" class="check-mark">✅</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 奖励预览 -->
    <div class="section">
      <div class="section-title">签到奖励</div>
      <div class="reward-list">
        <div
          v-for="reward in status?.rewards ?? []"
          :key="reward.day"
          class="reward-item"
          :class="{ reached: (status?.continuousDays ?? 0) >= reward.day }"
        >
          <div class="reward-day">第{{ reward.day }}天</div>
          <div class="reward-icon">🪙</div>
          <div class="reward-text">{{ reward.reward }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { showToast } from 'vant'
import { doCheckin, getCheckinStatus } from '@/api/checkin'
import type { CheckinStatus } from '@/api/checkin'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const status = ref<CheckinStatus | null>(null)
const loading = ref(false)

const calendarDays = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // 周一为起始（0=周一, 6=周日）
  let startWeekday = firstDay.getDay() - 1
  if (startWeekday < 0) startWeekday = 6

  const days: {
    date: string
    day: number
    checked: boolean
    isToday: boolean
  }[] = []

  // 填充空白
  for (let i = 0; i < startWeekday; i++) {
    days.push({ date: '', day: 0, checked: false, isToday: false })
  }

  // 填充日期
  const calendar = status.value?.calendar ?? []
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const calEntry = calendar.find(c => c.date === dateStr)
    const isToday = d === now.getDate()
    days.push({
      date: dateStr,
      day: d,
      checked: calEntry?.checked ?? false,
      isToday,
    })
  }

  return days
})

async function handleCheckin() {
  loading.value = true
  try {
    const result = await doCheckin()
    showToast(`签到成功！获得 ${result.coins} 金币`)
    await loadStatus()
    await userStore.fetchProfile()
  } catch {} finally {
    loading.value = false
  }
}

async function loadStatus() {
  try {
    status.value = await getCheckinStatus()
  } catch {}
}

onMounted(loadStatus)
</script>

<style scoped>
.checkin-card {
  margin: 24px;
  padding: 32px;
  background: linear-gradient(135deg, #ff4d6a, #ff8c8c);
  border-radius: 16px;
  text-align: center;
  color: #fff;
}
.streak-num {
  font-size: 72px;
  font-weight: 700;
}
.streak-label {
  font-size: 24px;
  opacity: 0.9;
  margin-bottom: 24px;
}
:deep(.van-button--primary) {
  background: #fff;
  color: #ff4d6a;
  border: none;
}
:deep(.van-button--primary.van-button--disabled) {
  background: rgba(255, 255, 255, 0.6);
  color: rgba(255, 77, 106, 0.6);
}

.calendar {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}
.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 22px;
  color: #999;
  padding-bottom: 12px;
}
.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}
.calendar-day {
  position: relative;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border-radius: 8px;
}
.calendar-day.checked {
  background: #fff0f3;
  color: var(--primary, #ff4d6a);
  font-weight: 600;
}
.calendar-day.today {
  border: 2px solid var(--primary, #ff4d6a);
}
.check-mark {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 14px;
}

.reward-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 8px;
}
.reward-list::-webkit-scrollbar {
  display: none;
}
.reward-item {
  flex-shrink: 0;
  width: 140px;
  text-align: center;
  padding: 16px 8px;
  background: #f8f8f8;
  border-radius: 12px;
}
.reward-item.reached {
  background: #fff0f3;
}
.reward-day {
  font-size: 22px;
  color: #999;
  margin-bottom: 8px;
}
.reward-icon {
  font-size: 36px;
}
.reward-text {
  font-size: 22px;
  color: #666;
  margin-top: 8px;
}
</style>
