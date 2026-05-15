<template>
  <PageContainer title="账户设置" desc="维护您的账户信息">
    <div class="settings-card">
      <el-tabs v-model="activeTab">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="info">
          <el-form ref="infoFormRef" :model="infoForm" :rules="infoRules" label-width="100px" style="max-width:500px;margin-top:20px">
            <el-form-item label="商户名称" prop="name">
              <el-input v-model="infoForm.name" disabled />
            </el-form-item>
            <el-form-item label="姓名" prop="nickName">
              <el-input v-model="infoForm.nickName" placeholder="请输入姓名" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="infoForm.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="支付宝账号" prop="alipayAccount">
              <el-input v-model="infoForm.alipayAccount" placeholder="请输入支付宝账号" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="infoLoading" @click="handleSaveInfo">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 修改密码 -->
        <el-tab-pane label="修改密码" name="password">
          <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="100px" style="max-width:500px;margin-top:20px">
            <el-form-item label="原密码" prop="oldPassword">
              <el-input v-model="pwdForm.oldPassword" type="password" show-password placeholder="请输入原密码" />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="请输入新密码" />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="pwdForm.confirmPassword" type="password" show-password placeholder="再次输入新密码" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="pwdLoading" @click="handleChangePwd">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '../../store/modules/user'
import { updateMerchantInfo, updateMerchantPassword, getMerchantInfo } from '../../api/auth'
import { ElMessage } from 'element-plus'
import PageContainer from '../../components/PageContainer.vue'

const userStore = useUserStore()
const activeTab = ref('info')

// Info form
const infoFormRef = ref()
const infoLoading = ref(false)
const infoForm = reactive({
  name: '',
  nickName: '',
  phone: '',
  alipayAccount: '',
})
const infoRules = {
  nickName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
}

// Password form
const pwdFormRef = ref()
const pwdLoading = ref(false)
const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const pwdRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== pwdForm.newPassword) callback(new Error('两次密码不一致'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
}

onMounted(() => loadInfo())

async function loadInfo() {
  try {
    const res = await getMerchantInfo()
    const data = res.data
    infoForm.name = data.name || ''
    infoForm.nickName = data.nickName || ''
    infoForm.phone = data.phone || ''
    infoForm.alipayAccount = data.alipayAccount || ''
  } catch { /* ignore */ }
}

async function handleSaveInfo() {
  await infoFormRef.value.validate()
  infoLoading.value = true
  try {
    await updateMerchantInfo({
      alipayAccount: infoForm.alipayAccount,
      nickName: infoForm.nickName,
      phone: infoForm.phone,
    })
    ElMessage.success('保存成功')
    userStore.fetchMerchantInfo()
  } catch { /* ignore */ } finally {
    infoLoading.value = false
  }
}

async function handleChangePwd() {
  await pwdFormRef.value.validate()
  pwdLoading.value = true
  try {
    await updateMerchantPassword({
      oldPassword: pwdForm.oldPassword,
      newPassword: pwdForm.newPassword,
    })
    ElMessage.success('密码修改成功')
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
  } catch { /* ignore */ } finally {
    pwdLoading.value = false
  }
}
</script>

<style scoped>
.settings-card {
  background: #18181c;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
}

/* Tabs dark overrides */
.settings-card :deep(.el-tabs__nav-wrap::after) {
  background: rgba(255, 255, 255, 0.06);
}

.settings-card :deep(.el-tabs__item) {
  color: rgba(240, 236, 228, 0.45);
  font-weight: 500;
}

.settings-card :deep(.el-tabs__item:hover) {
  color: rgba(240, 236, 228, 0.7);
}

.settings-card :deep(.el-tabs__item.is-active) {
  color: #edc068;
}

.settings-card :deep(.el-tabs__active-bar) {
  background: #d4973b;
}

/* Form input dark overrides */
.settings-card :deep(.el-input__wrapper),
.settings-card :deep(.el-textarea__inner) {
  background: #1f1f25 !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: none !important;
  color: #f0ece4;
  border-radius: 8px;
}

.settings-card :deep(.el-input__wrapper:hover),
.settings-card :deep(.el-textarea__inner:hover) {
  border-color: rgba(255, 255, 255, 0.18) !important;
}

.settings-card :deep(.el-input__wrapper.is-focus),
.settings-card :deep(.el-textarea__inner:focus) {
  border-color: rgba(212, 151, 59, 0.5) !important;
  box-shadow: 0 0 0 2px rgba(212, 151, 59, 0.1) !important;
}

.settings-card :deep(.el-input__inner) {
  color: #f0ece4;
}

.settings-card :deep(.el-input__inner::placeholder) {
  color: rgba(240, 236, 228, 0.3);
}

.settings-card :deep(.el-input.is-disabled .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.04) !important;
  border-color: rgba(255, 255, 255, 0.06) !important;
}

