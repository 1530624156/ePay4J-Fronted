<template>
  <div class="dashboard-page">
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div
        v-for="(item, index) in statsCards"
        :key="item.label"
        class="stat-card"
        :style="{ animationDelay: index * 0.1 + 's' }"
      >
        <div class="stat-card-inner" :class="item.theme">
          <div class="stat-icon-wrap">
            <el-icon :size="24"><component :is="item.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">{{ item.label }}</span>
            <span class="stat-value">{{ item.value }}</span>
          </div>
          <div class="stat-bg-icon">
            <el-icon :size="80"><component :is="item.icon" /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-grid">
      <!-- Revenue Chart -->
      <div class="chart-card revenue-chart fade-in-up" style="animation-delay:0.2s">
        <div class="chart-header">
          <div class="chart-title-group">
            <h3 class="chart-title">收入趋势</h3>
            <span class="chart-subtitle">近7天</span>
          </div>
          <div class="chart-actions">
            <el-radio-group v-model="chartDays" size="small" @change="refreshRevenueChart">
              <el-radio-button :value="7">7天</el-radio-button>
              <el-radio-button :value="14">14天</el-radio-button>
              <el-radio-button :value="30">30天</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div ref="revenueChartRef" class="chart-body"></div>
      </div>

      <!-- Order Status Chart -->
      <div class="chart-card status-chart fade-in-up" style="animation-delay:0.3s">
        <div class="chart-header">
          <div class="chart-title-group">
            <h3 class="chart-title">订单状态分布</h3>
            <span class="chart-subtitle">全部订单</span>
          </div>
        </div>
        <div ref="statusChartRef" class="chart-body"></div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="recent-card fade-in-up" style="animation-delay:0.4s">
      <div class="chart-header">
        <div class="chart-title-group">
          <h3 class="chart-title">最近订单</h3>
          <span class="chart-subtitle">最新交易记录</span>
        </div>
        <el-button type="primary" link @click="$router.push('/admin/orders')">
          查看全部
          <el-icon style="margin-left:4px"><ArrowRight /></el-icon>
        </el-button>
      </div>
      <el-table :data="recentOrders" v-loading="recentLoading" style="width:100%">
        <el-table-column prop="outTradeNo" label="订单号" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="font-mono" style="font-size:12px">{{ row.outTradeNo }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="subject" label="商品" min-width="140" show-overflow-tooltip />
        <el-table-column prop="totalAmount" label="金额" width="110">
          <template #default="{ row }">
            <span style="font-weight:600;font-family:'JetBrains Mono',monospace">¥{{ formatMoney(row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getOrderStatusType(row.status)" size="small" round>{{ getOrderStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="时间" width="170">
          <template #default="{ row }">
            <span style="color:var(--ep-text-secondary);font-size:13px">{{ formatDate(row.createTime) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import { getStats, getRevenueChart, getOrderStatusChart, getRecentOrders } from '../../api/dashboard'
import { formatMoney, formatDate, ORDER_STATUS } from '../../utils/format'

function getOrderStatusType(status) {
  return (ORDER_STATUS[status] || {}).type
}

function getOrderStatusLabel(status) {
  return (ORDER_STATUS[status] || {}).label
}

const revenueChartRef = ref()
const statusChartRef = ref()
const chartDays = ref(7)
const recentOrders = ref([])
const recentLoading = ref(false)

const stats = ref({ todayRevenue: '0.00', todayOrders: 0, successRate: '0%', totalMerchants: 0 })

const statsCards = computed(() => [
  { label: '今日收入', value: '¥' + stats.value.todayRevenue, icon: 'Wallet', theme: 'green' },
  { label: '今日订单', value: stats.value.todayOrders, icon: 'Document', theme: 'blue' },
  { label: '支付成功率', value: stats.value.successRate, icon: 'TrendCharts', theme: 'amber' },
  { label: '商户总数', value: stats.value.totalMerchants, icon: 'Shop', theme: 'purple' },
])

let revenueChart = null
let statusChart = null

onMounted(async () => {
  try {
    const res = await getStats()
    stats.value = res.data
  } catch { /* ignore */ }

  initRevenueChart()
  initStatusChart()
  loadRecentOrders()

  window.addEventListener('resize', handleResize)
})

function handleResize() {
  revenueChart?.resize()
  statusChart?.resize()
}

async function loadRecentOrders() {
  recentLoading.value = true
  try {
    const res = await getRecentOrders(8)
    recentOrders.value = res.data || []
  } finally {
    recentLoading.value = false
  }
}

async function refreshRevenueChart() {
  initRevenueChart()
}

async function initRevenueChart() {
  if (!revenueChartRef.value) return
  if (revenueChart) revenueChart.dispose()
  revenueChart = echarts.init(revenueChartRef.value)

  try {
    const res = await getRevenueChart(chartDays.value)
    const data = res.data || []
    const values = data.map(d => Number(d.revenue) || 0)
    const hasData = values.some(v => v > 0)

    revenueChart.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        borderColor: '#f3f4f6',
        borderWidth: 1,
        textStyle: { color: '#374151', fontSize: 13 },
        axisPointer: {
          type: 'line',
          lineStyle: { color: 'rgba(99,102,241,0.2)', type: 'dashed' },
        },
        formatter: params => {
          const p = params[0]
          return `<div style="font-weight:600;margin-bottom:4px">${p.axisValue}</div>
                  <div style="color:#6366f1;font-weight:700;font-size:16px">¥${Number(p.value).toFixed(2)}</div>`
        },
      },
      grid: { left: 60, right: 20, top: 20, bottom: 35 },
      xAxis: {
        type: 'category',
        data: data.map(d => d.date),
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#f3f4f6' } },
        axisTick: { show: false },
        axisLabel: { color: '#9ca3af', fontSize: 12 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
        axisLabel: { color: '#9ca3af', fontSize: 12, formatter: v => '¥' + v },
        min: 0,
        minInterval: 0.01,
        scale: true,
      },
      series: [{
        data: values,
        type: 'line',
        smooth: true,
        symbol: hasData ? 'circle' : 'none',
        symbolSize: 6,
        lineStyle: { width: 3, color: '#6366f1' },
        itemStyle: { color: '#6366f1', borderWidth: 2, borderColor: '#fff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(99, 102, 241, 0.2)' },
            { offset: 1, color: 'rgba(99, 102, 241, 0.01)' },
          ]),
        },
      }],
    })
  } catch { /* ignore */ }
}

async function initStatusChart() {
  if (!statusChartRef.value) return
  if (statusChart) statusChart.dispose()
  statusChart = echarts.init(statusChartRef.value)

  const statusMap = { '0': '待支付', '1': '已支付', '2': '已关闭', '3': '已退款' }
  const colorMap = { '0': '#f59e0b', '1': '#10b981', '2': '#9ca3af', '3': '#ef4444' }

  try {
    const res = await getOrderStatusChart()
    const data = res.data || []
    statusChart.setOption({
      tooltip: {
        backgroundColor: '#fff',
        borderColor: '#f3f4f6',
        borderWidth: 1,
        textStyle: { color: '#374151', fontSize: 13 },
      },
      series: [{
        type: 'pie',
        radius: ['52%', '78%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 3 },
        label: {
          show: true,
          formatter: '{b}\n{c} 笔',
          color: '#6b7280',
          fontSize: 12,
          lineHeight: 18,
        },
        labelLine: { length: 12, length2: 16, smooth: true },
        emphasis: {
          label: { fontSize: 14, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' },
        },
        data: data.map(d => ({
          name: statusMap[d.status] || d.status,
          value: d.count,
          itemStyle: { color: colorMap[d.status] },
        })),
      }],
    })
  } catch { /* ignore */ }
}
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ===== Stats Grid ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.stat-card-inner {
  position: relative;
  padding: 20px;
  border-radius: var(--ep-radius);
  display: flex;
  align-items: center;
  gap: 16px;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.stat-card-inner:hover {
  transform: translateY(-2px);
  box-shadow: var(--ep-shadow-lg);
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
}

.stat-bg-icon {
  position: absolute;
  right: -8px;
  bottom: -12px;
  opacity: 0.06;
  z-index: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
}

/* Card Themes */
.stat-card-inner.green {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  color: #065f46;
}
.stat-card-inner.green .stat-icon-wrap { background: rgba(16, 185, 129, 0.15); color: #059669; }
.stat-card-inner.green .stat-label { color: #047857; }
.stat-card-inner.green .stat-value { color: #065f46; }

.stat-card-inner.blue {
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  color: #3730a3;
}
.stat-card-inner.blue .stat-icon-wrap { background: rgba(99, 102, 241, 0.15); color: #6366f1; }
.stat-card-inner.blue .stat-label { color: #4338ca; }
.stat-card-inner.blue .stat-value { color: #312e81; }

.stat-card-inner.amber {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  color: #78350f;
}
.stat-card-inner.amber .stat-icon-wrap { background: rgba(245, 158, 11, 0.15); color: #d97706; }
.stat-card-inner.amber .stat-label { color: #92400e; }
.stat-card-inner.amber .stat-value { color: #78350f; }

.stat-card-inner.purple {
  background: linear-gradient(135deg, #faf5ff, #f3e8ff);
  color: #581c87;
}
.stat-card-inner.purple .stat-icon-wrap { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
.stat-card-inner.purple .stat-label { color: #6b21a8; }
.stat-card-inner.purple .stat-value { color: #581c87; }

/* ===== Charts Grid ===== */
.charts-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 16px;
}

.chart-card {
  background: var(--ep-bg-card);
  border: 1px solid var(--ep-border-light);
  border-radius: var(--ep-radius);
  box-shadow: var(--ep-shadow-sm);
  overflow: hidden;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 0;
}

.chart-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--ep-text-primary);
  margin: 0;
}

.chart-subtitle {
  font-size: 12px;
  color: var(--ep-text-placeholder);
}

.chart-actions {
  display: flex;
  align-items: center;
}

.chart-body {
  height: 320px;
  padding: 0 12px 12px;
}

/* ===== Recent Orders ===== */
.recent-card {
  background: var(--ep-bg-card);
  border: 1px solid var(--ep-border-light);
  border-radius: var(--ep-radius);
  box-shadow: var(--ep-shadow-sm);
  padding: 0 20px 16px;
  overflow: hidden;
}

.recent-card .chart-header {
  padding: 18px 0 12px;
}

/* ===== Responsive ===== */
@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-grid { grid-template-columns: 1fr; }
}
</style>
