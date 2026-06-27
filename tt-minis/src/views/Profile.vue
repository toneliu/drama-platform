<template>
  <div class="profile-page safe-area-top">
    <!-- 用户卡片 -->
    <div class="user-card">
      <img :src="userStore.avatar || defaultAvatar" class="user-avatar" />
      <div class="user-info">
        <div class="user-name">{{ userStore.nickname || '未登录' }}</div>
        <div class="user-id" v-if="userStore.isLoggedIn">
          ID: {{ userStore.ttOpenId.slice(0, 8) }}...
        </div>
      </div>
      <van-tag v-if="userStore.isVip" type="warning" size="medium">VIP</van-tag>
    </div>

    <!-- 资产栏 -->
    <div class="asset-bar">
      <div class="asset-item" @click="$router.push('/recharge')">
        <div class="asset-value">{{ userStore.coins }}</div>
        <div class="asset-label">金币</div>
      </div>
      <div class="asset-divider" />
      <div class="asset-item" @click="$router.push('/subscription')">
        <div class="asset-value">{{ userStore.isVip ? 'VIP' : '普通' }}</div>
        <div class="asset-label">会员状态</div>
      </div>
      <div class="asset-divider" />
      <div class="asset-item" @click="$router.push('/checkin')">
        <div class="asset-value">签到</div>
        <div class="asset-label">每日福利</div>
      </div>
    </div>

    <!-- 功能列表 -->
    <van-cell-group :border="false" class="menu-group">
      <van-cell title="充值中心" is-link @click="$router.push('/recharge')">
        <template #icon><van-icon name="gold-coin-o" class="menu-icon" /></template>
      </van-cell>
      <van-cell title="订阅管理" is-link @click="$router.push('/subscription')">
        <template #icon><van-icon name="vip-card-o" class="menu-icon" /></template>
      </van-cell>
      <van-cell title="每日签到" is-link @click="$router.push('/checkin')">
        <template #icon><van-icon name="sign" class="menu-icon" /></template>
      </van-cell>
      <van-cell title="观看历史" is-link>
        <template #icon><van-icon name="clock-o" class="menu-icon" /></template>
      </van-cell>
      <van-cell title="我的收藏" is-link>
        <template #icon><van-icon name="star-o" class="menu-icon" /></template>
      </van-cell>
    </van-cell-group>

    <van-cell-group :border="false" class="menu-group">
      <van-cell title="帮助与反馈" is-link>
        <template #icon><van-icon name="question-o" class="menu-icon" /></template>
      </van-cell>
      <van-cell title="关于我们" is-link>
        <template #icon><van-icon name="info-o" class="menu-icon" /></template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const defaultAvatar = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23333"/><text x="50" y="60" text-anchor="middle" fill="%23999" font-size="40">👤</text></svg>'
</script>

<style scoped>
.profile-page {
  padding-bottom: calc(20px + var(--safe-bottom));
}
.user-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 24px 16px 16px;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  margin: 0 16px;
  border-radius: 12px;
}
.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-primary);
}
.user-info {
  flex: 1;
}
.user-name {
  font-size: 18px;
  font-weight: 600;
}
.user-id {
  font-size: 12px;
  color: var(--color-text-hint);
  margin-top: 2px;
}
.asset-bar {
  display: flex;
  align-items: center;
  margin: 16px;
  padding: 16px;
  background: var(--color-bg-card);
  border-radius: 12px;
}
.asset-item {
  flex: 1;
  text-align: center;
}
.asset-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-gold);
}
.asset-label {
  font-size: 12px;
  color: var(--color-text-hint);
  margin-top: 4px;
}
.asset-divider {
  width: 1px;
  height: 32px;
  background: var(--color-border);
}
.menu-group {
  margin: 12px 16px;
  background: var(--color-bg-card);
  border-radius: 12px;
  overflow: hidden;
}
.menu-icon {
  margin-right: 8px;
  font-size: 18px;
  color: var(--color-primary);
}
</style>
