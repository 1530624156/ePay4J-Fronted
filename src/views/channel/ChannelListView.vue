<template>
  <PageContainer title="支付通道" desc="配置和管理支付渠道参数">
    <template #actions>
      <el-button type="primary" @click="openCreate()">
        <el-icon><Plus /></el-icon>新增通道
      </el-button>
    </template>

    <!-- Filter -->
    <div class="filter-card">
      <el-form :inline="true" :model="query">
        <el-form-item label="通道名称">
          <el-input v-model="query.name" placeholder="搜索通道名称" clearable style="width:200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width:130px">
            <el-option label="已启用" :value="1" />
            <el-option label="已禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadChannels">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Channel Cards -->
    <div class="channels-grid">
      <div
        v-for="channel in filteredChannels"
        :key="channel.id"
        class="channel-card"
        :class="{ disabled: channel.status === 0 }"
      >
        <div class="card-header">
          <div class="channel-info">
            <div class="channel-icon" :style="{ background: getChannelBg(channel.channelCode) }">
              <span class="channel-emoji">{{ getChannelEmoji(channel.channelCode) }}</span>
            </div>
            <div>
              <h3 class="channel-name">{{ channel.channelName }}</h3>
              <span class="channel-code">{{ channel.channelCode }}</span>
            </div>
          </div>
          <div class="channel-badges">
            <el-tag v-if="channel.isDefault" size="small" type="warning" effect="plain" round>默认</el-tag>
            <el-tag :type="channel.status === 1 ? 'success' : 'info'" size="small" round>
              {{ channel.status === 1 ? '已启用' : '已禁用' }}
            </el-tag>
          </div>
        </div>

        <div class="card-meta">
          <div class="meta-item">
            <span class="meta-label">配置参数</span>
            <span class="meta-value">{{ getConfigCount(channel) }} 项</span>
          </div>
          <div class="meta-item" v-if="channel.remark">
            <span class="meta-label">备注</span>
            <span class="meta-value">{{ channel.remark }}</span>
          </div>
          <div class="meta-item" v-if="channel.updateTime">
            <span class="meta-label">更新时间</span>
            <span class="meta-value">{{ formatDate(channel.updateTime) }}</span>
          </div>
        </div>

        <div class="card-footer">
          <el-switch
            v-model="channel.status"
            :active-value="1"
            :inactive-value="0"
            @change="toggleStatus(channel)"
            active-text="启用"
            inactive-text="禁用"
            style="--el-switch-on-color: var(--ep-success)"
          />
          <div class="card-actions">
            <el-button type="primary" size="small" plain @click="openConfig(channel)">
              <el-icon><Edit /></el-icon>配置
            </el-button>
            <el-button type="danger" size="small" plain @click="handleDelete(channel)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!filteredChannels.length && !loading" class="empty-state">
        <el-empty description="暂无支付通道" :image-size="100">
          <el-button type="primary" @click="openCreate">新增通道</el-button>
        </el-empty>
      </div>
    </div>

    <!-- Config Dialog -->
    <el-dialog v-model="dialogVisible" :title="isCreate ? '新增支付通道' : '编辑配置 - ' + (currentChannel ? currentChannel.channelName : '')" width="600px" top="5vh">
      <el-form ref="formRef" :model="configForm" :rules="formRules" label-width="120px">
        <template v-if="isCreate">
          <el-form-item label="通道类型" prop="channelCode">
            <el-select v-model="configForm.channelCode" placeholder="选择支付通道" style="width:100%" @change="onChannelTypeChange">
              <el-option v-for="t in channelTypes" :key="t.code" :label="t.name" :value="t.code">
                <div style="display:flex;align-items:center;gap:8px">
                  <span>{{ t.emoji }}</span>
                  <span>{{ t.name }}</span>
                  <span style="color:#9ca3af;font-size:12px">{{ t.code }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </template>
        <el-form-item label="通道名称" prop="channelName">
          <el-input v-model="configForm.channelName" placeholder="如：支付宝-主商户" />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="configForm.isDefault" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="configForm.remark" placeholder="可选" />
        </el-form-item>

        <el-divider content-position="left">
          <span style="font-size:13px;font-weight:600;color:var(--ep-text-secondary)">通道参数</span>
        </el-divider>

        <div v-if="configForm.configData && Object.keys(configForm.configData).length > 0" class="config-fields">
          <el-form-item v-for="(value, key) in configForm.configData" :key="key" :label="fieldLabels[key] || key">
            <el-input
              v-model="configForm.configData[key]"
              :type="isSecretKey(key) ? 'textarea' : 'text'"
              :rows="isSecretKey(key) ? 3 : 1"
              :placeholder="isSecretKey(key) ? '请输入密钥' : ''"
            />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getChannels, updateChannel, updateChannelStatus, createChannel, deleteChannel } from '../../api/channel'
import { formatDate } from '../../utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '../../components/PageContainer.vue'

const loading = ref(false)
const channels = ref([])
const dialogVisible = ref(false)
const saving = ref(false)
const isCreate = ref(false)
const currentChannel = ref(null)
const formRef = ref()

const query = ref({ name: '', status: null })
const configForm = ref({})
const formRules = {
  channelCode: [{ required: true, message: '请选择通道类型', trigger: 'change' }],
  channelName: [{ required: true, message: '请输入通道名称', trigger: 'blur' }],
}

