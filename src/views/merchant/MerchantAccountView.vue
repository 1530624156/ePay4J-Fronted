<template>
  <PageContainer title="账户管理" desc="查看商户账户信息">
    <template #actions>
      <el-button @click="router.back()">
        <el-icon><Back /></el-icon>返回
      </el-button>
      <el-button @click="loadData">
        <el-icon><Refresh /></el-icon>刷新
      </el-button>
    </template>

    <!-- Balance Card -->
    <div class="balance-card">
      <div class="balance-header">
        <div class="merchant-info">
          <div class="merchant-avatar">{{ (account.merchantName || '商').charAt(0) }}</div>
          <div>
            <div class="merchant-name">{{ account.merchantName || '-' }}</div>
            <div class="merchant-id">商户ID：{{ account.merchantId }}</div>
          </div>
        </div>
        <div class="balance-amount">
          <div class="balance-label">账户余额</div>
          <div class="balance-value">
            <span class="currency">¥</span>
            <span class="amount">{{ formatMoney(totalBalance) }}</span>
          </div>
        </div>
      </div>

      <div class="balance-stats">
        <div class="stat-item">
          <div class="stat-label">冻结金额</div>
          <div class="stat-value freeze">¥{{ formatMoney(account.frozenBalance) }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">可用余额</div>
          <div class="stat-value">¥{{ formatMoney(account.availableBalance) }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">累计收入</div>
          <div class="stat-value income">¥{{ formatMoney(account.totalIncome) }}</div>
        </div>
      </div>
    </div>

    <!-- Detail Card -->
    <div class="detail-card">
      <h4 class="section-title">商户信息</h4>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">商户编号</span>
          <span class="info-value font-mono">{{ account.merchantId || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">商户名称</span>
          <span class="info-value">{{ account.merchantName || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">姓名</span>
          <span class="info-value">{{ account.nickName || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">手机号</span>
          <span class="info-value font-mono">{{ account.phone || '-' }}</span>
        </div>
        <div class="info-item full">
          <span class="info-label">支付宝账号</span>
          <span class="info-value font-mono">{{ account.alipayAccount || '-' }}</span>
        </div>
      </div>

      <el-divider />

      <h4 class="section-title">账户明细</h4>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">累计收入</span>
          <span class="info-value font-mono" style="color:#059669;font-weight:700">¥{{ formatMoney(account.totalIncome) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">可用余额</span>
          <span class="info-value font-mono" style="font-weight:700">¥{{ formatMoney(account.availableBalance) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">冻结余额</span>
          <span class="info-value font-mono" style="color:#f59e0b;font-weight:700">¥{{ formatMoney(account.frozenBalance) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">创建时间</span>
          <span class="info-value">{{ formatDate(account.createTime) || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">更新时间</span>
          <span class="info-value">{{ formatDate(account.updateTime) || '-' }}</span>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMerchantAccount } from '../../api/merchant'
import { formatMoney, formatDate } from '../../utils/format'
import PageContainer from '../../components/PageContainer.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const merchantId = ref(Number(route.params.merchantId))
const account = reactive({
  id: null,
  merchantId: null,
  totalIncome: 0,
  availableBalance: 0,
  frozenBalance: 0,
  createTime: null,
  updateTime: null,
  merchantName: route.query.merchantName || '',
  alipayAccount: '',
  nickName: '',
  phone: ''
})

const totalBalance = computed(() => (account.availableBalance || 0) + (account.frozenBalance || 0))

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const res = await getMerchantAccount(merchantId.value)
    Object.assign(account, res.data || {})
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.balance-card {
  background: linear-gradient(135deg, var(--ep-primary), #43a3f7);
  border-radius: var(--ep-radius);
  padding: 24px 28px;
  color: #fff;
  margin-bottom: 16px;
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.merchant-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.merchant-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
}

.merchant-name {
  font-size: 18px;
  font-weight: 600;
}

.merchant-id {
  font-size: 13px;
  opacity: 0.8;
  margin-top: 4px;
}

.balance-amount {
  text-align: right;
}

.balance-label {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.balance-value {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
}

.currency {
  font-size: 20px;
  font-weight: 600;
  margin-right: 4px;
}

.amount {
  font-size: 36px;
  font-weight: 700;
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  letter-spacing: -1px;
}

.balance-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 12px;
  opacity: 0.85;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
}

.stat-value.freeze {
  color: #ffd866;
}

.stat-value.income {
  color: #7fffa8;
}

.detail-card {
  background: var(--ep-bg-card);
  border: 1px solid var(--ep-border-light);
  border-radius: var(--ep-radius);
  padding: 20px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ep-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.info-item {
  padding: 14px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item.full {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 12px;
  color: var(--ep-text-placeholder);
}

.info-value {
  font-size: 15px;
  color: var(--ep-text-primary);
  font-weight: 500;
}

.font-mono {
  font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
}
</style>
