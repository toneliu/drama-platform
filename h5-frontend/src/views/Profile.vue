<template>
  <div class="profile page">
    <!-- 用户卡片 -->
    <div class="user-card">
      <div class="user-bg" />
      <div class="user-info">
        <van-image
          round
          width="120px"
          height="120px"
          :src="profile?.avatar || defaultAvatar"
          class="avatar"
        />
        <div class="user-detail">
          <div class="nickname">{{ profile?.nickname || '未登录' }}</div>
          <div v-if="profile" class="user-id">ID: {{ profile.id.slice(0, 8) }}</div>
          <div v-if="profile?.isVip" class="vip-badge">👑 VIP</div>
        </div>
      </div>

      <!-- 金币和VIP -->
      <div class="stats-row">
        <div class="stat-item" @click="$router.push('/recharge')">
          <div class="stat-value">🪙 {{ profile?.coinBalance ?? 0 }}</div>
          <div class="stat-label">金币</div>
        </div>
        <div class="stat-item" @click="$router.push('/subscription')">
          <div class="stat-value">
            {{ profile?.isVip ? 'VIP有效' : '未开通' }}
          </div>
          <div class="stat-label">会员</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ profile?.totalWatched ?? 0 }}</div>
          <div class="stat-label">已看集数</div>
        </div>
      </div>
    </div>

    <!-- 功能入口 -->
    <div class="menu-section">
      <van-cell-group inset>
        <van-cell
          title="📅 每日签到"
          is-link
          @click="$router.push('/checkin')"
        />
        <van-cell
          title="💰 充值金币"
          is-link
          @click="$router.push('/recharge')"
        />
        <van-cell
          title="👑 订阅会员"
          is-link
          @click="$router.push('/subscription')"
        />
        <van-cell
          title="🎁 兑换码"
          is-link
          @click="showRedeem = true"
        />
      </van-cell-group>
    </div>

    <div class="menu-section">
      <van-cell-group inset>
        <van-cell title="观看历史" is-link />
        <van-cell title="我的收藏" is-link />
        <van-cell title="帮助与反馈" is-link />
        <van-cell title="关于我们" is-link />
      </van-cell-group>
    </div>

    <!-- 退出登录 -->
    <div class="section" v-if="userStore.isLoggedIn">
      <van-button block plain round @click="handleLogout">
        退出登录
      </van-button>
    </div>

    <!-- 未登录 -->
    <div class="section" v-if="!userStore.isLoggedIn">
      <van-button type="primary" block round @click="$router.push('/login')">
        登录 / 注册
      </van-button>
    </div>

    <!-- 兑换码弹窗 -->
    <van-dialog
      v-model:show="showRedeem"
      title="兑换码"
      show-cancel-button
      @confirm="handleRedeem"
    >
      <van-field
        v-model="redeemCode"
        placeholder="请输入兑换码"
        maxlength="32"
      />
    </van-dialog>

    <div style="height: 100px" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { redeemCode as redeemApi } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

const profile = ref(userStore.profile)
const defaultAvatar = 'https://img.yzcdn.cn/vant/cat.jpeg'
const showRedeem = ref(false)
const redeemCode = ref('')

async function handleRedeem() {
  if (!redeemCode.value.trim()) return
  try {
    const result = await redeemApi(redeemCode.value.trim())
    showToast(`兑换成功: ${result.reward}`)
    await userStore.fetchProfile()
    profile.value = userStore.profile
  } catch {}
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
}

onMounted(async () => {
  if (userStore.isLoggedIn) {
    await userStore.fetchProfile()
    profile.value = userStore.profile
  }
})
</script>

<style scoped>
.user-card {
  position: relative;
  background: #fff;
  padding-bottom: 24px;
}
.user-bg {
  height: 200px;
  background: linear-gradient(135deg, #ff4d6a 0%, #ff8c8c 100%);
}
.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 24px;
  margin-top: -60px;
  position: relative;
  z-index: 1;
}
.avatar {
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.user-detail {
  flex: 1;
}
.nickname {
  font-size: 32px;
  font-weight: 700;
  color: #333;
}
.user-id {
  font-size: 22px;
  color: #999;
  margin-top: 4px;
}
.vip-badge {
  display: inline-block;
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  color: #fff;
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 22px;
  font-weight: 600;
  margin-top: 8px;
}

.stats-row {
  display: flex;
  margin-top: 24px;
  padding: 0 24px;
}
.stat-item {
  flex: 1;
  text-align: center;
  cursor: pointer;
}
.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
}
.stat-label {
  font-size: 22px;
  color: #999;
  margin-top: 4px;
}

.menu-section {
  margin-top: 16px;
}
:deep(.van-cell-group) {
  border-radius: 12px;
  overflow: hidden;
}
</style>
