<template>
  <div class="login-page">
    <!-- Background layers -->
    <div class="bg-base"></div>
    <div class="bg-noise"></div>
    <div class="bg-grid"></div>
    <div class="bg-orb bg-orb-1"></div>
    <div class="bg-orb bg-orb-2"></div>
    <div class="bg-scanline"></div>

    <!-- Main content -->
    <div class="main-container">
      <!-- Left: Brand Panel -->
      <div class="brand-panel">
        <div class="brand-content">
          <!-- Logo mark -->
          <div class="logo-mark">
            <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="54" height="54" rx="14" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
              <rect x="8" y="8" width="40" height="40" rx="10" fill="currentColor" opacity="0.08"/>
              <path d="M20 28L26 22L32 28L26 34L20 28Z" fill="currentColor" opacity="0.9"/>
              <path d="M26 28L32 22L38 28L32 34L26 28Z" fill="currentColor" opacity="0.5"/>
              <circle cx="26" cy="28" r="2" fill="currentColor"/>
            </svg>
          </div>

          <!-- Brand text -->
          <div class="brand-text">
            <h1 class="brand-title">
              <span class="title-line title-line-1">Easy</span>
              <span class="title-line title-line-2">Payment</span>
            </h1>
            <div class="brand-divider">
              <span class="divider-line"></span>
              <span class="divider-dot"></span>
              <span class="divider-line"></span>
            </div>
            <p class="brand-desc">
              为个人站点提供<br/>安全、快捷的收款能力
            </p>
          </div>

          <!-- Feature tags -->
          <div class="feature-tags">
            <span class="tag">
              <span class="tag-dot"></span>
              易支付协议
            </span>
            <span class="tag">
              <span class="tag-dot"></span>
              支付宝通道
            </span>
            <span class="tag">
              <span class="tag-dot"></span>
              即时到账
            </span>
          </div>

          <!-- Terminal decoration -->
          <div class="terminal-block">
            <div class="terminal-header">
              <span class="terminal-dot red"></span>
              <span class="terminal-dot yellow"></span>
              <span class="terminal-dot green"></span>
              <span class="terminal-title">api-request.sh</span>
            </div>
            <div class="terminal-body">
              <div class="terminal-line" style="animation-delay: 0.3s">
                <span class="t-prompt">$</span>
                <span class="t-cmd"> curl</span>
                <span class="t-flag"> -X</span>
                <span class="t-str"> POST</span>
              </div>
              <div class="terminal-line" style="animation-delay: 0.6s">
                <span class="t-arg">&nbsp;&nbsp;https://api.epay.com/pay</span>
              </div>
              <div class="terminal-line" style="animation-delay: 0.9s">
                <span class="t-flag">&nbsp;&nbsp;-d</span>
                <span class="t-str"> '{"pid":"1001","type":"alipay"}'</span>
              </div>
              <div class="terminal-line response" style="animation-delay: 1.4s">
                <span class="t-ok">✓</span>
                <span class="t-res"> 200 — 支付链接已生成</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Decorative corner -->
        <div class="corner-deco top-left"></div>
        <div class="corner-deco bottom-right"></div>
      </div>

      <!-- Right: Form Panel -->
      <div class="form-panel">
        <div class="form-wrapper" :class="{ 'fade-in-up': true }">
          <!-- Mobile logo (shown on small screens) -->
          <div class="mobile-logo">
            <span class="mobile-logo-text">EPay</span>
          </div>

          <!-- Role switcher -->
          <div class="role-switcher">
            <button
              class="role-btn"
              :class="{ active: loginRole === 'MERCHANT' }"
              @click="loginRole = 'MERCHANT'"
            >
              <span class="role-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 6L8 2L14 6V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V6Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                  <path d="M6 14V9H10V14" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                </svg>
              </span>
              商户
            </button>
            <button
              class="role-btn"
              :class="{ active: loginRole === 'ADMIN' }"
              @click="loginRole = 'ADMIN'"
            >
              <span class="role-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L10.5 4L14 4.5L11.5 7.5L12 11L8 9.5L4 11L4.5 7.5L2 4.5L5.5 4L8 1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                </svg>
              </span>
              管理员
            </button>
          </div>

          <!-- Form area -->
          <transition name="slide" mode="out-in">
            <div v-if="mode === 'login'" key="login" class="form-area">
              <div class="form-header">
                <h2 class="form-title">欢迎回来</h2>
                <p class="form-subtitle">
                  {{ loginRole === 'MERCHANT' ? '登录商户中心管理您的收款' : '登录管理后台管理平台' }}
                </p>
              </div>

              <el-form
                ref="loginFormRef"
                :model="loginForm"
                :rules="loginRules"
                @keyup.enter="handleLogin"
                class="login-form"
              >
                <el-form-item prop="username">
                  <el-input
                    v-model="loginForm.username"
                    placeholder="用户名"
                    size="large"
                  >
                    <template #prefix>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="6" r="3.5" stroke="currentColor" stroke-width="1.4"/>
                        <path d="M2.5 16C2.5 12.5 5.5 10 9 10C12.5 10 15.5 12.5 15.5 16" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                      </svg>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item prop="password">
                  <el-input
                    v-model="loginForm.password"
                    type="password"
                    placeholder="密码"
                    size="large"
                    show-password
                  >
                    <template #prefix>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="3" y="8" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.4"/>
                        <path d="M6 8V5C6 3.34315 7.34315 2 9 2C10.6569 2 12 3.34315 12 5V8" stroke="currentColor" stroke-width="1.4"/>
                        <circle cx="9" cy="12" r="1.5" fill="currentColor"/>
                      </svg>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item class="submit-item">
                  <el-button
                    :loading="loading"
                    class="submit-btn"
                    @click="handleLogin"
                  >
                    <span class="btn-text">{{ loading ? '正在验证...' : '进入系统' }}</span>
                    <span class="btn-arrow" v-if="!loading">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M4 9H14M14 9L10 5M14 9L10 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                  </el-button>
                </el-form-item>
              </el-form>

              <div class="form-footer">
                <button class="text-btn" @click="mode = 'forgot'">
                  忘记密码？
                </button>
              </div>
            </div>

            <!-- Reset Password -->
            <div v-else key="forgot" class="form-area">
              <div class="form-header">
                <button class="back-btn" @click="mode = 'login'">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  返回
                </button>
                <h2 class="form-title">重置密码</h2>
                <p class="form-subtitle">通过安全码验证后设置新密码</p>
              </div>

              <el-form
                ref="forgotFormRef"
                :model="forgotForm"
                :rules="forgotRules"
                @keyup.enter="handleReset"
                class="login-form"
              >
                <el-form-item prop="username">
                  <el-input v-model="forgotForm.username" placeholder="用户名" size="large">
                    <template #prefix>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="6" r="3.5" stroke="currentColor" stroke-width="1.4"/>
                        <path d="M2.5 16C2.5 12.5 5.5 10 9 10C12.5 10 15.5 12.5 15.5 16" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                      </svg>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item prop="securityCode">
                  <el-input v-model="forgotForm.securityCode" placeholder="安全码" size="large">
                    <template #prefix>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M9 2L3 6V12L9 16L15 12V6L9 2Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
                        <path d="M9 8V11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                        <circle cx="9" cy="6" r="1" fill="currentColor"/>
                      </svg>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item prop="newPassword">
                  <el-input v-model="forgotForm.newPassword" type="password" placeholder="新密码" size="large" show-password>
                    <template #prefix>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="3" y="8" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.4"/>
                        <path d="M6 8V5C6 3.34315 7.34315 2 9 2C10.6569 2 12 3.34315 12 5V8" stroke="currentColor" stroke-width="1.4"/>
                      </svg>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item prop="confirmPassword">
                  <el-input v-model="forgotForm.confirmPassword" type="password" placeholder="确认新密码" size="large" show-password>
                    <template #prefix>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="3" y="8" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.4"/>
                        <path d="M6 8V5C6 3.34315 7.34315 2 9 2C10.6569 2 12 3.34315 12 5V8" stroke="currentColor" stroke-width="1.4"/>
                        <path d="M7 12L9 14L11 12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item class="submit-item">
                  <el-button :loading="loading" class="submit-btn" @click="handleReset">
                    <span class="btn-text">{{ loading ? '提交中...' : '重置密码' }}</span>
                    <span class="btn-arrow" v-if="!loading">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M4 9H14M14 9L10 5M14 9L10 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </transition>

          <!-- Footer -->
          <div class="form-bottom">
            <span class="copyright">EPay &copy; {{ new Date().getFullYear() }}</span>
            <span class="version">v1.0</span>
          </div>
        </div>
      </div>
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
/* ===== Variables ===== */
.login-page {
  --amber: #d4973b;
  --amber-light: #e8b35a;
  --amber-glow: rgba(212, 151, 59, 0.15);
  --amber-glow-strong: rgba(212, 151, 59, 0.3);
  --bg-deep: #0a0a0c;
  --bg-surface: #111114;
  --bg-card: #16161a;
  --bg-input: #1a1a1f;
  --border: rgba(255, 255, 255, 0.06);
  --border-focus: rgba(212, 151, 59, 0.4);
  --text-primary: #e8e4dc;
  --text-secondary: rgba(232, 228, 220, 0.5);
  --text-muted: rgba(232, 228, 220, 0.25);
}

