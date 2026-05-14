<template>
  <div class="login-page">
    <!-- Animated Background -->
    <div class="bg-gradient"></div>
    <div class="bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>
    <div class="bg-grid"></div>

    <!-- Login Card -->
    <div class="login-wrapper fade-in-up">
      <!-- Brand -->
      <div class="brand">
        <div class="brand-icon">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="12" fill="white" fill-opacity="0.2"/>
            <path d="M12 20L18 14L24 20L18 26L12 20Z" fill="white" fill-opacity="0.9"/>
            <path d="M18 20L24 14L30 20L24 26L18 20Z" fill="white" fill-opacity="0.6"/>
          </svg>
        </div>
        <h1 class="brand-title">EPay</h1>
        <p class="brand-subtitle">支付管理后台</p>
      </div>

      <!-- Login Form -->
      <div class="login-card">
        <!-- Role Tabs -->
        <div class="role-tabs">
          <button
            class="role-tab"
            :class="{ active: loginRole === 'MERCHANT' }"
            @click="loginRole = 'MERCHANT'"
          >商户登录</button>
          <button
            class="role-tab"
            :class="{ active: loginRole === 'ADMIN' }"
            @click="loginRole = 'ADMIN'"
          >管理登录</button>
        </div>

        <transition name="fade" mode="out-in">
          <div v-if="mode === 'login'" key="login">
            <h2 class="card-title">{{ loginRole === 'MERCHANT' ? '商户登录' : '管理登录' }}</h2>
            <p class="card-desc">{{ loginRole === 'MERCHANT' ? '欢迎回来，请输入您的账号信息' : '请输入管理员账号信息' }}</p>

            <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" @keyup.enter="handleLogin" style="margin-top:28px">
              <el-form-item prop="username">
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入用户名"
                  prefix-icon="User"
                  size="large"
                  style="height:48px"
                />
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  prefix-icon="Lock"
                  size="large"
                  show-password
                  style="height:48px"
                />
              </el-form-item>
              <el-form-item style="margin-top:32px">
                <el-button
                  type="primary"
                  :loading="loading"
                  class="login-btn"
                  @click="handleLogin"
                >
                  {{ loading ? '登录中...' : '登 录' }}
                </el-button>
              </el-form-item>
            </el-form>

            <div class="login-footer">
              <el-button type="primary" link @click="mode = 'forgot'" style="color:rgba(255,255,255,0.6)">
                忘记密码？
              </el-button>
            </div>
          </div>

          <!-- Reset Password -->
          <div v-else key="forgot">
            <h2 class="card-title">重置密码</h2>
            <p class="card-desc">通过安全码验证身份后重置密码</p>

            <el-form ref="forgotFormRef" :model="forgotForm" :rules="forgotRules" @keyup.enter="handleReset" style="margin-top:28px">
              <el-form-item prop="username">
                <el-input
                  v-model="forgotForm.username"
                  placeholder="请输入用户名"
                  prefix-icon="User"
                  size="large"
                  style="height:48px"
                />
              </el-form-item>
              <el-form-item prop="securityCode">
                <el-input
                  v-model="forgotForm.securityCode"
                  placeholder="安全码"
                  prefix-icon="Key"
                  size="large"
                  style="height:48px"
                />
              </el-form-item>
              <el-form-item prop="newPassword">
                <el-input
                  v-model="forgotForm.newPassword"
                  type="password"
                  placeholder="新密码"
                  prefix-icon="Lock"
                  size="large"
                  show-password
                  style="height:48px"
                />
              </el-form-item>
              <el-form-item prop="confirmPassword">
                <el-input
                  v-model="forgotForm.confirmPassword"
                  type="password"
                  placeholder="确认新密码"
                  prefix-icon="Lock"
                  size="large"
                  show-password
                  style="height:48px"
                />
              </el-form-item>
              <el-form-item style="margin-top:32px">
                <el-button
                  type="primary"
                  :loading="loading"
                  class="login-btn"
                  @click="handleReset"
                >
                  {{ loading ? '提交中...' : '重置密码' }}
                </el-button>
              </el-form-item>
            </el-form>

            <div class="login-footer">
              <el-button type="primary" link @click="mode = 'login'" style="color:rgba(255,255,255,0.6)">
                <el-icon style="margin-right:4px"><ArrowLeft /></el-icon>
                返回登录
              </el-button>
            </div>
          </div>
        </transition>
      </div>

      <!-- Footer -->
      <p class="copyright">Powered by EPay &copy; {{ new Date().getFullYear() }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store/modules/user'
import { login, merchantLogin, resetPassword } from '../../api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const mode = ref('login')
const loginRole = ref('MERCHANT')

const loginFormRef = ref()
const forgotFormRef = ref()

const loginForm = reactive({ username: '', password: '' })
const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const forgotForm = reactive({ username: '', securityCode: '', newPassword: '', confirmPassword: '' })
const forgotRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  securityCode: [{ required: true, message: '请输入安全码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== forgotForm.newPassword) callback(new Error('两次密码不一致'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
}

async function handleLogin() {
  await loginFormRef.value.validate()
  loading.value = true
  try {
    const res = loginRole.value === 'ADMIN'
      ? await login(loginForm)
      : await merchantLogin(loginForm)
    userStore.setLogin(res.data)
    ElMessage.success('登录成功')
    router.push(res.data.role === 'MERCHANT' ? '/merchant/dashboard' : '/admin/dashboard')
  } finally {
    loading.value = false
  }
}

async function handleReset() {
  await forgotFormRef.value.validate()
  loading.value = true
  try {
    await resetPassword({
      username: forgotForm.username,
      securityCode: forgotForm.securityCode,
      newPassword: forgotForm.newPassword,
    })
    ElMessage.success('密码重置成功，请登录')
    mode.value = 'login'
    loginForm.username = forgotForm.username
    loginForm.password = ''
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Animated gradient background */
.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0a0f1e 0%, #0f1729 25%, #111827 50%, #0f1729 75%, #0a0f1e 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Floating shapes */
.bg-shapes {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.15;
}

.shape-1 {
  width: 600px;
  height: 600px;
  background: #3b82f6;
  top: -15%;
  right: -10%;
  animation: float 25s ease-in-out infinite;
}

.shape-2 {
  width: 500px;
  height: 500px;
  background: #06b6d4;
  bottom: -15%;
  left: -10%;
  animation: float 30s ease-in-out infinite reverse;
}

.shape-3 {
  width: 400px;
  height: 400px;
  background: #8b5cf6;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 20s ease-in-out infinite 2s;
}

/* Grid pattern */
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 80px 80px;
}

/* Login wrapper */
.login-wrapper {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
  padding: 0 20px;
}

/* Brand */
.brand {
  text-align: center;
  margin-bottom: 28px;
}

.brand-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto 14px;
}

.brand-icon svg {
  width: 100%;
  height: 100%;
}

.brand-title {
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.5px;
  margin: 0;
}

.brand-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin: 6px 0 0;
  letter-spacing: 3px;
  text-transform: uppercase;
}

/* Login card - refined glassmorphism */
.login-card {
  width: 100%;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* Role Tabs */
.role-tabs {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 28px;
}

.role-tab {
  flex: 1;
  height: 38px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  color: rgba(255, 255, 255, 0.5);
  background: transparent;
}

.role-tab.active {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
}

.role-tab:not(.active):hover {
  color: rgba(255, 255, 255, 0.85);
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.card-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin: 6px 0 0;
}

/* Override input styles for dark theme */
.login-card :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: none !important;
  border-radius: 12px !important;
  padding: 0 16px !important;
}

.login-card :deep(.el-input__wrapper:hover) {
  border-color: rgba(59, 130, 246, 0.4) !important;
}

.login-card :deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12) !important;
}

.login-card :deep(.el-input__inner) {
  color: #ffffff !important;
  font-size: 14px;
}

.login-card :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.3) !important;
}

.login-card :deep(.el-input__prefix .el-icon) {
  color: rgba(255, 255, 255, 0.35) !important;
}

.login-card :deep(.el-input__suffix .el-icon) {
  color: rgba(255, 255, 255, 0.35) !important;
}

.login-card :deep(.el-form-item__error) {
  color: #f87171 !important;
}

/* Login button */
.login-btn {
  width: 100%;
  height: 48px !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  letter-spacing: 1px !important;
  border-radius: 12px !important;
  background: linear-gradient(135deg, #3b82f6, #6366f1) !important;
  border: none !important;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3) !important;
  transition: all 0.25s ease !important;
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.4) !important;
}

.login-btn:active {
  transform: translateY(0);
}

.login-footer {
  text-align: center;
  margin-top: 4px;
}

.copyright {
  color: rgba(255, 255, 255, 0.15);
  font-size: 12px;
  margin-top: 28px;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
</style>
