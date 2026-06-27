<template>
  <div>
    <div class="stat-cards">
      <el-card v-for="stat in stats" :key="stat.label" shadow="hover" body-style="padding: 0;">
        <div class="stat-card" :style="{ background: stat.color }">
          <div class="label">{{ stat.label }}</div>
          <div class="value">{{ stat.value }}</div>
        </div>
      </el-card>
    </div>

    <div class="chart-row">
      <div class="chart-container">
        <h3 style="margin-bottom: 16px; color: #303133;">近7天用户注册趋势</h3>
        <v-chart :option="userChartOption" style="height: 300px;" autoresize />
      </div>
      <div class="chart-container">
        <h3 style="margin-bottom: 16px; color: #303133;">近7天收入趋势</h3>
        <v-chart :option="revenueChartOption" style="height: 300px;" autoresize />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getDashboard } from '@/api/dashboard'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const dashboardData = ref<any>({})

const stats = computed(() => [
  {
    label: '用户总数',
    value: dashboardData.value.totalUsers ?? '--',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    label: '今日新增',
    value: dashboardData.value.todayNewUsers ?? '--',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    label: '总收入',
    value: dashboardData.value.totalRevenue != null
      ? `¥${Number(dashboardData.value.totalRevenue).toLocaleString()}`
      : '--',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    label: '活跃订阅',
    value: dashboardData.value.activeSubscriptions ?? '--',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
])

const userChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    data: dashboardData.value.userTrend?.map((d: any) => d.date) || [],
    boundaryGap: false,
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '新增用户',
      type: 'line',
      smooth: true,
      data: dashboardData.value.userTrend?.map((d: any) => d.count) || [],
      areaStyle: { opacity: 0.3 },
      itemStyle: { color: '#667eea' },
    },
  ],
}))

const revenueChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    data: dashboardData.value.revenueTrend?.map((d: any) => d.date) || [],
    boundaryGap: false,
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '收入(元)',
      type: 'line',
      smooth: true,
      data: dashboardData.value.revenueTrend?.map((d: any) => d.amount) || [],
      areaStyle: { opacity: 0.3 },
      itemStyle: { color: '#4facfe' },
    },
  ],
}))

onMounted(async () => {
  try {
    const res: any = await getDashboard()
    dashboardData.value = res.data || res
  } catch {
    // API might not exist yet
  }
})
</script>
