<template>
  <div class="dashboard">
    <!-- Ambient background -->
    <div class="dash-bg-grid"></div>

    <!-- Header -->
    <div class="dash-header">
      <div class="header-left">
        <div class="header-greeting">
          <h1 class="greeting-title">
            <span class="greeting-label">Welcome back,</span>
            <span class="greeting-name">{{ userStore.merchantName || '商户' }}</span>
          </h1>
          <p class="greeting-sub" v-if="userStore.nickname">
            {{ userStore.nickname }} · 商户管理中心
          </p>
          <p class="greeting-sub" v-else>商户管理中心</p>
        </div>
      </div>
      <div class="header-right">
        <button class="icon-btn" @click="loadData" :class="{ spinning: loading }">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C11.6765 1.5 14.0182 2.8715 15.2865 4.92893" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M16.5 9C16.5 13.1421 13.1421 16.5 9 16.5C6.32353 16.5 3.9818 15.1285 2.7135 13.0711" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M13 5H15.5V2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 13H2.5V15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-card" v-for="(stat, i) in stats" :key="stat.label" :style="{ animationDelay: i * 0.08 + 's' }">
        <div class="stat-top">
          <span class="stat-label">{{ stat.label }}</span>
          <span class="stat-icon" :class="stat.iconClass">
            <component :is="stat.icon" />
          </span>
        </div>
        <div class="stat-value" :class="stat.valueClass">{{ stat.value }}</div>
        <div class="stat-bar">
          <div class="stat-bar-fill" :class="stat.iconClass" :style="{ width: stat.barWidth }"></div>
        </div>
      </div>
    </div>

    <!-- Main Grid: Credentials + Quick Info -->
    <div class="main-grid">
      <!-- Credentials Card -->
      <div class="card cred-card">
        <div class="card-header">
          <div class="card-title-group">
            <span class="card-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1L3 5V13L9 17L15 13V5L9 1Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
                <path d="M9 7V11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                <circle cx="9" cy="5" r="1" fill="currentColor"/>
              </svg>
            </span>
            <span class="card-title">对接凭证</span>
          </div>
          <button class="text-btn" @click="handleResetKey">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7C1 3.68629 3.68629 1 7 1C9.22222 1 11.1429 2.24286 12.1111 4.08571" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              <path d="M13 7C13 10.3137 10.3137 13 7 13C4.77778 13 2.85714 11.7571 1.88889 9.91429" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              <path d="M10.5 4.5H12.5V2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            重置密钥
          </button>
        </div>

        <div class="cred-rows">
          <!-- PID -->
          <div class="cred-row">
            <span class="cred-label">商户编号 (PID)</span>
            <div class="cred-value-row">
              <code class="cred-code pid">{{ userStore.merchantId || credentials.pid || '-' }}</code>
              <button class="copy-btn" @click="copyPid" title="复制">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
                  <path d="M9.5 4.5V2.5C9.5 1.94772 9.05228 1.5 8.5 1.5H2.5C1.94772 1.5 1.5 1.94772 1.5 2.5V8.5C1.5 9.05228 1.94772 9.5 2.5 9.5H4.5" stroke="currentColor" stroke-width="1.2"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Key -->
          <div class="cred-row">
            <span class="cred-label">密钥 (KEY)</span>
            <div class="cred-value-row">
              <code class="cred-code key" :class="{ masked: !showKey }">
                {{ showKey ? credentials.key : '••••••••••••••••••••••••••••••••' }}
              </code>
              <button class="toggle-btn" @click="showKey = !showKey">
                {{ showKey ? '隐藏' : '显示' }}
              </button>
              <button class="copy-btn" @click="copyKey" title="复制">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
                  <path d="M9.5 4.5V2.5C9.5 1.94772 9.05228 1.5 8.5 1.5H2.5C1.94772 1.5 1.5 1.94772 1.5 2.5V8.5C1.5 9.05228 1.94772 9.5 2.5 9.5H4.5" stroke="currentColor" stroke-width="1.2"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="cred-divider"></div>

          <!-- Site Name -->
          <div class="cred-row">
            <span class="cred-label">站点名称</span>
            <span class="cred-text">{{ siteSettings.site_name || '-' }}</span>
          </div>

          <!-- API URL -->
          <div class="cred-row">
            <span class="cred-label">支付接口</span>
            <div class="cred-value-row">
              <code class="cred-code url">{{ siteSettings.pay_api_url || '-' }}</code>
              <button class="copy-btn" @click="copyApiUrl" title="复制">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
                  <path d="M9.5 4.5V2.5C9.5 1.94772 9.05228 1.5 8.5 1.5H2.5C1.94772 1.5 1.5 1.94772 1.5 2.5V8.5C1.5 9.05228 1.94772 9.5 2.5 9.5H4.5" stroke="currentColor" stroke-width="1.2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Start Card -->
      <div class="card quickstart-card">
        <div class="card-header">
          <div class="card-title-group">
            <span class="card-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M7 2L2 10H8L7 16L16 8H10L11 2H7Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="card-title">快速接入</span>
          </div>
        </div>

        <div class="qs-steps">
          <div class="qs-step">
            <div class="qs-step-num">01</div>
            <div class="qs-step-content">
              <div class="qs-step-title">获取凭证</div>
              <div class="qs-step-desc">使用左侧的 PID 和 KEY 进行接口签名</div>
            </div>
          </div>
          <div class="qs-step">
            <div class="qs-step-num">02</div>
            <div class="qs-step-content">
              <div class="qs-step-title">发起支付</div>
              <div class="qs-step-desc">向支付接口地址发送 POST 请求创建订单</div>
            </div>
          </div>
          <div class="qs-step">
            <div class="qs-step-num">03</div>
            <div class="qs-step-content">
              <div class="qs-step-title">异步通知</div>
              <div class="qs-step-desc">支付完成后系统向您的 notify_url 发送回调</div>
            </div>
          </div>
        </div>

        <!-- Mini terminal -->
        <div class="qs-terminal">
          <div class="qs-term-bar">
            <span class="qs-dot r"></span>
            <span class="qs-dot y"></span>
            <span class="qs-dot g"></span>
            <span class="qs-term-title">示例请求</span>
          </div>
          <div class="qs-term-body">
            <div class="qs-line"><span class="t-k">POST</span> <span class="t-v">{{ siteSettings.pay_api_url || '/api/pay' }}</span></div>
            <div class="qs-line"><span class="t-k">Content-Type:</span> <span class="t-v">application/json</span></div>
            <div class="qs-line q"></div>
            <div class="qs-line"><span class="t-s">{{ '{' }}</span></div>
            <div class="qs-line">  <span class="t-k">"pid"</span>: <span class="t-s">"{{ userStore.merchantId || credentials.pid || '1001' }}"</span>,</div>
            <div class="qs-line">  <span class="t-k">"type"</span>: <span class="t-s">"alipay"</span>,</div>
            <div class="qs-line">  <span class="t-k">"out_trade_no"</span>: <span class="t-s">"ORDER_{{ '{' }}timestamp{{ '}' }}"</span>,</div>
            <div class="qs-line">  <span class="t-k">"notify_url"</span>: <span class="t-s">"https://your-site.com/notify"</span></div>
            <div class="qs-line"><span class="t-s">{{ '}' }}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, h } from 'vue'
