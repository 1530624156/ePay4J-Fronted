<template>
  <PageContainer title="提现管理" desc="查看提现记录和申请提现">
    <template #actions>
      <el-tooltip :disabled="!hasPending" content="有处理中的提现任务，请等待完成后再申请" placement="bottom">
        <el-button class="withdraw-btn" type="primary" :disabled="hasPending" @click="openWithdrawDialog">
          <el-icon><Wallet /></el-icon>申请提现
        </el-button>
      </el-tooltip>
    </template>

    <!-- Balance Summary -->
    <div class="balance-bar">
      <div class="balance-item">
        <span class="balance-label">可提现余额</span>
        <span class="balance-value">¥{{ formatMoney(availableBalance) }}</span>
      </div>
      <div class="balance-divider"></div>
      <div class="balance-item">
        <span class="balance-label">冻结金额</span>
        <span class="balance-value">¥{{ formatMoney(freezeBalance) }}</span>
      </div>
      <div class="balance-divider"></div>
      <div class="balance-item">
        <span class="balance-label">账户余额</span>
        <span class="balance-value">¥{{ formatMoney(totalBalance) }}</span>
      </div>
    </div>

    <!-- Records Table -->
    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="提现单号" width="100">
          <template #default="{ row }">
            <span class="font-mono" style="font-size:12px;color:rgba(240,236,228,0.6)">{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="提现金额" width="120">
          <template #default="{ row }">
            <span style="font-weight:700;font-family:'Space Mono',monospace;color:rgba(240,236,228,0.75)">¥{{ formatMoney(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="serviceFee" label="手续费" width="110">
          <template #default="{ row }">
            <span style="font-family:'Space Mono',monospace;color:rgba(240,236,228,0.5)">
              {{ row.serviceFee != null ? '¥' + formatMoney(row.serviceFee) : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="amountCredited" label="实际到账" width="120">
          <template #default="{ row }">
            <span style="font-weight:700;font-family:'Space Mono',monospace;color:rgba(74,222,128,0.6)">
              {{ row.amountCredited != null ? '¥' + formatMoney(row.amountCredited) : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small" round>
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120">
          <template #default="{ row }">
            <span style="color:rgba(240,236,228,0.5)">{{ row.remark || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="170">
          <template #default="{ row }">
            <span style="font-size:13px;color:rgba(240,236,228,0.5)">{{ formatDate(row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="处理时间" width="170">
          <template #default="{ row }">
            <span style="font-size:13px;color:rgba(240,236,228,0.5)">{{ formatDate(row.updateTime) || '-' }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.size"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="loadData"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- Withdraw Dialog -->
    <el-dialog v-model="dialogVisible" title="申请提现" width="400px">
      <el-form ref="formRef" :model="withdrawForm" :rules="rules" label-width="80px">
        <el-form-item label="提现金额" prop="amount">
          <el-input-number
            v-model="withdrawForm.amount"
            :precision="2"
            :min="0.01"
            :max="availableBalance || undefined"
            controls-position="right"
            style="width:100%"
            placeholder="请输入提现金额"
          />
        </el-form-item>
        <div class="withdraw-tip">
          <el-alert v-if="availableBalance <= 0" type="warning" :closable="false" show-icon>
            <template #title>
              当前无可提现余额，请等待处理中的提现完成
            </template>
          </el-alert>
          <el-alert v-else type="info" :closable="false" show-icon>
            <template #title>
              当前可提现余额：¥{{ formatMoney(availableBalance) }}
            </template>
          </el-alert>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定提现</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getWithdrawRecords, submitWithdraw, getMerchantAccountInfo } from '../../api/auth'
import { formatMoney, formatDate } from '../../utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '../../components/PageContainer.vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref()

const availableBalance = ref(0)
const freezeBalance = ref(0)
const totalBalance = ref(0)

const query = reactive({ page: 1, size: 20 })
const withdrawForm = reactive({ amount: null })
const hasPending = computed(() => tableData.value.some(r => r.status === 0))
const rules = {
  amount: [
    { required: true, message: '请输入提现金额', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === null || value === undefined || value <= 0) {
          callback(new Error('提现金额必须大于0'))
        } else if (value > availableBalance.value) {
          callback(new Error('超过可提现余额'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

const statusMap = {
  0: { label: '处理中', type: 'warning' },
  1: { label: '已通过', type: 'success' },
  2: { label: '已拒绝', type: 'danger' },
}

onMounted(() => {
  loadAccount()
  loadData()
})

async function loadAccount() {
  try {
    const res = await getMerchantAccountInfo()
    const data = res.data
    availableBalance.value = data.availableBalance || 0
    freezeBalance.value = data.frozenBalance || 0
    totalBalance.value = availableBalance.value + freezeBalance.value
  } catch { /* ignore */ }
}

async function loadData() {
  loading.value = true
  try {
    const res = await getWithdrawRecords(query)
    tableData.value = res.data.records || []
    total.value = res.data.total || 0
  } finally {
    loading.value = false
  }
}

function handleSizeChange() {
  query.page = 1
  loadData()
}

function getStatusType(status) {
  return statusMap[status]?.type || 'info'
}

function getStatusLabel(status) {
  return statusMap[status]?.label || '未知'
}

function openWithdrawDialog() {
  withdrawForm.amount = null
  dialogVisible.value = true
}

async function handleSubmit() {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    await submitWithdraw({ amount: String(withdrawForm.amount) })
    ElMessage.success('提现申请已提交')
    dialogVisible.value = false
    loadData()
    loadAccount()
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e?.message || '提现申请失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.balance-bar {
  background: #18181c;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 22px 32px;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 24px;
}

.balance-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.balance-label {
  font-size: 12px;
  color: rgba(240, 236, 228, 0.4);
  letter-spacing: 0.3px;
}

.balance-value {
  font-size: 22px;
  font-weight: 700;
  font-family: 'Space Mono', monospace;
  color: rgba(240, 236, 228, 0.8);
}

.balance-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
}

.table-card {
  background: #18181c;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px 20px;
}

/* Table dark overrides */
.table-card :deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(255, 255, 255, 0.02);
  --el-table-header-text-color: rgba(240, 236, 228, 0.35);
  --el-table-text-color: rgba(240, 236, 228, 0.75);
  --el-table-border-color: rgba(255, 255, 255, 0.04);
  --el-table-row-hover-bg-color: rgba(255, 255, 255, 0.03);
  --el-table-current-row-bg-color: rgba(255, 255, 255, 0.03);
  --el-table-expanded-cell-bg-color: transparent;
  background: transparent;
}

.table-card :deep(.el-table__empty-block) {
  background: transparent;
}

.table-card :deep(.el-table th.el-table__cell) {
  background: rgba(255, 255, 255, 0.02) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-card :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.table-card :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: rgba(255, 255, 255, 0.015);
}

.table-card :deep(.el-table .el-table__row:hover > td) {
  background: rgba(255, 255, 255, 0.03) !important;
}

.table-card :deep(.el-table__inner-wrapper::before) {
  background-color: rgba(255, 255, 255, 0.04);
}

.table-card :deep(.el-table--border::after) {
  background-color: rgba(255, 255, 255, 0.04);
}

/* Tag dark overrides — subdued */
.table-card :deep(.el-tag--warning) {
  --el-tag-bg-color: rgba(234, 179, 8, 0.08);
  --el-tag-text-color: rgba(251, 191, 36, 0.7);
  --el-tag-border-color: rgba(234, 179, 8, 0.12);
}

.table-card :deep(.el-tag--success) {
  --el-tag-bg-color: rgba(34, 197, 94, 0.08);
  --el-tag-text-color: rgba(74, 222, 128, 0.7);
  --el-tag-border-color: rgba(34, 197, 94, 0.12);
}

.table-card :deep(.el-tag--danger) {
  --el-tag-bg-color: rgba(239, 68, 68, 0.08);
  --el-tag-text-color: rgba(248, 113, 113, 0.7);
  --el-tag-border-color: rgba(239, 68, 68, 0.12);
}

.table-card :deep(.el-tag--info) {
  --el-tag-bg-color: rgba(255, 255, 255, 0.04);
  --el-tag-text-color: rgba(240, 236, 228, 0.45);
  --el-tag-border-color: rgba(255, 255, 255, 0.08);
}

/* Pagination — warm dark tones, no white */
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* Dialog dark overrides */
:deep(.el-dialog) {
  --el-dialog-bg-color: #18181c;
  --el-dialog-title-font-color: rgba(240, 236, 228, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px 20px;
}

:deep(.el-dialog__title) {
  color: rgba(240, 236, 228, 0.8);
  font-weight: 600;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: rgba(240, 236, 228, 0.35);
}

:deep(.el-dialog__headerbtn .el-dialog__close:hover) {
  color: rgba(240, 236, 228, 0.6);
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 12px 20px;
}

/* Form input dark overrides */
:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  background: #1f1f25 !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  box-shadow: none !important;
  color: rgba(240, 236, 228, 0.75);
  border-radius: 8px;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover) {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus) {
  border-color: rgba(201, 169, 110, 0.3) !important;
  box-shadow: 0 0 0 2px rgba(201, 169, 110, 0.06) !important;
}

:deep(.el-input__inner) {
  color: rgba(240, 236, 228, 0.75);
}

:deep(.el-input__inner::placeholder) {
  color: rgba(240, 236, 228, 0.25);
}

:deep(.el-form-item__label) {
  color: rgba(240, 236, 228, 0.45);
}

/* Input number dark overrides */
:deep(.el-input-number .el-input__wrapper) {
  background: #1f1f25 !important;
}

:deep(.el-input-number .el-input-number__decrease),
:deep(.el-input-number .el-input-number__increase) {
  background: #1f1f25;
  border-color: rgba(255, 255, 255, 0.06);
  color: rgba(240, 236, 228, 0.4);
}

:deep(.el-input-number .el-input-number__decrease:hover),
:deep(.el-input-number .el-input-number__increase:hover) {
  color: #c9a96e;
}

/* Alert dark overrides — subdued */
:deep(.el-alert--warning) {
  --el-alert-bg-color: rgba(234, 179, 8, 0.06);
  --el-alert-title-color: rgba(251, 191, 36, 0.7);
  border-color: rgba(234, 179, 8, 0.1);
}

:deep(.el-alert--info) {
  --el-alert-bg-color: rgba(201, 169, 110, 0.04);
  --el-alert-title-color: rgba(240, 236, 228, 0.5);
  border-color: rgba(201, 169, 110, 0.08);
}

:deep(.el-alert) {
  border-radius: 8px;
}

/* Primary button — gold for 申请提现 */
.withdraw-btn.el-button--primary {
  --el-button-bg-color: #c9a96e !important;
  --el-button-border-color: #c9a96e !important;
  --el-button-text-color: rgba(240, 236, 228, 0.9) !important;
  --el-button-hover-bg-color: #d4b87a !important;
  --el-button-hover-border-color: #d4b87a !important;
  --el-button-hover-text-color: rgba(240, 236, 228, 0.95) !important;
  --el-button-active-bg-color: #b89858 !important;
  --el-button-active-border-color: #b89858 !important;
  font-weight: 600;
}

/* Default button — dark ghost */
:deep(.el-button--default) {
  --el-button-bg-color: #1f1f25;
  --el-button-border-color: rgba(255, 255, 255, 0.06);
  --el-button-text-color: rgba(240, 236, 228, 0.45);
  --el-button-hover-bg-color: #252530;
  --el-button-hover-border-color: rgba(255, 255, 255, 0.1);
  --el-button-hover-text-color: rgba(240, 236, 228, 0.65);
}

/* Disabled button */
:deep(.el-button.is-disabled) {
  --el-button-bg-color: #1a1a1f;
  --el-button-border-color: rgba(255, 255, 255, 0.04);
  --el-button-text-color: rgba(240, 236, 228, 0.2);
}

/* Loading dark */
:deep(.el-loading-mask) {
  background: rgba(12, 12, 14, 0.7);
}

.font-mono {
  font-family: 'Space Mono', 'SF Mono', Consolas, monospace;
}

.withdraw-tip {
  margin-top: 8px;
}

/* Tooltip dark */
:global(.el-tooltip__popper) {
  background: #252530 !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  color: rgba(240, 236, 228, 0.7) !important;
}

/* Message box dark */
:global(.el-message-box) {
  --el-messagebox-title-color: rgba(240, 236, 228, 0.8);
  --el-messagebox-content-color: rgba(240, 236, 228, 0.5);
  background: #18181c !important;
  border-color: rgba(255, 255, 255, 0.06) !important;
  border-radius: 16px;
}

:global(.el-message-box__headerbtn .el-message-box__close) {
  color: rgba(240, 236, 228, 0.35);
}

:global(.el-message-box__headerbtn .el-message-box__close:hover) {
  color: rgba(240, 236, 228, 0.55);
}

:global(.el-message-box__btns .el-button--primary) {
  --el-button-bg-color: #6b5a24;
  --el-button-border-color: #7d6b2e;
  --el-button-text-color: #d4c08a;
  --el-button-hover-bg-color: #7d6b2e;
  --el-button-hover-border-color: #8b7a3e;
}

:global(.el-message-box__btns .el-button--default) {
  --el-button-bg-color: #1f1f25;
  --el-button-border-color: rgba(255, 255, 255, 0.06);
  --el-button-text-color: rgba(240, 236, 228, 0.45);
}

:global(.el-overlay) {
  background: rgba(0, 0, 0, 0.6) !important;
}
</style>
