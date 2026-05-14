<template>
  <el-container class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: isCollapse }">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-mark" :class="{ small: isCollapse }">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="rgba(99,102,241,0.2)"/>
            <path d="M10 16L14 12L18 16L14 20L10 16Z" fill="#818cf8"/>
            <path d="M14 16L18 12L22 16L18 20L14 16Z" fill="#6366f1"/>
          </svg>
        </div>
        <transition name="fade">
          <div v-if="!isCollapse" class="logo-text">
            <span class="logo-name">EPay</span>
            <span class="logo-badge">Admin</span>
          </div>
        </transition>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <sidebar :collapse="isCollapse" />
      </nav>

      <!-- Collapse toggle -->
      <div class="sidebar-footer">
        <div class="collapse-btn" @click="isCollapse = !isCollapse">
          <el-icon :size="16">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <transition name="fade">
            <span v-if="!isCollapse" class="collapse-text">收起菜单</span>
          </transition>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <el-container class="main-container">
      <!-- Header -->
      <header class="app-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="$route.meta.title">{{ $route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- Status dot -->
          <div class="status-badge">
            <span class="status-dot"></span>
            <span class="status-text">运行中</span>
          </div>

          <!-- User dropdown -->
          <el-dropdown @command="handleCommand" trigger="click">
            <div class="user-trigger">
              <el-avatar :size="34" class="user-avatar">
                {{ (userStore.nickname || userStore.username || 'A').charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-meta">
                <span class="user-name">{{ userStore.nickname || userStore.username || '管理员' }}</span>
                <span class="user-role">{{ roleLabel }}</span>
              </div>
              <el-icon class="user-arrow"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="changePwd">
                  <el-icon><Key /></el-icon>修改密码
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- Content -->
      <main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </el-container>

    <!-- Change password dialog -->
    <el-dialog v-model="pwdVisible" title="修改密码" width="440px" :close-on-click-modal="false">
      <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="90px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="pwdForm.oldPassword" type="password" show-password placeholder="请输入原密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="至少6位" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="pwdForm.confirmPassword" type="password" show-password placeholder="再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdVisible = false">取消</el-button>
        <el-button type="primary" :loading="pwdLoading" @click="handleChangePwd">确认修改</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/modules/user'
import { logout, changePassword } from '../api/auth'
import { ElMessage } from 'element-plus'
import Sidebar from './Sidebar.vue'

const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)

const roleLabel = computed(() => {
  const map = { SUPER_ADMIN: '超级管理员', ADMIN: '管理员', VIEWER: '观察者' }
  return map[userStore.role] || '管理员'
})

// Password dialog
const pwdVisible = ref(false)
const pwdLoading = ref(false)
const pwdFormRef = ref()
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

function handleCommand(command) {
  if (command === 'logout') {
    try { logout() } catch { /* ignore */ }
    userStore.clearLogin()
    router.push('/login')
  } else if (command === 'changePwd') {
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
    pwdVisible.value = true
  }
}

async function handleChangePwd() {
  await pwdFormRef.value.validate()
  pwdLoading.value = true
  try {
    await changePassword({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword })
    ElMessage.success('密码修改成功，请重新登录')
    pwdVisible.value = false
    userStore.clearLogin()
    router.push('/login')
  } finally {
    pwdLoading.value = false
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;
}

/* ===== Sidebar ===== */
.sidebar {
  width: var(--ep-sidebar-width);
  background: var(--ep-sidebar-bg);
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar.collapsed {
  width: var(--ep-sidebar-collapsed-width);
}

/* Logo */
.sidebar-logo {
  height: var(--ep-header-height);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.sidebar.collapsed .sidebar-logo {
  justify-content: center;
  padding: 0;
}

.logo-mark {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.logo-mark.small {
  width: 32px;
  height: 32px;
}

.logo-mark svg {
  width: 100%;
  height: 100%;
}

.logo-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-name {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.3px;
}

.logo-badge {
  font-size: 10px;
  font-weight: 600;
  color: var(--ep-primary-light);
  background: rgba(99, 102, 241, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Footer */
.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.collapse-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--ep-sidebar-text);
  transition: all 0.2s;
}

.collapse-btn:hover {
  background: var(--ep-sidebar-hover);
  color: var(--ep-sidebar-text-active);
}

.sidebar.collapsed .collapse-btn {
  justify-content: center;
  padding: 8px;
}

.collapse-text {
  font-size: 12px;
}

/* ===== Main Container ===== */
.main-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ===== Header ===== */
.app-header {
  height: var(--ep-header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: var(--ep-bg-card);
  border-bottom: 1px solid var(--ep-border-light);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* Status badge */
.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: var(--ep-success-bg);
  border-radius: 20px;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: var(--ep-success);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.status-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--ep-success);
}

/* User trigger */
.user-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 8px 4px 4px;
  border-radius: 10px;
  transition: background 0.2s;
}

.user-trigger:hover {
  background: var(--ep-bg-hover);
}

.user-avatar {
  background: linear-gradient(135deg, var(--ep-primary), var(--ep-primary-light)) !important;
  color: white !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  flex-shrink: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ep-text-primary);
}

.user-role {
  font-size: 11px;
  color: var(--ep-text-placeholder);
}

.user-arrow {
  color: var(--ep-text-placeholder);
  font-size: 12px;
}

/* ===== Main Content ===== */
.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  background: var(--ep-bg-page);
}

/* ===== Transitions ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.page-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