/* ===== Page ===== */
.login-page {
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
}

/* ===== Backgrounds ===== */
.bg-base {
  position: absolute;
  inset: 0;
  background: var(--bg-deep);
}

.bg-noise {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  background-size: 200px;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 32px 32px;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
}

.bg-orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(212, 151, 59, 0.12), transparent 70%);
  top: -200px;
  right: -100px;
  animation: orbFloat 20s ease-in-out infinite;
}

.bg-orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(212, 151, 59, 0.06), transparent 70%);
  bottom: -150px;
  left: 20%;
  animation: orbFloat 25s ease-in-out infinite reverse;
}

.bg-scanline {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.03) 2px,
    rgba(0,0,0,0.03) 4px
  );
  pointer-events: none;
}

/* ===== Main Container ===== */
.main-container {
  position: relative;
  z-index: 10;
  display: flex;
  height: 100%;
}

/* ===== Brand Panel (Left) ===== */
.brand-panel {
  flex: 0 0 45%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 60px;
  border-right: 1px solid var(--border);
}

.brand-content {
  max-width: 440px;
  width: 100%;
}

.logo-mark {
  width: 56px;
  height: 56px;
  color: var(--amber);
  margin-bottom: 48px;
  animation: fadeIn 0.8s ease both;
}

.brand-title {
  margin: 0;
  line-height: 1;
}

