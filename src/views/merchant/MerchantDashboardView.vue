<template>
  <PageContainer>
    <template #header>
      <div class="header-left">
        <h2 class="page-title">{{ userStore.merchantName || '工作台' }}</h2>
        <p class="page-desc">{{ userStore.nickname ? '姓名：' + userStore.nickname : '商户管理中心' }}</p>
      </div>
    </template>
    <template #actions>
      <el-button @click="loadData">
        <el-icon><Refresh /></el-icon>刷新
      </el-button>
    </template>

    <!-- Summary Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon count">
          <el-icon :size="24"><Tickets /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ summary.totalCount }}</div>
          <div class="stat-label">订单总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success">
          <el-icon :size="24"><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ summary.successRate }}%</div>
          <div class="stat-label">成功率</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon balance">
          <el-icon :size="24"><Wallet /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatMoney(accountBalance) }}</div>
          <div class="stat-label">账户余额</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon freeze">
          <el-icon :size="24"><Lock /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatMoney(freezeBalance) }}</div>
          <div class="stat-label">冻结余额</div>
        </div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-icon income">
          <el-icon :size="24"><TrendCharts /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value highlight-value">{{ formatMoney(totalIncome) }}</div>
          <div class="stat-label">总收入</div>
        </div>
      </div>
    </div>

    <!-- API Info Card -->
    <div class="cred-card">
      <div class="cred-header">
        <span class="cred-title">对接信息</span>
      </div>
      <div class="cred-body">
        <div class="cred-row">
          <span class="cred-label">站点名称</span>
          <span class="cred-value">{{ siteSettings.site_name }}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">支付接口地址</span>
          <div class="cred-key-row">
            <span class="cred-value font-mono">{{ siteSettings.pay_api_url }}</span>
            <el-button type="primary" link size="small" @click="copyApiUrl">复制</el-button>
          </div>
        </div>
        <el-divider />
        <div class="cred-row">
          <span class="cred-label">商户编号 (PID)</span>
          <span class="cred-value font-mono">{{ userStore.merchantId || credentials.pid || '-' }}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">密钥 (Key)</span>
          <div class="cred-key-row">
            <span class="cred-value font-mono" :class="{ hidden: !showKey }">
              {{ showKey ? credentials.key : '••••••••••••••••••••••••••••••••' }}
            </span>
            <el-button type="primary" link size="small" @click="showKey = !showKey">
              {{ showKey ? '隐藏' : '显示' }}
            </el-button>
            <el-button type="primary" link size="small" @click="copyKey">复制</el-button>
            <el-button type="warning" link size="small" @click="handleResetKey">重置密钥</el-button>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '../../store/modules/user'
import { getMerchantAccountInfo, getMerchantCredentials, getSiteSettings, resetMerchantKey } from '../../api/auth'
import { getMerchantOrders } from '../../api/order'
import { formatMoney } from '../../utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '../../components/PageContainer.vue'

const userStore = useUserStore()

const summary = reactive({
  totalCount: 0,
  successRate: 0,
})
const accountBalance = ref(0)
const freezeBalance = ref(0)
const totalIncome = ref(0)
const showKey = ref(false)
const credentials = reactive({ pid: '-', key: '', name: '' })
const siteSettings = reactive({ site_name: '', pay_api_url: '' })

onMounted(() => loadData())

async function loadData() {
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
  } catch (e) {
    // ignore
  }
}

function copyKey() {
  navigator.clipboard.writeText(credentials.key).then(() => ElMessage.success('已复制'))
}

function copyApiUrl() {
  navigator.clipboard.writeText(siteSettings.pay_api_url).then(() => ElMessage.success('已复制'))
}

async function handleResetKey() {
  try {
    await ElMessageBox.confirm('重置后原密钥将失效，确定继续？', '警告', { type: 'warning' })
    await resetMerchantKey()
    ElMessage.success('密钥已重置')
    loadData()
  } catch { /* cancel */ }
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  background: var(--ep-bg-card);
  border: 1px solid var(--ep-border-light);
  border-radius: var(--ep-radius);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.orders {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.stat-icon.count {
  background: rgba(52, 211, 153, 0.1);
  color: #34d399;
}

.stat-icon.success {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
}

.stat-icon.balance {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.stat-icon.freeze {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
}

.stat-icon.income {
  background: rgba(52, 211, 153, 0.1);
  color: #34d399;
}

.stat-card.highlight {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border-color: #6ee7b7;
}

.stat-card.highlight .stat-icon.income {
  background: rgba(52, 211, 153, 0.2);
  color: #059669;
}

.highlight-value {
  color: #059669;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: var(--ep-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-label {
  font-size: 12px;
  color: var(--ep-text-secondary);
  margin-top: 4px;
}

.cred-card {
  background: var(--ep-bg-card);
  border: 1px solid var(--ep-border-light);
  border-radius: var(--ep-radius);
  padding: 20px;
}

.cred-header {
  margin-bottom: 16px;
}

.cred-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ep-text-primary);
}

.cred-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cred-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cred-key-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cred-label {
  font-size: 12px;
  color: var(--ep-text-secondary);
}

.cred-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--ep-text-primary);
}

.cred-value.hidden {
  color: var(--ep-text-placeholder);
  letter-spacing: 2px;
}

.font-mono {
  font-family: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace;
}
</style>
