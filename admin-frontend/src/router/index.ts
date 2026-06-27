import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/layout/AdminLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'DataAnalysis' },
      },
      {
        path: 'dramas',
        name: 'DramaList',
        component: () => import('@/views/DramaList.vue'),
        meta: { title: '剧目管理', icon: 'Film' },
      },
      {
        path: 'dramas/:id/episodes',
        name: 'EpisodeList',
        component: () => import('@/views/EpisodeList.vue'),
        meta: { title: '剧集管理', icon: 'VideoCamera', hidden: true },
      },
      {
        path: 'users',
        name: 'UserList',
        component: () => import('@/views/UserList.vue'),
        meta: { title: '用户管理', icon: 'User' },
      },
      {
        path: 'subscriptions',
        name: 'SubscriptionList',
        component: () => import('@/views/SubscriptionList.vue'),
        meta: { title: '订阅管理', icon: 'Tickets' },
      },
      {
        path: 'subscription-tiers',
        name: 'SubscriptionTierList',
        component: () => import('@/views/SubscriptionTierList.vue'),
        meta: { title: '订阅档位', icon: 'PriceTag' },
      },
      {
        path: 'redeem-codes',
        name: 'RedeemCodeList',
        component: () => import('@/views/RedeemCodeList.vue'),
        meta: { title: '兑换码管理', icon: 'Ticket' },
      },
      {
        path: 'payments',
        name: 'PaymentList',
        component: () => import('@/views/PaymentList.vue'),
        meta: { title: '支付订单', icon: 'Money' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const adminStore = useAdminStore()
  if (to.meta.requiresAuth !== false && !adminStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && adminStore.isLoggedIn) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
