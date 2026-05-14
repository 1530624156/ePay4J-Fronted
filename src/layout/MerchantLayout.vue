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
            <span class="logo-badge merchant">商户</span>
          </div>
        </transition>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div class="sidebar-menu">
          <div
            v-for="item in menuItems"
            :key="item.path"
            class="menu-item"
            :class="{ active: $route.path === item.path }"
            @click="$router.push(item.path)"
          >
            <div class="menu-item-icon">
              <el-icon :size="20"><component :is="item.icon" /></el-icon>
            </div>
            <transition name="text-fade">
              <span v-if="!collapse" class="menu-item-text">{{ item.label }}</span>
            </transition>
            <div v-if="$route.path === item.path && !collapse" class="menu-item-indicator"></div>
          </div>
        </div>
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
            <el-breadcrumb-item :to="{ path: '/merchant/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="$route.meta.title">{{ $route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- User dropdown -->
          <el-dropdown @command="handleCommand" trigger="click">
            <div class="user-trigger">
              <el-avatar :size="34" class="user-avatar">
                {{ (userStore.nickname || 'M').charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-meta">
                <span class="user-name">{{ userStore.nickname || '商户' }}</span>
                <span class="user-role">{{ userStore.merchantName || '' }}</span>
              </div>
              <el-icon class="user-arrow"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
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
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/modules/user'
import { logout } from '../api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)

onMounted(() => {
  userStore.fetchMerchantInfo()
})

const menuItems = [
  { path: '/merchant/dashboard', icon: 'DataLine', label: '工作台' },
  { path: '/merchant/orders', icon: 'Document', label: '订单管理' },
  { path: '/merchant/withdraw', icon: 'Wallet', label: '提现管理' },
  { path: '/merchant/settings', icon: 'Setting', label: '账户设置' },
]

function handleCommand(command) {
  if (command === 'logout') {
    try { logout() } catch { /* ignore */ }
    userStore.clearLogin()
    router.push('/login')
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;
}

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

.logo-badge.merchant {
  color: #6ee7b7;
  background: rgba(52, 211, 153, 0.15);
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

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

/* Sidebar menu */
.sidebar-menu {
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  color: var(--ep-sidebar-text);
  margin: 0 4px;
}

.menu-item:hover {
  background: var(--ep-sidebar-hover);
  color: var(--ep-sidebar-text-active);
}

.menu-item.active {
  background: var(--ep-sidebar-active-bg);
  color: #ffffff;
}

.menu-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.menu-item-text {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
}

.menu-item-indicator {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--ep-primary);
  border-radius: 3px 0 0 3px;
}

.main-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

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
  background: linear-gradient(135deg, #34d399, #059669) !important;
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

.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  background: var(--ep-bg-page);
}

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

.text-fade-enter-active,
.text-fade-leave-active {
  transition: opacity 0.2s ease;
}

.text-fade-enter-from,
.text-fade-leave-to {
  opacity: 0;
}
</style>