.title-line {
  display: block;
  font-family: 'DM Serif Display', Georgia, serif;
  color: var(--text-primary);
  animation: slideUp 0.8s ease both;
}

.title-line-1 {
  font-size: 64px;
  letter-spacing: -2px;
  animation-delay: 0.1s;
}

.title-line-2 {
  font-size: 64px;
  letter-spacing: -2px;
  color: var(--amber);
  animation-delay: 0.2s;
}

.brand-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 32px 0;
  animation: fadeIn 0.8s ease 0.3s both;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--amber-glow-strong), transparent);
}

.divider-line:last-child {
  background: linear-gradient(90deg, transparent, var(--amber-glow-strong));
}

.divider-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--amber);
  box-shadow: 0 0 12px var(--amber-glow-strong);
}

.brand-desc {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-secondary);
  margin: 0;
  animation: slideUp 0.8s ease 0.4s both;
}

/* Feature tags */
.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 40px;
  animation: slideUp 0.8s ease 0.5s both;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(212, 151, 59, 0.06);
  border: 1px solid rgba(212, 151, 59, 0.12);
  border-radius: 8px;
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  color: var(--amber-light);
  letter-spacing: 0.5px;
}

.tag-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--amber);
  animation: pulse 2s ease-in-out infinite;
}

.tag:nth-child(2) .tag-dot { animation-delay: 0.3s; }
.tag:nth-child(3) .tag-dot { animation-delay: 0.6s; }

/* Terminal decoration */
.terminal-block {
  margin-top: 48px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  overflow: hidden;
  animation: slideUp 0.8s ease 0.6s both;
}