const channelTypes = [
  { code: 'ALIPAY', name: '支付宝', emoji: '🔵', color: '#1677FF', bg: 'rgba(22, 119, 255, 0.1)' },
  { code: 'WECHAT', name: '微信支付', emoji: '🟢', color: '#07C160', bg: 'rgba(7, 193, 96, 0.1)' },
  { code: 'PAYPAL', name: 'PayPal', emoji: '🟡', color: '#003087', bg: 'rgba(0, 48, 135, 0.1)' },
]
const channelMeta = Object.fromEntries(channelTypes.map(t => [t.code, t]))
const nameMap = Object.fromEntries(channelTypes.map(t => [t.code, t.name]))

const fieldLabels = {
  appId: '应用ID (AppId)', privateKey: '应用私钥', publicKey: '支付宝公钥',
  gatewayUrl: '网关地址', notifyUrl: '异步通知地址', returnUrl: '同步跳转地址',
  signType: '签名类型', charset: '编码', format: '数据格式',
  mchId: '商户号 (MchId)', apiKey: 'API密钥', certPath: '证书路径',
  clientId: 'Client ID', clientSecret: 'Client Secret', mode: '运行模式',
}

const defaultConfigs = {
  ALIPAY: { appId: '', privateKey: '', publicKey: '', gatewayUrl: 'https://openapi.alipay.com/gateway.do', notifyUrl: '', returnUrl: '', signType: 'RSA2', charset: 'UTF-8', format: 'json' },
  WECHAT: { appId: '', mchId: '', apiKey: '', certPath: '', notifyUrl: '' },
  PAYPAL: { clientId: '', clientSecret: '', mode: 'sandbox' },
}

const filteredChannels = computed(() => {
  return channels.value.filter(c => {
    if (query.value.name && !c.channelName.includes(query.value.name)) return false
    if (query.value.status !== null && query.value.status !== '' && c.status !== query.value.status) return false
    return true
  })
})

onMounted(() => loadChannels())

async function loadChannels() {
  loading.value = true
  try {
    const res = await getChannels()
    channels.value = res.data || []
  } catch (e) {
    channels.value = []
  } finally {
    loading.value = false
  }
}

function resetQuery() { query.value = { name: '', status: null } }

function isSecretKey(key) {
  const k = key.toLowerCase()
  return k.includes('privatekey') || k.includes('apikey') || k.includes('secret') || k.includes('publickey')
}

function getChannelBg(code) {
  return (channelMeta[code] || {}).bg
}

function getChannelEmoji(code) {
  return (channelMeta[code] || {}).emoji
}

function getConfigCount(channel) {
  try {
    const d = typeof channel.configData === 'string' ? JSON.parse(channel.configData) : channel.configData
    return d ? Object.keys(d).length : 0
  } catch { return 0 }
}

function onChannelTypeChange(code) {
  configForm.value.channelName = nameMap[code] || code
  configForm.value.configData = { ...(defaultConfigs[code] || {}) }
}

function openCreate() {
  isCreate.value = true
  currentChannel.value = null
  configForm.value = { channelCode: '', channelName: '', isDefault: 0, remark: '', configData: {} }
  dialogVisible.value = true
}

function openConfig(channel) {
  isCreate.value = false
  currentChannel.value = channel
  let parsed = {}
  try {
    parsed = typeof channel.configData === 'string' ? JSON.parse(channel.configData) : (channel.configData || {})
  } catch (e) { parsed = {} }
  configForm.value = {
    channelCode: channel.channelCode,
    channelName: channel.channelName,
    isDefault: channel.isDefault,
    remark: channel.remark || '',
    configData: { ...parsed },
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value.validate()
  saving.value = true
  try {
    if (isCreate.value) {
      const code = configForm.value.channelCode
      if (!configForm.value.configData || Object.keys(configForm.value.configData).length === 0) {
        configForm.value.configData = { ...(defaultConfigs[code] || {}) }
      }
      await createChannel(configForm.value)
      ElMessage.success('新增成功')
    } else {
      await updateChannel(currentChannel.value.id, configForm.value)
      ElMessage.success('保存成功')
    }
    dialogVisible.value = false
    loadChannels()
  } finally {
    saving.value = false
  }
}

async function toggleStatus(channel) {
  await updateChannelStatus(channel.id, channel.status)
  ElMessage.success(channel.status === 1 ? '已启用' : '已禁用')
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除通道「${row.channelName}」？`, '提示', { type: 'warning' })
    await deleteChannel(row.id)
    ElMessage.success('已删除')
    loadChannels()
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

/* Channel Cards Grid */
.channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
}

.channel-card {
  background: var(--ep-bg-card);
  border: 1px solid var(--ep-border-light);
  border-radius: var(--ep-radius);
  box-shadow: var(--ep-shadow-sm);
  padding: 20px;
  transition: var(--ep-transition);
}

.channel-card:hover {
  box-shadow: var(--ep-shadow-md);
  border-color: rgba(var(--ep-primary-rgb), 0.2);
}

.channel-card.disabled {
  opacity: 0.65;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.channel-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.channel-emoji {
  font-size: 22px;
}

.channel-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--ep-text-primary);
  margin: 0;
}

.channel-code {
  font-size: 12px;
  color: var(--ep-text-placeholder);
  font-family: 'JetBrains Mono', monospace;
}

.channel-badges {
  display: flex;
  gap: 6px;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid var(--ep-border-light);
  border-bottom: 1px solid var(--ep-border-light);
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-label {
  font-size: 12px;
  color: var(--ep-text-placeholder);
}

.meta-value {
  font-size: 13px;
  color: var(--ep-text-secondary);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.config-fields {
  margin-top: 8px;
}

.empty-state {
  grid-column: 1 / -1;
  padding: 60px 0;
}
</style>