import { useUserStore } from '../../store/modules/user'
import { getMerchantAccountInfo, getMerchantCredentials, getSiteSettings, resetMerchantKey } from '../../api/auth'
import { getMerchantOrders } from '../../api/order'
import { formatMoney } from '../../utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'

const userStore = useUserStore()
const loading = ref(false)

const summary = reactive({ totalCount: 0, successRate: '0.0' })
const accountBalance = ref(0)
const freezeBalance = ref(0)
const totalIncome = ref(0)
const showKey = ref(false)
const credentials = reactive({ pid: '-', key: '', name: '' })
const siteSettings = reactive({ site_name: '', pay_api_url: '' })

// SVG icon components
const IconTickets = () => h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', innerHTML: '<path d="M2 4H14M2 4V12C2 12.5523 2.44772 13 3 13H13C13.5523 13 14 12.5523 14 12V4M2 4V3C2 2.44772 2.44772 2 3 2H13C13.5523 2 14 2.44772 14 3V4M6 7H10M6 10H8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>' })
const IconCheck = () => h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', innerHTML: '<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2"/><path d="M5.5 8L7.2 9.7L10.5 6.3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>' })
const IconWallet = () => h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', innerHTML: '<rect x="1.5" y="4" width="13" height="9" rx="2" stroke="currentColor" stroke-width="1.2"/><path d="M1.5 7H14.5" stroke="currentColor" stroke-width="1.2"/><path d="M11 9.5H12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>' })
const IconLock = () => h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', innerHTML: '<rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" stroke-width="1.2"/><path d="M5.5 7V5C5.5 3.61929 6.61929 2.5 8 2.5C9.38071 2.5 10.5 3.61929 10.5 5V7" stroke="currentColor" stroke-width="1.2"/>' })
const IconTrend = () => h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', innerHTML: '<path d="M2 12L5.5 8.5L8.5 10.5L14 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 4H14V8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>' })

