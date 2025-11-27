<template>
  <div class="dashboard-layout">
    <StaticIcons />
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="sidebar-content">
        <!-- User Profile Section -->
        <div class="user-profile">
          <div class="avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="user-info">
            <h3>{{ userName }}</h3>
            <p>{{ userRole }}</p>
          </div>
          <button
            @click="openSettings"
            class="settings-button"
            aria-label="Configurações"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2.18l.2 1.83a2 2 0 0 1-.26 1.31l-.24.4a2 2 0 0 1-1.1.81l-1.8.45a2 2 0 0 0-1.49 2.43l.22.88a2 2 0 0 0 2.43 1.49l1.8-.45a2 2 0 0 1 1.31.26l.4.24a2 2 0 0 1 .81 1.1l.45 1.8a2 2 0 0 0 2.43 1.49l.88-.22a2 2 0 0 0 1.49-2.43l-.45-1.8a2 2 0 0 1 .26-1.31l.24-.4a2 2 0 0 1 1.1-.81l1.8-.45a2 2 0 0 0 1.49-2.43l-.22-.88a2 2 0 0 0-2.43-1.49l-1.8.45a2 2 0 0 1-1.31-.26l-.4-.24a2 2 0 0 1-.81-1.1l-.45-1.8a2 2 0 0 0-2.43-1.49z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="navigation">
          <ul class="nav-list">
            <li>
              <router-link
                to="/app/planos"
                class="nav-link"
                active-class="nav-link-active"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                <span>Planos</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/app/avaliacoes"
                class="nav-link"
                active-class="nav-link-active"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <path d="M12 11h4"/>
                  <path d="M12 16h4"/>
                  <path d="M8 11h.01"/>
                  <path d="M8 16h.01"/>
                </svg>
                <span>Avaliações</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/app/flashcards"
                class="nav-link"
                active-class="nav-link-active"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <path d="M10 13h4"/>
                  <path d="M10 17h4"/>
                  <path d="M10 9h1"/>
                </svg>
                <span>Flashcards</span>
              </router-link>
            </li>
          </ul>
        </nav>

        <!-- Footer -->
        <div class="sidebar-footer">
          <button @click="logout" class="logout-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" x2="9" y1="12" y2="12"/>
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile Sidebar Overlay -->
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="closeSidebar"
    ></div>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Mobile Header -->
      <header class="mobile-header">
        <button
          @click="toggleSidebar"
          class="sidebar-toggle"
          aria-label="Toggle sidebar"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" x2="20" y1="6" y2="6"/>
            <line x1="4" x2="20" y1="12" y2="12"/>
            <line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </button>
        <div class="mobile-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
          <span>TeacherPlus</span>
        </div>
        <div class="mobile-user">
          <div class="avatar-small">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="page-content">
        <router-view />
      </div>
    </main>

    <!-- Settings Modal -->
    <div v-if="showSettings" class="settings-modal-overlay" @click="closeSettings">
      <div class="settings-modal" @click.stop>
        <div class="settings-header">
          <h2>Configurações</h2>
          <button @click="closeSettings" class="close-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"/>
              <path d="M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="settings-content">
          <div class="setting-item">
            <label>Nome</label>
            <input v-model="userName" type="text" class="setting-input" />
          </div>
          <div class="setting-item">
            <label>Função</label>
            <select v-model="userRole" class="setting-input">
              <option value="Estudante">Estudante</option>
              <option value="Professor">Professor</option>
              <option value="Profissional">Profissional</option>
            </select>
          </div>
          <div class="setting-item">
            <label>Tema</label>
            <select class="setting-input">
              <option value="dark">Escuro</option>
              <option value="light">Claro</option>
            </select>
          </div>
        </div>
        <div class="settings-footer">
          <Button @click="saveSettings" variant="primary">
            Salvar
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import StaticIcons from '@/components/StaticIcons.vue'

const router = useRouter()

const sidebarOpen = ref(false)
const showSettings = ref(false)
const userName = ref('João Silva')
const userRole = ref('Estudante')

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const openSettings = () => {
  showSettings.value = true
}

const closeSettings = () => {
  showSettings.value = false
}

const saveSettings = () => {
  // Save settings to localStorage (in a real app, this would be saved to backend)
  localStorage.setItem('userSettings', JSON.stringify({
    name: userName.value,
    role: userRole.value
  }))
  closeSettings()
}