.settings-card :deep(.el-input.is-disabled .el-input__inner) {
  color: rgba(240, 236, 228, 0.35);
}

/* Form label dark overrides */
.settings-card :deep(.el-form-item__label) {
  color: rgba(240, 236, 228, 0.65);
}

/* Button dark overrides */
.settings-card :deep(.el-button--primary) {
  --el-button-bg-color: #d4973b;
  --el-button-border-color: #d4973b;
  --el-button-hover-bg-color: #e0a54e;
  --el-button-hover-border-color: #e0a54e;
  --el-button-active-bg-color: #c4852a;
  --el-button-active-border-color: #c4852a;
}

/* Password visibility icon */
.settings-card :deep(.el-input__suffix) {
  color: rgba(240, 236, 228, 0.4);
}

.settings-card :deep(.el-input__suffix:hover) {
  color: rgba(240, 236, 228, 0.65);
}

/* Form error message */
.settings-card :deep(.el-form-item__error) {
  color: #f87171;
}

/* Global dark popups */
:global(.el-select__popper),
:global(.el-picker-panel),
:global(.el-select-dropdown) {
  background: #1a1a1f !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:global(.el-select-dropdown__item) {
  color: rgba(240, 236, 228, 0.7) !important;
}

:global(.el-select-dropdown__item:hover),
:global(.el-select-dropdown__item.hover) {
  background: rgba(255, 255, 255, 0.06) !important;
}

:global(.el-select-dropdown__item.is-selected) {
  color: #edc068 !important;
  font-weight: 600;
}

/* Message toast dark */
:global(.el-message) {
  --el-message-bg-color: #1e1e23;
  --el-message-border-color: rgba(255, 255, 255, 0.1);
  --el-message-text-color: #f0ece4;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

:global(.el-message--success) {
  --el-message-border-color: rgba(34, 197, 94, 0.3);
}

:global(.el-message--error) {
  --el-message-border-color: rgba(239, 68, 68, 0.3);
}

:global(.el-message--warning) {
  --el-message-border-color: rgba(234, 179, 8, 0.3);
}

/* Overlay */
:global(.el-overlay) {
  background: rgba(0, 0, 0, 0.6) !important;
}

/* Message box dark */
:global(.el-message-box) {
  --el-messagebox-title-color: #f0ece4;
  --el-messagebox-content-color: rgba(240, 236, 228, 0.7);
  background: #18181c !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px;
}

:global(.el-message-box__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

:global(.el-message-box__headerbtn .el-message-box__close) {
  color: rgba(240, 236, 228, 0.5);
}

:global(.el-message-box__btns .el-button--primary) {
  --el-button-bg-color: #d4973b;
  --el-button-border-color: #d4973b;
  --el-button-hover-bg-color: #e0a54e;
  --el-button-hover-border-color: #e0a54e;
}

:global(.el-message-box__btns .el-button--default) {
  --el-button-bg-color: rgba(255, 255, 255, 0.06);
  --el-button-border-color: rgba(255, 255, 255, 0.1);
  --el-button-text-color: rgba(240, 236, 228, 0.7);
}
</style>
