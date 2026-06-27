import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/drama/:id',
      name: 'DramaDetail',
      component: () => import('@/views/DramaDetail.vue'),
    },
    {
      path: '/play/:episodeId',
      name: 'Player',
      component: () => import('@/views/Player.vue'),
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/Profile.vue'),
    },
    {
      path: '/recharge',
      name: 'Recharge',
      component: () => import('@/views/Recharge.vue'),
    },
    {
      path: '/subscription',
      name: 'Subscription',
      component: () => import('@/views/Subscription.vue'),
    },
    {
      path: '/checkin',
      name: 'Checkin',
      component: () => import('@/views/Checkin.vue'),
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('@/views/Search.vue'),
    },
  ],
})

export default router