const stats = computed(() => [
  {
    label: '订单总数',
    value: summary.totalCount,
    icon: IconTickets,
    iconClass: 'amber',
    valueClass: '',
    barWidth: summary.totalCount > 0 ? '60%' : '5%',
  },
  {
    label: '成功率',
    value: summary.successRate + '%',
    icon: IconCheck,
    iconClass: 'green',
    valueClass: '',
    barWidth: summary.successRate + '%',
  },
  {
    label: '账户余额',
    value: '¥' + formatMoney(accountBalance.value),
    icon: IconWallet,
    iconClass: 'blue',
    valueClass: '',
    barWidth: accountBalance.value > 0 ? '70%' : '5%',
  },
  {
    label: '冻结余额',
    value: '¥' + formatMoney(freezeBalance.value),
    icon: IconLock,
    iconClass: 'yellow',
    valueClass: '',
    barWidth: freezeBalance.value > 0 ? '40%' : '5%',
  },
  {
    label: '总收入',
    value: '¥' + formatMoney(totalIncome.value),
    icon: IconTrend,
    iconClass: 'amber',
    valueClass: 'highlight-value',
    barWidth: totalIncome.value > 0 ? '85%' : '5%',
  },
])

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const [accountRes, orderRes, credRes, settingsRes] = await Promise.all([
      getMerchantAccountInfo(),
      getMerchantOrders({ page: 1, size: 100 }),
      getMerchantCredentials(),
      getSiteSettings(),
    ])
    const data = accountRes.data
    accountBalance.value = (data.availableBalance || 0) + (data.frozenBalance || 0)
    freezeBalance.value = data.frozenBalance || 0
    totalIncome.value = data.totalIncome || 0

    const total = orderRes.data.total || 0
    const records = orderRes.data.records || []
    summary.totalCount = total

    if (total > 0 && records.length > 0) {
      const successCount = records.filter(o => o.status === 1).length
      summary.successRate = ((successCount / records.length) * 100).toFixed(1)
    } else {
      summary.successRate = '0.0'
    }

    Object.assign(credentials, credRes.data)
    Object.assign(siteSettings, settingsRes.data || {})
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function copyPid() {
  const pid = userStore.merchantId || credentials.pid
  if (pid) navigator.clipboard.writeText(String(pid)).then(() => ElMessage.success('PID 已复制'))
}

function copyKey() {
  if (credentials.key) navigator.clipboard.writeText(credentials.key).then(() => ElMessage.success('密钥已复制'))
}

function copyApiUrl() {
  if (siteSettings.pay_api_url) navigator.clipboard.writeText(siteSettings.pay_api_url).then(() => ElMessage.success('接口地址已复制'))
}

async function handleResetKey() {
  try {
    await ElMessageBox.confirm('重置后原密钥将立即失效，确定继续？', '重置密钥', { type: 'warning' })
    await resetMerchantKey()
    ElMessage.success('密钥已重置')
    loadData()
  } catch { /* cancel */ }
}
</script>

<style scoped>
/* ===== Variables ===== */
.dashboard {
  --amber: #d4973b;
  --amber-light: #edc068;
  --amber-glow: rgba(212, 151, 59, 0.12);
  --amber-glow-s: rgba(212, 151, 59, 0.08);
  --green: #4db882;
  --green-glow: rgba(77, 184, 130, 0.12);
  --blue: #6da3e3;
  --blue-glow: rgba(109, 163, 227, 0.12);
  --yellow: #d4b23a;
  --yellow-glow: rgba(212, 178, 58, 0.12);
  --bg-card: #18181c;
  --bg-card-hover: #1e1e23;
  --bg-input: #1f1f25;
  --border: rgba(255, 255, 255, 0.08);
  --border-hover: rgba(255, 255, 255, 0.15);
  --text-primary: #f0ece4;
  --text-secondary: rgba(240, 236, 228, 0.65);
  --text-muted: rgba(240, 236, 228, 0.4);
  position: relative;
}