const logout = () => {
  // Clear user data and redirect to home
  localStorage.removeItem('userContext')
  localStorage.removeItem('userSettings')
  router.push('/')
}

const handleResize = () => {
  if (window.innerWidth >= 1024) {
    sidebarOpen.value = false
  }
}

const loadUserSettings = () => {
  const savedSettings = localStorage.getItem('userSettings')
  if (savedSettings) {
    const settings = JSON.parse(savedSettings)
    userName.value = settings.name || 'João Silva'
    userRole.value = settings.role || 'Estudante'
  }
}

// Load user settings on mount
onMounted(() => {
  loadUserSettings()

  // Close sidebar on route change (mobile)
  router.afterEach(() => {
    sidebarOpen.value = false
  })

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-base);
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: var(--bg-elev1);
  border-right: 1px solid var(--border);
  backdrop-filter: blur(12px);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 50;
  transform: translateX(-100%);
  transition: transform var(--dur-normal) var(--ease-standard);
}

.sidebar-open {
  transform: translateX(0);
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-elev2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin-bottom: 32px;
}

.avatar {
  width: 48px;
  height: 48px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fg-base);
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--fg-base);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-info p {
  font-size: 14px;
  color: var(--fg-muted);
  margin: 0;
}

.settings-button {
  background: transparent;
  border: none;
  color: var(--fg-subtle);
  cursor: pointer;
  padding: 8px;
  border-radius: var(--radius-sm);
  transition: all var(--dur-fast) var(--ease-standard);
}

.settings-button:hover {
  background: var(--bg-base);
  color: var(--fg-base);
}

/* Navigation */
.navigation {
  flex: 1;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-list li {
  margin-bottom: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--fg-muted);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--dur-fast) var(--ease-standard);
  font-weight: 500;
}

.nav-link:hover {
  background: var(--bg-elev2);
  color: var(--fg-base);
}

.nav-link-active {
  background: var(--primary);
  color: var(--fg-base);
}

.nav-link-active:hover {
  background: var(--primary-600);
}

/* Sidebar Footer */
.sidebar-footer {
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: var(--fg-muted);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-standard);
  font-size: 14px;
}

.logout-button:hover {
  background: var(--bg-elev2);
  color: var(--danger);
}

/* Sidebar Overlay */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
  backdrop-filter: blur(4px);
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Mobile Header */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--bg-elev1);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 30;
}

.sidebar-toggle {
  background: transparent;
  border: none;
  color: var(--fg-base);
  cursor: pointer;
  padding: 8px;
  border-radius: var(--radius-sm);
  transition: all var(--dur-fast) var(--ease-standard);
}

.sidebar-toggle:hover {
  background: var(--bg-elev2);
}

.mobile-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--fg-base);
  font-weight: 600;
}

.mobile-user {
  display: flex;
  align-items: center;
}

.avatar-small {
  width: 32px;
  height: 32px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fg-base);
}

/* Page Content */
.page-content {
  flex: 1;
  padding: 32px 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Settings Modal */
.settings-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.settings-modal {
  background: var(--bg-elev1);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-md);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--border);
}

.settings-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--fg-base);
  margin: 0;
}

.close-button {
  background: transparent;
  border: none;
  color: var(--fg-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: var(--radius-sm);
  transition: all var(--dur-fast) var(--ease-standard);
}

.close-button:hover {
  background: var(--bg-elev2);
  color: var(--fg-base);
}

.settings-content {
  padding: 24px;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--fg-base);
  margin-bottom: 8px;
}

.setting-input {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-elev2);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--fg-base);
  font-size: 14px;
  outline: none;
  transition: all var(--dur-fast) var(--ease-standard);
}

.setting-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
}

.settings-footer {
  padding: 24px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
}

/* Desktop Styles */
@media (min-width: 1024px) {
  .sidebar {
    position: static;
    transform: translateX(0);
  }
  
  .mobile-header {
    display: none;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .page-content {
    padding: 40px 32px;
  }
}

/* Tablet Styles */
@media (max-width: 1023px) and (min-width: 768px) {
  .page-content {
    padding: 24px 20px;
  }
}

/* Mobile Styles */
@media (max-width: 767px) {
  .page-content {
    padding: 20px 16px;
  }
  
  .sidebar {
    width: 100%;
    max-width: 320px;
  }
}
</style>
