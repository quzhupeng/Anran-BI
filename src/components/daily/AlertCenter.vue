<template>
  <div class="gradient-border p-4 h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-sm font-semibold text-dashboard-text flex items-center gap-2">
        <span>🔔</span>
        智能预警中心
      </h2>
      <div class="flex items-center gap-2">
        <button
          class="text-xs px-2 py-0.5 rounded bg-dashboard-dark/50 border border-dashboard-border text-dashboard-muted hover:text-dashboard-text transition-colors"
          @click="$emit('open-alert-config')"
        >
          ⚙️ 预警配置
        </button>
        <span class="text-xs px-2 py-0.5 rounded-full bg-status-red/20 text-status-red">
          {{ alerts.length }} 条预警
        </span>
      </div>
    </div>
    
    <div class="flex-1 overflow-auto space-y-2">
      <div 
        v-for="alert in alerts" 
        :key="alert.id"
        class="bg-dashboard-dark/50 rounded-lg p-3 border transition-all hover:bg-dashboard-dark/70 cursor-pointer"
        :class="[
          alert.level === 'red' ? 'border-status-red/30 hover:border-status-red/50' : 'border-status-yellow/30 hover:border-status-yellow/50'
        ]"
      >
        <div class="flex items-start gap-3">
          <span 
            class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
            :class="alert.level === 'red' ? 'bg-status-red status-pulse' : 'bg-status-yellow'"
          ></span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h4 
                class="text-sm font-medium truncate"
                :class="alert.level === 'red' ? 'text-status-red' : 'text-status-yellow'"
              >
                {{ alert.title }}
              </h4>
              <span class="text-xs text-dashboard-muted flex-shrink-0 ml-2">{{ alert.time }}</span>
            </div>
            <p class="text-xs text-dashboard-muted mt-1">{{ alert.detail }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部操作 -->
    <div class="mt-4 pt-3 border-t border-dashboard-border flex items-center justify-between gap-2">
      <button class="text-xs text-primary-400 hover:text-primary-300 transition-colors whitespace-nowrap">
        查看全部预警 →
      </button>
      <button
        class="text-xs px-2 py-1 rounded bg-primary-500 text-white hover:bg-primary-600 transition-colors whitespace-nowrap"
        @click="$emit('open-report')"
      >
        导出报告(PDF/PPT)
      </button>
    </div>
  </div>
</template>

<script setup>
import { alertData } from '../../composables/useMockData'

defineEmits(['open-report', 'open-alert-config'])

const alerts = alertData
</script>