/* ===== Background ===== */
.dash-bg-grid {
  position: fixed;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
  z-index: 0;
}

/* ===== Header ===== */
.dash-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
  position: relative;
  z-index: 1;
}

.greeting-title {
  margin: 0;
  line-height: 1.2;
}

.greeting-label {
  display: block;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.greeting-name {
  display: block;
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 32px;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.greeting-sub {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 8px 0 0;
}

.icon-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  border-color: var(--border-hover);
  color: var(--amber-light);
  background: var(--bg-card-hover);
}

.icon-btn.spinning svg {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== Stats Row ===== */
.stats-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.25s ease;
  animation: fadeSlideUp 0.5s ease both;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  border-color: var(--border-hover);
  background: var(--bg-card-hover);
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: 0.3px;
}

.stat-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.amber { background: var(--amber-glow); color: var(--amber); }
.stat-icon.green { background: var(--green-glow); color: var(--green); }
.stat-icon.blue { background: var(--blue-glow); color: var(--blue); }
.stat-icon.yellow { background: var(--yellow-glow); color: var(--yellow); }

.stat-value {
  font-family: 'Space Mono', monospace;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.highlight-value {
  color: var(--amber-light);
}

.stat-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
}

.stat-bar-fill.amber { background: var(--amber); opacity: 0.6; }
.stat-bar-fill.green { background: var(--green); opacity: 0.6; }
.stat-bar-fill.blue { background: var(--blue); opacity: 0.6; }
.stat-bar-fill.yellow { background: var(--yellow); opacity: 0.6; }

/* ===== Main Grid ===== */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  position: relative;
  z-index: 1;
}

/* ===== Cards ===== */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 24px;
  animation: fadeSlideUp 0.6s ease 0.3s both;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--amber-glow);
  color: var(--amber-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.text-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: none;
  background: none;
  color: var(--text-secondary);
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s;
}

.text-btn:hover {
  color: var(--amber-light);
  background: var(--amber-glow-s);
}

/* ===== Credentials ===== */
.cred-rows {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cred-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cred-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cred-value-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cred-code {
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  color: var(--text-primary);
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 12px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cred-code.pid {
  color: var(--amber-light);
  border-color: rgba(212, 151, 59, 0.2);
  background: rgba(212, 151, 59, 0.06);
}

.cred-code.masked {
  color: var(--text-muted);
  letter-spacing: 3px;
}

.cred-code.url {
  font-size: 12px;
  color: var(--text-secondary);
}

.cred-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.copy-btn,
.toggle-btn {
  flex-shrink: 0;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn {
  width: 32px;
}

.toggle-btn {
  width: auto;
  padding: 0 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
}

.copy-btn:hover,
.toggle-btn:hover {
  border-color: var(--border-hover);
  color: var(--amber-light);
  background: var(--amber-glow-s);
}

.cred-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 0;
}

/* ===== Quick Start ===== */
.qs-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.qs-step {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.qs-step-num {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  color: var(--amber-light);
  background: var(--amber-glow);
  border: 1px solid rgba(212, 151, 59, 0.18);
  border-radius: 7px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qs-step-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 3px;
}

.qs-step-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Mini terminal */
.qs-terminal {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  overflow: hidden;
}

.qs-term-bar {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.qs-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.qs-dot.r { background: #ff5f57; }
.qs-dot.y { background: #febc2e; }
.qs-dot.g { background: #28c840; }

.qs-term-title {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  color: var(--text-muted);
  margin-left: 6px;
  letter-spacing: 0.3px;
}

.qs-term-body {
  padding: 12px 14px;
}

.qs-line {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  line-height: 1.9;
  white-space: nowrap;
  color: var(--text-secondary);
}

.qs-line.q {
  height: 4px;
}

.t-k { color: #8bb4d6; }
.t-v { color: var(--text-secondary); }
.t-s { color: #8fd4a8; }

/* ===== Animations ===== */
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== Responsive ===== */
@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(3, 1fr);
  }
  .main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .greeting-name {
    font-size: 24px;
  }

  .stat-value {
    font-size: 20px;
  }

  .qs-terminal {
    display: none;
  }
}
</style>
