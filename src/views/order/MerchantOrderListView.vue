<template>
  <PageContainer title="订单管理" desc="查看您的所有支付订单">
    <template #actions>
      <el-button type="primary" @click="loadData">
        <el-icon><Refresh /></el-icon>刷新
      </el-button>
    </template>

    <!-- Filter Card -->
    <div class="filter-card">
      <el-form :inline="true" :model="query" @submit.prevent="loadData">
        <el-form-item label="订单号">
          <el-input v-model="query.outTradeNo" placeholder="商户订单号" clearable style="width:200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width:130px">
            <el-option label="待支付" :value="0" />
            <el-option label="已支付" :value="1" />
            <el-option label="已关闭" :value="2" />
            <el-option label="已退款" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="query.dateRange" type="daterange" range-separator="-" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Table Card -->
    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="outTradeNo" label="订单号" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="font-mono" style="font-size:12px;color:rgba(201,169,110,0.6)">{{ row.outTradeNo }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="subject" label="商品名称" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span style="font-weight:500">{{ row.subject }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="金额" width="110">
          <template #default="{ row }">
            <span style="font-weight:700;font-family:'Space Mono',monospace;font-size:14px;color:rgba(240,236,228,0.75)">¥{{ formatMoney(row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getOrderStatusType(row.status)" size="small" round>{{ getOrderStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="倒计时" width="110" align="center">
          <template #default="{ row }">
            <template v-if="row.status === 0">
              <span v-if="getCountdown(row.createTime)" class="countdown" :class="{ expired: getCountdown(row.createTime).expired }">
                {{ getCountdown(row.createTime).text }}
              </span>
              <span v-else class="countdown expired">已过期</span>
            </template>
            <span v-else style="color:rgba(240,236,228,0.3);font-size:12px">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="payType" label="支付方式" width="120">
          <template #default="{ row }">
            <span style="font-size:13px;color:rgba(240,236,228,0.5)">{{ PAY_TYPE[row.payType] || row.payType }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170">
          <template #default="{ row }">
            <span style="font-size:13px;color:rgba(240,236,228,0.5)">{{ formatDate(row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link size="small" class="detail-link" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadData"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- Order Detail Drawer -->
    <el-drawer v-model="detailVisible" title="订单详情" size="560px">
      <div v-if="currentOrder">
        <div class="detail-hero" :class="statusTheme">
          <div class="hero-status">
            <el-tag :type="getOrderStatusType(currentOrder.status)" size="large" effect="dark" round>
              {{ getOrderStatusLabel(currentOrder.status) }}
            </el-tag>
            <span v-if="currentOrder.status === 0 && getCountdown(currentOrder.createTime)" class="hero-countdown"
              :class="{ expired: getCountdown(currentOrder.createTime).expired }">
              {{ getCountdown(currentOrder.createTime).expired ? '已过期' : getCountdown(currentOrder.createTime).text }}
            </span>
          </div>
          <div class="hero-amount">
            <span class="hero-currency">¥</span>
            <span class="hero-number">{{ formatMoney(currentOrder.totalAmount) }}</span>
          </div>
        </div>

        <div class="detail-sections">
          <div class="detail-section">
            <h4 class="section-title">基本信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">商户订单号</span>
                <span class="info-value font-mono">{{ currentOrder.outTradeNo }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">平台交易号</span>
                <span class="info-value font-mono">{{ currentOrder.tradeNo || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">商品名称</span>
                <span class="info-value">{{ currentOrder.subject }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">支付方式</span>
                <span class="info-value">{{ PAY_TYPE[currentOrder.payType] || currentOrder.payType || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4 class="section-title">买家信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">买家账号</span>
                <span class="info-value font-mono">{{ currentOrder.buyerId || '-' }}</span>
              </div>
              <div class="info-item full">
                <span class="info-label">异步通知地址</span>
                <span class="info-value font-mono" style="word-break:break-all">{{ currentOrder.notifyUrl || '-' }}</span>
              </div>
              <div class="info-item full">
                <span class="info-label">同步跳转地址</span>
                <span class="info-value font-mono" style="word-break:break-all">{{ currentOrder.returnUrl || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4 class="section-title">时间信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">创建时间</span>
                <span class="info-value">{{ formatDate(currentOrder.createTime) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">支付时间</span>
                <span class="info-value">{{ currentOrder.payTime ? formatDate(currentOrder.payTime) : '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">通知时间</span>
                <span class="info-value">{{ currentOrder.notifyTime ? formatDate(currentOrder.notifyTime) : '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div style="display:flex;gap:8px">
          <el-button v-if="currentOrder && currentOrder.status === 1" type="success" @click="printReceipt(currentOrder)">打印凭证</el-button>
          <div style="flex:1"></div>
          <el-button @click="detailVisible = false">关闭</el-button>
        </div>
      </template>
    </el-drawer>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { getMerchantOrders, getMerchantOrderDetail } from '../../api/order'
import { formatMoney, formatDate, ORDER_STATUS, PAY_TYPE } from '../../utils/format'
import { ElMessage } from 'element-plus'
import PageContainer from '../../components/PageContainer.vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const detailVisible = ref(false)
const currentOrder = ref(null)
const now = ref(Date.now())
let timer = null

const query = reactive({ page: 1, size: 20, outTradeNo: '', status: null, dateRange: null })

const statusTheme = computed(() => {
  if (!currentOrder.value) return ''
  const map = { 0: 'pending', 1: 'success', 2: 'closed', 3: 'refunded' }
  return map[currentOrder.value.status] || ''
})

onMounted(() => {
  loadData()
  timer = setInterval(() => { now.value = Date.now() }, 1000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })

function getOrderStatusType(status) {
  return (ORDER_STATUS[status] || {}).type
}

function getOrderStatusLabel(status) {
  return (ORDER_STATUS[status] || {}).label
}

function getCountdown(createTime) {
  if (!createTime) return null
  const expire = new Date(new Date(createTime).getTime() + 30 * 60000)
  const diff = expire.getTime() - now.value
  if (diff <= 0) return { text: '00:00', expired: true }
  const min = Math.floor(diff / 60000)
  const sec = Math.floor((diff % 60000) / 1000)
  if (min >= 60) {
    const h = Math.floor(min / 60)
    const m = min % 60
    return { text: h + 'h ' + String(m).padStart(2, '0') + 'm', expired: false }
  }
  return { text: String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0'), expired: false }
}

async function loadData() {
  loading.value = true
  try {
    const params = { page: query.page, size: query.size }
    if (query.outTradeNo) params.outTradeNo = query.outTradeNo
    if (query.status !== null && query.status !== '') params.status = query.status
    if (query.dateRange?.length === 2) {
      params.startDate = query.dateRange[0]
      params.endDate = query.dateRange[1]
    }
    const res = await getMerchantOrders(params)
    tableData.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  query.outTradeNo = ''
  query.status = null
  query.dateRange = null
  query.page = 1
  loadData()
}

function handleSizeChange() {
  query.page = 1
  loadData()
}

async function viewDetail(row) {
  try {
    const res = await getMerchantOrderDetail(row.id)
    currentOrder.value = res.data
    detailVisible.value = true
  } catch {
    currentOrder.value = row
    detailVisible.value = true
  }
}

function printReceipt(row) {
  const receiptNo = 'RCP' + Date.now().toString(36).toUpperCase()
  const statusLabel = (ORDER_STATUS[row.status] || {}).label || '未知'
  const payTypeLabel = PAY_TYPE[row.payType] || row.payType || '-'

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>支付凭证 - ${row.outTradeNo}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Microsoft YaHei","PingFang SC",sans-serif;color:#333;padding:40px}
.receipt{max-width:680px;margin:0 auto;border:2px solid #333;padding:40px;position:relative}
.receipt-title{text-align:center;font-size:22px;font-weight:700;letter-spacing:4px;margin-bottom:8px}
.receipt-sub{text-align:center;font-size:12px;color:#999;margin-bottom:30px}
.receipt-divider{border:none;border-top:1px dashed #999;margin:16px 0}
.receipt-row{display:flex;justify-content:space-between;padding:8px 0;font-size:14px;line-height:1.8}
.receipt-row .label{color:#666;min-width:100px}
.receipt-row .value{font-weight:500;text-align:right;word-break:break-all}
.receipt-amount{text-align:center;margin:24px 0}
.receipt-amount .symbol{font-size:18px;vertical-align:top;margin-right:2px}
.receipt-amount .num{font-size:36px;font-weight:700;font-family:"DIN Alternate","Helvetica Neue",monospace}
.receipt-stamp{text-align:right;margin-top:20px;font-size:13px;color:#999}
.receipt-footer{text-align:center;margin-top:30px;font-size:12px;color:#bbb}
.watermark{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:80px;color:rgba(0,0,0,0.03);font-weight:900;letter-spacing:10px;pointer-events:none;white-space:nowrap}
@media print{body{padding:0}.receipt{border:1px solid #333}}
</style></head><body>
<div class="receipt">
<div class="watermark">PAID</div>
<div class="receipt-title">支付凭证</div>
<div class="receipt-sub">PAYMENT RECEIPT</div>
<hr class="receipt-divider">
<div class="receipt-row"><span class="label">凭证编号</span><span class="value" style="font-family:monospace">${receiptNo}</span></div>
<div class="receipt-row"><span class="label">商户订单号</span><span class="value" style="font-family:monospace">${row.outTradeNo}</span></div>
<div class="receipt-row"><span class="label">交易平台单号</span><span class="value" style="font-family:monospace">${row.tradeNo || '-'}</span></div>
<hr class="receipt-divider">
<div class="receipt-row"><span class="label">商品名称</span><span class="value">${row.subject || '-'}</span></div>
<div class="receipt-row"><span class="label">支付方式</span><span class="value">${payTypeLabel}</span></div>
<div class="receipt-row"><span class="label">买家账号</span><span class="value">${row.buyerId || '-'}</span></div>
<hr class="receipt-divider">
<div class="receipt-amount"><span class="symbol">¥</span><span class="num">${formatMoney(row.totalAmount)}</span></div>
<hr class="receipt-divider">
<div class="receipt-row"><span class="label">交易状态</span><span class="value" style="color:#67C23A;font-weight:600">${statusLabel}</span></div>
<div class="receipt-row"><span class="label">创建时间</span><span class="value">${formatDate(row.createTime)}</span></div>
<div class="receipt-row"><span class="label">支付时间</span><span class="value">${formatDate(row.payTime)}</span></div>
<div class="receipt-stamp">打印时间：${new Date().toLocaleString('zh-CN')}</div>
<div class="receipt-footer">此凭证由系统自动生成 · ${window.location.host}</div>
</div>
<script>window.onload=function(){window.print()}<\/script>
</body></html>`

  const win = window.open('', '_blank', 'width=800,height=900')
  win.document.write(html)
  win.document.close()
}
</script>

<style scoped>
.filter-card {
  background: #18181c;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px 20px;
}

.table-card {
  background: #18181c;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px 20px;
}

/* Dark table overrides */
.table-card :deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(255, 255, 255, 0.03);
  --el-table-header-text-color: rgba(240, 236, 228, 0.6);
  --el-table-text-color: rgba(240, 236, 228, 0.75);
  --el-table-border-color: rgba(255, 255, 255, 0.05);
  --el-table-row-hover-bg-color: rgba(201, 169, 110, 0.04);
  --el-table-current-row-bg-color: rgba(201, 169, 110, 0.04);
}

.table-card :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: rgba(201, 169, 110, 0.025);
}

.table-card :deep(.el-table th.el-table__cell) {
  background: transparent !important;
  color: rgba(240, 236, 228, 0.35) !important;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border-bottom-color: rgba(201, 169, 110, 0.08) !important;
}

.table-card :deep(.el-table td.el-table__cell) {
  border-bottom-color: rgba(201, 169, 110, 0.06) !important;
}

/* Dark form overrides */
.filter-card :deep(.el-form-item__label) {
  color: rgba(240, 236, 228, 0.45) !important;
  font-size: 12px;
}

.filter-card :deep(.el-input__wrapper) {
  background: #1f1f25 !important;
  border: 1px solid rgba(120, 120, 130, 0.12) !important;
  box-shadow: none !important;
  border-radius: 8px;
}

.filter-card :deep(.el-input__wrapper:hover) {
  border-color: rgba(201, 169, 110, 0.2) !important;
}

.filter-card :deep(.el-input__wrapper.is-focus) {
  border-color: rgba(201, 169, 110, 0.3) !important;
  box-shadow: 0 0 0 2px rgba(201, 169, 110, 0.06) !important;
}

.filter-card :deep(.el-input__inner) {
  color: rgba(240, 236, 228, 0.75) !important;
}

.filter-card :deep(.el-input__inner::placeholder) {
  color: rgba(240, 236, 228, 0.3) !important;
}

/* Select dropdown dark overrides — match input style */
.filter-card :deep(.el-select .el-input__wrapper) {
  background: #1f1f25 !important;
  border: 1px solid rgba(120, 120, 130, 0.12) !important;
  box-shadow: none !important;
  border-radius: 8px;
}

.filter-card :deep(.el-select .el-input__wrapper:hover) {
  border-color: rgba(201, 169, 110, 0.2) !important;
}

.filter-card :deep(.el-select .el-input__wrapper.is-focus) {
  border-color: rgba(201, 169, 110, 0.3) !important;
  box-shadow: 0 0 0 2px rgba(201, 169, 110, 0.06) !important;
}

.filter-card :deep(.el-select .el-input__inner) {
  color: rgba(240, 236, 228, 0.75) !important;
}

.filter-card :deep(.el-select .el-input__inner::placeholder) {
  color: rgba(240, 236, 228, 0.3) !important;
}

.filter-card :deep(.el-select .el-input__suffix) {
  color: rgba(240, 236, 228, 0.4);
}

/* Date picker dark overrides */
.filter-card :deep(.el-range-input) {
  color: rgba(240, 236, 228, 0.75) !important;
  background: transparent !important;
}

.filter-card :deep(.el-range-input::placeholder) {
  color: rgba(240, 236, 228, 0.3) !important;
}

.filter-card :deep(.el-range-separator) {
  color: rgba(240, 236, 228, 0.3) !important;
}

.filter-card :deep(.el-range__icon) {
  color: rgba(240, 236, 228, 0.4);
}

.filter-card :deep(.el-date-editor) {
  --el-date-editor-width: 260px;
}

/* Primary button — gold */
:deep(.el-button--primary) {
  --el-button-bg-color: #c9a96e;
  --el-button-border-color: #c9a96e;
  --el-button-text-color: rgba(240, 236, 228, 0.9);
  --el-button-hover-bg-color: #d4b87a;
  --el-button-hover-border-color: #d4b87a;
  --el-button-hover-text-color: rgba(240, 236, 228, 0.95);
  --el-button-active-bg-color: #b89858;
  --el-button-active-border-color: #b89858;
  font-weight: 600;
}

/* Default button — dark ghost */
:deep(.el-button--default) {
  --el-button-bg-color: #1f1f25;
  --el-button-border-color: rgba(120, 120, 130, 0.15);
  --el-button-text-color: rgba(240, 236, 228, 0.55);
  --el-button-hover-bg-color: #252530;
  --el-button-hover-border-color: rgba(201, 169, 110, 0.2);
  --el-button-hover-text-color: rgba(240, 236, 228, 0.75);
}

/* Success button — muted green */
:deep(.el-button--success) {
  --el-button-bg-color: rgba(34, 197, 94, 0.1);
  --el-button-border-color: rgba(34, 197, 94, 0.2);
  --el-button-text-color: rgba(74, 222, 128, 0.8);
  --el-button-hover-bg-color: rgba(34, 197, 94, 0.15);
  --el-button-hover-border-color: rgba(34, 197, 94, 0.3);
  --el-button-hover-text-color: #4ade80;
}

/* Detail link — dim amber */
.detail-link {
  color: rgba(201, 169, 110, 0.7) !important;
  font-weight: 500;
}

.detail-link:hover {
  color: #c9a96e !important;
}

/* Dark pagination */
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* Dark drawer */
:deep(.el-drawer) {
  background: #141418 !important;
}

:deep(.el-drawer__header) {
  color: rgba(240, 236, 228, 0.8) !important;
  border-bottom: 1px solid rgba(201, 169, 110, 0.1);
  margin-bottom: 0;
  padding: 20px 24px;
}

:deep(.el-drawer__body) {
  padding: 24px;
}

:deep(.el-drawer__title) {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
}

:deep(.el-drawer__close-btn) {
  color: rgba(240, 236, 228, 0.35);
}

:deep(.el-drawer__close-btn:hover) {
  color: rgba(240, 236, 228, 0.65);
}

/* Drawer footer buttons */
:deep(.el-drawer__footer .el-button--default) {
  --el-button-bg-color: #1f1f25;
  --el-button-border-color: rgba(120, 120, 130, 0.15);
  --el-button-text-color: rgba(240, 236, 228, 0.55);
  --el-button-hover-bg-color: #252530;
  --el-button-hover-border-color: rgba(201, 169, 110, 0.2);
  --el-button-hover-text-color: rgba(240, 236, 228, 0.75);
}

:deep(.el-drawer__footer .el-button--success) {
  --el-button-bg-color: rgba(34, 197, 94, 0.1);
  --el-button-border-color: rgba(34, 197, 94, 0.2);
  --el-button-text-color: rgba(74, 222, 128, 0.8);
  --el-button-hover-bg-color: rgba(34, 197, 94, 0.15);
  --el-button-hover-border-color: rgba(34, 197, 94, 0.3);
  --el-button-hover-text-color: #4ade80;
}

/* Detail hero */
.detail-hero {
  padding: 28px 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-hero.pending {
  background: rgba(212, 178, 58, 0.08);
  border: 1px solid rgba(212, 178, 58, 0.15);
}

.detail-hero.success {
  background: rgba(77, 184, 130, 0.08);
  border: 1px solid rgba(77, 184, 130, 0.15);
}

.detail-hero.closed {
  background: rgba(120, 120, 130, 0.06);
  border: 1px solid rgba(120, 120, 130, 0.12);
}

.detail-hero.refunded {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.15);
}

.hero-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hero-countdown {
  font-size: 12px;
  font-family: 'Space Mono', monospace;
  font-weight: 600;
  color: rgba(201, 169, 110, 0.6);
}

.hero-countdown.expired {
  color: #ef4444;
}

.hero-amount {
  display: flex;
  align-items: baseline;
}

.hero-currency {
  font-size: 20px;
  font-weight: 600;
  color: rgba(240, 236, 228, 0.3);
  margin-right: 4px;
}

.hero-number {
  font-size: 32px;
  font-weight: 800;
  color: rgba(240, 236, 228, 0.8);
  font-family: 'Space Mono', monospace;
  letter-spacing: -1px;
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  padding: 0;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  color: rgba(240, 236, 228, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(201, 169, 110, 0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.info-item {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 11px;
  color: rgba(240, 236, 228, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  color: rgba(240, 236, 228, 0.75);
  word-break: break-all;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.countdown {
  font-size: 12px;
  font-family: 'Space Mono', monospace;
  font-weight: 600;
  color: rgba(201, 169, 110, 0.6);
}

.countdown.expired {
  color: #ef4444;
}

.font-mono {
  font-family: 'Space Mono', 'SF Mono', 'Consolas', monospace;
}

/* Tag overrides — subdued, no white/purple */
.table-card :deep(.el-tag--warning) {
  --el-tag-bg-color: rgba(212, 178, 58, 0.1);
  --el-tag-text-color: rgba(251, 191, 36, 0.8);
  --el-tag-border-color: rgba(212, 178, 58, 0.18);
}

.table-card :deep(.el-tag--success) {
  --el-tag-bg-color: rgba(77, 184, 130, 0.1);
  --el-tag-text-color: rgba(74, 222, 128, 0.8);
  --el-tag-border-color: rgba(77, 184, 130, 0.18);
}

.table-card :deep(.el-tag--danger) {
  --el-tag-bg-color: rgba(239, 68, 68, 0.1);
  --el-tag-text-color: rgba(248, 113, 113, 0.8);
  --el-tag-border-color: rgba(239, 68, 68, 0.18);
}

.table-card :deep(.el-tag--info) {
  --el-tag-bg-color: rgba(120, 120, 130, 0.12);
  --el-tag-text-color: rgba(200, 200, 210, 0.6);
  --el-tag-border-color: rgba(120, 120, 130, 0.2);
}

/* Global dark popups (select dropdown, date picker) */
:global(.el-select__popper),
:global(.el-picker-panel),
:global(.el-select-dropdown) {
  background: #1a1a1f !important;
  border-color: rgba(120, 120, 130, 0.15) !important;
}

:global(.el-select-dropdown__item) {
  color: rgba(240, 236, 228, 0.55) !important;
}

:global(.el-select-dropdown__item:hover),
:global(.el-select-dropdown__item.hover) {
  background: rgba(201, 169, 110, 0.08) !important;
}

:global(.el-select-dropdown__item.is-selected) {
  color: #c9a96e !important;
  font-weight: 600;
}

:global(.el-picker-panel__body) {
  color: rgba(240, 236, 228, 0.7);
}

:global(.el-date-table th) {
  color: rgba(240, 236, 228, 0.35) !important;
}

:global(.el-date-table td) {
  color: rgba(240, 236, 228, 0.55) !important;
}

:global(.el-date-table td.today .el-date-table-cell__text) {
  color: #c9a96e !important;
}

:global(.el-date-table td.current .el-date-table-cell__text) {
  background: #3d3024 !important;
  color: #c9a96e !important;
}

:global(.el-date-table td.in-range .el-date-table-cell) {
  background: rgba(201, 169, 110, 0.1) !important;
}

:global(.el-date-picker__header-label) {
  color: rgba(240, 236, 228, 0.6) !important;
}

:global(.el-date-picker__header-label:hover) {
  color: #c9a96e !important;
}

:global(.el-picker-panel__icon-btn) {
  color: rgba(240, 236, 228, 0.35) !important;
}

:global(.el-picker-panel__icon-btn:hover) {
  color: #c9a96e !important;
}

:global(.el-month-table td .cell),
:global(.el-year-table td .cell) {
  color: rgba(240, 236, 228, 0.55) !important;
}

:global(.el-month-table td.current:not(.disabled) .cell),
:global(.el-year-table td.current:not(.disabled) .cell) {
  color: #c9a96e !important;
}

/* Loading dark */
:deep(.el-loading-mask) {
  background: rgba(12, 12, 14, 0.7);
}

/* Message box dark */
:global(.el-message-box) {
  --el-messagebox-title-color: rgba(240, 236, 228, 0.8);
  --el-messagebox-content-color: rgba(240, 236, 228, 0.5);
  background: #18181c !important;
  border-color: rgba(120, 120, 130, 0.15) !important;
  border-radius: 16px;
}

:global(.el-message-box__headerbtn .el-message-box__close) {
  color: rgba(240, 236, 228, 0.35);
}

:global(.el-message-box__headerbtn .el-message-box__close:hover) {
  color: rgba(240, 236, 228, 0.55);
}

/* El-Overlay (drawer/dialog backdrop) */
:global(.el-overlay) {
  background: rgba(0, 0, 0, 0.6) !important;
}
</style>
