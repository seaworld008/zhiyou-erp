import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'factory'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeMode>('light')

  const isDark = computed(() => currentTheme.value === 'dark')
  const isFactory = computed(() => currentTheme.value === 'factory')

  const setTheme = (theme: ThemeMode) => {
    currentTheme.value = theme
    localStorage.setItem('zhiyou_theme', theme)
    updateDocumentTheme(theme)
  }

  const toggleTheme = () => {
    const themes: ThemeMode[] = ['light', 'dark', 'factory']
    const currentIndex = themes.indexOf(currentTheme.value)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const updateDocumentTheme = (theme: ThemeMode) => {
    document.documentElement.setAttribute('data-theme', theme)
    
    // 应用不同主题的CSS变量
    const root = document.documentElement
    
    switch (theme) {
      case 'light':
        root.style.setProperty('--color-primary', '#18a058')
        root.style.setProperty('--color-success', '#18a058')
        root.style.setProperty('--bg-body', '#f5f7fa')
        root.style.setProperty('--bg-card', '#ffffff')
        root.style.setProperty('--text-primary', '#303133')
        root.style.setProperty('--font-scale', '1')
        break
      case 'dark':
        root.style.setProperty('--color-primary', '#3A84FF')
        root.style.setProperty('--color-success', '#67C23A')
        root.style.setProperty('--bg-body', '#1e1e1e')
        root.style.setProperty('--bg-card', '#2b2b2b')
        root.style.setProperty('--text-primary', '#e5eaf3')
        root.style.setProperty('--font-scale', '1')
        break
      case 'factory':
        root.style.setProperty('--color-primary', '#00D8FF')
        root.style.setProperty('--color-success', '#67C23A')
        root.style.setProperty('--bg-body', '#001B2E')
        root.style.setProperty('--bg-card', 'rgba(0,27,46,0.6)')
        root.style.setProperty('--text-primary', '#ffffff')
        root.style.setProperty('--font-scale', '1.25')
        break
    }
  }

  const initTheme = () => {
    const savedTheme = localStorage.getItem('zhiyou_theme') as ThemeMode
    if (savedTheme && ['light', 'dark', 'factory'].includes(savedTheme)) {
      setTheme(savedTheme)
    } else {
      // 默认跟随系统主题
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
  }

  // 监听系统主题变化
  const watchSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addListener((e) => {
      if (!localStorage.getItem('zhiyou_theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    })
  }

  // 初始化主题
  initTheme()
  watchSystemTheme()

  return {
    currentTheme,
    isDark,
    isFactory,
    setTheme,
    toggleTheme,
    initTheme
  }
}) 