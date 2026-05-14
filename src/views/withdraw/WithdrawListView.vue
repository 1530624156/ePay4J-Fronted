<template>
  <PageContainer title="提现管理" desc="管理商户提现任务">
    <template #actions>
      <el-button type="primary" @click="loadData">
        <el-icon><Refresh /></el-icon>刷新
      </el-button>
    </template>

    <!-- Filter -->
    <div class="filter-card">
      <el-form :inline="true" :model="query" @submit.prevent="loadData">
        <el-form-item label="商户名">
          <el-input v-model="query.merchantName" placeholder="搜索商户名" clearable style="width:150px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width:130px">
            <el-option label="处理中" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Table -->
    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="提现单号" width="100">
          <template #default="{ row }">
            <span class="font-mono" style="font-size:12px">{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="merchantId" label="商户ID" width="80">
          <template #default="{ row }">
            <span style="font-family:'JetBrains Mono',monospace;color:var(--ep-primary)">{{ row.merchantId }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="merchantName" label="商户名" min-width="140">
          <template #default="{ row }">
            <div style="display:flex;align-items:center;gap:8px">
              <div class="merchant-avatar">{{ (row.merchantName || '商').charAt(0) }}</div>
              <span style="font-weight:500">{{ row.merchantName || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="提现金额" width="120">
          <template #default="{ row }">
            <span style="font-weight:700;font-family:'JetBrains Mono',monospace">¥{{ formatMoney(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small" round>
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="140">
          <template #default="{ row }">
            <span style="color:var(--ep-text-secondary)">{{ row.remark || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="170">
          <template #default="{ row }">
            <span style="font-size:13px;color:var(--ep-text-secondary)">{{ formatDate(row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 0">
              <el-button type="success" link size="small" @click="handleApprove(row)">通过</el-button>
              <el-button type="danger" link size="small" @click="handleReject(row)">拒绝</el-button>
            </template>
            <el-button type="primary" link size="small" @click="viewDetail(row)">详情</el-button>
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
          @change="loadData"
        />
      </div>
    </div>

    <!-- Detail Drawer -->
    <el-drawer v-model="detailVisible" title="提现详情" size="480px">
      <div v-if="currentRecord" class="detail-sections">
        <div class="detail-section">
          <h4 class="section-title">基本信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">提现单号</span>
              <span class="info-value font-mono">{{ currentRecord.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">状态</span>
              <span class="info-value">
                <el-tag :type="getStatusType(currentRecord.status)" size="small">
                  {{ getStatusLabel(currentRecord.status) }}
                </el-tag>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">提现金额</span>
              <span class="info-value" style="font-weight:700;font-family:'JetBrains Mono',monospace">
                ¥{{ formatMoney(currentRecord.amount) }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">申请时间</span>
              <span class="info-value">{{ formatDate(currentRecord.createTime) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">商户信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">商户ID</span>
              <span class="info-value font-mono">{{ currentRecord.merchantId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">商户名称</span>
              <span class="info-value">{{ currentRecord.merchantName || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">姓名</span>
              <span class="info-value">{{ currentRecord.nickName || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">手机号</span>
              <span class="info-value font-mono">{{ currentRecord.phone || '-' }}</span>
            </div>
            <div class="info-item full">
              <span class="info-label">支付宝账号</span>
              <span class="info-value font-mono">{{ currentRecord.alipayAccount || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="currentRecord.remark">
          <h4 class="section-title">备注</h4>
          <div class="info-grid">
            <div class="info-item full">
              <span class="info-value">{{ currentRecord.remark }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div style="display:flex;gap:8px">
          <template v-if="currentRecord && currentRecord.status === 0">
            <el-button type="success" @click="handleApprove(currentRecord)">通过</el-button>
            <el-button type="danger" plain @click="handleReject(currentRecord)">拒绝</el-button>
          </template>
          <div style="flex:1"></div>
          <el-button @click="detailVisible = false">关闭</el-button>
        </div>
      </template>
    </el-drawer>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getWithdrawPage, getWithdrawDetail, approveWithdraw, rejectWithdraw } from '../../api/order'
import { formatMoney, formatDate } from '../../utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '../../components/PageContainer.vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const detailVisible = ref(false)
const currentRecord = ref(null)

const query = reactive({ page: 1, size: 20, merchantId: null, merchantName: '', status: null })

const statusMap = {
  0: { label: '处理中', type: 'warning' },
  1: { label: '已通过', type: 'success' },
  2: { label: '已拒绝', type: 'danger' },
}

onMounted(() => loadData())

function getStatusType(status) {
  return statusMap[status]?.type || 'info'
}

function getStatusLabel(status) {
  return statusMap[status]?.label || '未知'
}

async function loadData() {
  loading.value = true
  try {
    const params = { page: query.page, size: query.size }
    if (query.merchantId) params.merchantId = query.merchantId
    if (query.merchantName) params.merchantName = query.merchantName
    if (query.status !== null && query.status !== '') params.status = query.status
    const res = await getWithdrawPage(params)
    tableData.value = res.data.records || []
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  query.merchantId = null
  query.merchantName = ''
  query.status = null
  query.page = 1
  loadData()
}

async function viewDetail(row) {
  try {
    const res = await getWithdrawDetail(row.id)
    currentRecord.value = res.data
  } catch {
    currentRecord.value = row
  }
  detailVisible.value = true
}

async function handleApprove(row) {
  try {
    await ElMessageBox.confirm('确定通过此提现申请？', '确认', { type: 'success' })
    await approveWithdraw(row.id)
    ElMessage.success('已通过')
    detailVisible.value = false
    loadData()
  } catch { /* cancel */ }
}

async function handleReject(row) {
  try {
    await ElMessageBox.prompt('请输入拒绝原因', '拒绝提现', {
      inputPlaceholder: '请输入拒绝原因',
      inputPattern: /\S+/,
      inputErrorMessage: '拒绝理由不能为空',
    }).then(async ({ value }) => {
      await rejectWithdraw(row.id, { reason: value })
      ElMessage.success('已拒绝')
      detailVisible.value = false
      loadData()
    })
  } catch { /* cancel */ }
}
</script>

<style scoped>
.filter-card {
  background: var(--ep-bg-card);
  border: 1px solid var(--ep-border-light);
  border-radius: var(--ep-radius);
  box-shadow: var(--ep-shadow-sm);
  padding: 16px 20px;
}

.table-card {
  background: var(--ep-bg-card);
  border: 1px solid var(--ep-border-light);
  border-radius: var(--ep-radius);
  box-shadow: var(--ep-shadow-sm);
  padding: 16px 20px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.merchant-avatar {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--ep-primary), var(--ep-primary-light));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.font-mono {
  font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
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
  font-size: 13px;
  font-weight: 600;
  color: var(--ep-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--ep-border-light);
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
  font-size: 12px;
  color: var(--ep-text-placeholder);
}

.info-value {
  font-size: 14px;
  color: var(--ep-text-primary);
  font-weight: 500;
}
</style>