.terminal-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.terminal-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.terminal-dot.red { background: #ff5f57; }
.terminal-dot.yellow { background: #febc2e; }
.terminal-dot.green { background: #28c840; }

.terminal-title {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  color: var(--text-muted);
  margin-left: 8px;
}

.terminal-body {
  padding: 14px 16px;
}

.terminal-line {
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  line-height: 2;
  animation: typeIn 0.4s ease both;
}

.t-prompt { color: var(--amber); }
.t-cmd { color: #e8e4dc; }
.t-flag { color: #6b9bd2; }
.t-str { color: #7ec699; }
.t-arg { color: var(--text-secondary); }
.t-ok { color: #28c840; }
.t-res { color: #28c840; opacity: 0.8; }

.terminal-line.response {
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px dashed rgba(255,255,255,0.06);
}

/* Corner decorations */
.corner-deco {
  position: absolute;
  width: 24px;
  height: 24px;
}

.corner-deco.top-left {
  top: 24px;
  left: 24px;
  border-top: 1px solid var(--amber-glow-strong);
  border-left: 1px solid var(--amber-glow-strong);
}

.corner-deco.bottom-right {
  bottom: 24px;
  right: 24px;
  border-bottom: 1px solid var(--amber-glow-strong);
  border-right: 1px solid var(--amber-glow-strong);
}

/* ===== Form Panel (Right) ===== */
.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.form-wrapper {
  width: 100%;
  max-width: 380px;
}

.mobile-logo {
  display: none;
  margin-bottom: 32px;
}

.mobile-logo-text {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 28px;
  color: var(--amber);
}

/* Role switcher */
.role-switcher {
  display: flex;
  gap: 8px;
  margin-bottom: 40px;
}

.role-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: transparent;
  color: var(--text-secondary);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.role-btn:hover {
  border-color: rgba(255, 255, 255, 0.12);
  color: var(--text-primary);
}

.role-btn.active {
  border-color: var(--amber);
  background: var(--amber-glow);
  color: var(--amber-light);
  box-shadow: 0 0 20px rgba(212, 151, 59, 0.08);
}

.role-icon {
  display: flex;
  align-items: center;
}

/* Form area */
.form-area {
  min-height: 300px;
}

.form-header {
  margin-bottom: 32px;
}

.form-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.form-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 20px;
  transition: color 0.2s;
}

.back-btn:hover {
  color: var(--amber-light);
}

/* Form */
.login-form {
  margin-top: 0;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.el-input__wrapper) {
  background: var(--bg-input) !important;
  border: 1px solid var(--border) !important;
  box-shadow: none !important;
  border-radius: 10px !important;
  height: 48px !important;
  padding: 0 16px !important;
  transition: all 0.25s ease !important;
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--border-focus) !important;
  box-shadow: 0 0 0 3px var(--amber-glow) !important;
}

.login-form :deep(.el-input__inner) {
  color: var(--text-primary) !important;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
}

.login-form :deep(.el-input__inner::placeholder) {
  color: var(--text-muted) !important;
}

.login-form :deep(.el-input__prefix) {
  color: var(--text-muted) !important;
  margin-right: 10px;
}

.login-form :deep(.el-input__prefix .el-icon),
.login-form :deep(.el-input__prefix svg) {
  color: var(--text-muted);
}

.login-form :deep(.el-input__suffix .el-icon) {
  color: var(--text-muted) !important;
}

.login-form :deep(.el-form-item__error) {
  font-size: 12px;
  padding-top: 4px;
}

/* Submit button */
.submit-item {
  margin-top: 28px !important;
  margin-bottom: 0 !important;
}

.submit-btn {
  width: 100%;
  height: 50px !important;
  border: none !important;
  border-radius: 10px !important;
  background: linear-gradient(135deg, var(--amber), #c4852a) !important;
  color: #0a0a0c !important;
  font-family: 'DM Sans', sans-serif !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  letter-spacing: 0.5px !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(212, 151, 59, 0.25) !important;
  transition: all 0.3s ease !important;
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent, rgba(255,255,255,0.15), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.submit-btn:hover::before {
  transform: translateX(100%);
}

.submit-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 8px 30px rgba(212, 151, 59, 0.35) !important;
}

.submit-btn:active {
  transform: translateY(0) !important;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.btn-arrow {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
  transition: transform 0.2s ease;
}

.submit-btn:hover .btn-arrow {
  transform: translateX(3px);
}

/* Footer */
.form-footer {
  text-align: center;
  margin-top: 20px;
}

.text-btn {
  border: none;
  background: none;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s;
  font-family: 'DM Sans', sans-serif;
}

.text-btn:hover {
  color: var(--amber-light);
}

.form-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 60px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.copyright {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

.version {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  color: var(--text-muted);
  padding: 3px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
}

/* ===== Animations ===== */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes typeIn {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(30px, -20px); }
  66% { transform: translate(-20px, 15px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Form transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-in-up {
  animation: slideUp 0.6s ease both;
}

/* ===== Responsive ===== */
@media (max-width: 900px) {
  .brand-panel {
    display: none;
  }

  .form-panel {
    padding: 24px;
  }

  .mobile-logo {
    display: block;
  }

  .bg-orb-1 {
    top: -200px;
    right: -200px;
  }
}

@media (max-width: 480px) {
  .form-wrapper {
    max-width: 100%;
  }

  .role-btn {
    height: 40px;
    font-size: 13px;
  }

  .form-title {
    font-size: 22px;
  }
}
</style>
