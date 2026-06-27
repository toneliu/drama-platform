<template>
  <div class="login page">
    <div class="login-header">
      <div class="logo">🎬</div>
      <h1 class="app-name">短剧平台</h1>
      <p class="app-desc">海量短剧，精彩不断</p>
    </div>

    <div class="login-form">
      <van-cell-group inset>
        <van-field
          v-model="phone"
          type="tel"
          label="手机号"
          placeholder="请输入手机号"
          maxlength="11"
        />
        <van-field
          v-model="code"
          type="number"
          label="验证码"
          placeholder="请输入验证码"
          maxlength="6"
        >
          <template #button>
            <van-button
              size="small"
              type="primary"
              :disabled="cooldown > 0"
              @click="sendCode"
            >
              {{ cooldown > 0 ? `${cooldown}s` : '获取验证码' }}
            </van-button>
          </template>
        </van-field>
      </van-cell-group>

      <div class="login-btn-wrap">
        <van-button
          type="primary"
          block
          round
          size="large"
          :loading="loading"
          @click="handleLogin"
        >
          登录 / 注册
        </van-button>
      </div>

      <div class="agreement">
        登录即表示同意
        <a href="#">《用户协议》</a>
        和
        <a href="#">《隐私政策》</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { loginByPhone } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const phone = ref('')
const code = ref('')
const cooldown = ref(0)
const loading = ref(false)

let timer: ReturnType<typeof setInterval> | null = null

function sendCode() {
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    showToast('请输入正确的手机号')
    return
  }
  // TODO: 调用发送验证码接口
  showToast('验证码已发送')
  cooldown.value = 60
  timer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

async function handleLogin() {
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    showToast('请输入正确的手机号')
    return
  }
  if (!code.value || code.value.length < 4) {
    showToast('请输入验证码')
    return
  }

  loading.value = true
  try {
    const result = await loginByPhone(phone.value, code.value)
    userStore.setToken(result.token)
    await userStore.fetchProfile()
    showToast('登录成功')

    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } catch {} finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  background: linear-gradient(180deg, #ff4d6a 0%, #ff8c8c 30%, #f5f5f5 50%);
}

.login-header {
  text-align: center;
  padding: 80px 0 48px;
  color: #fff;
}
.logo {
  font-size: 80px;
  margin-bottom: 16px;
}
.app-name {
  font-size: 44px;
  font-weight: 700;
  margin: 0;
}
.app-desc {
  font-size: 26px;
  opacity: 0.9;
  margin-top: 8px;
}

.login-form {
  padding: 0 16px;
}
:deep(.van-cell-group) {
  border-radius: 16px;
  overflow: hidden;
}
.login-btn-wrap {
  margin-top: 32px;
  padding: 0 16px;
}
.agreement {
  text-align: center;
  font-size: 22px;
  color: #999;
  margin-top: 24px;
}
.agreement a {
  color: var(--primary, #ff4d6a);
  text-decoration: none;
}
</style>
