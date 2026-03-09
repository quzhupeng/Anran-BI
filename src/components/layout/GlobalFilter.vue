<template>
  <div class="global-filter glass-effect border-b border-dashboard-border">
    <div class="px-6 py-3 flex items-center justify-between">
      <!-- 左侧：筛选器组 -->
      <div class="flex items-center gap-6">
        <!-- 起止月份 -->
        <div class="filter-group">
          <label class="text-xs text-dashboard-muted mb-1 block">起止月份</label>
          <div class="flex items-center gap-2 bg-dashboard-dark/50 rounded-lg border border-dashboard-border px-2 py-1.5">
            <input
              type="month"
              :value="state.startMonth"
              @change="setFilter('startMonth', $event.target.value)"
              class="bg-transparent text-xs text-dashboard-text focus:outline-none"
            />
            <span class="text-dashboard-muted text-xs">至</span>
            <input
              type="month"
              :value="state.endMonth"
              @change="setFilter('endMonth', $event.target.value)"
              class="bg-transparent text-xs text-dashboard-text focus:outline-none"
            />
          </div>
        </div>

        <!-- 业务体系 -->
        <div class="filter-group">
          <label class="text-xs text-dashboard-muted mb-1 block">业务体系</label>
          <select
            :value="state.businessSystem"
            @change="setFilter('businessSystem', $event.target.value)"
            class="bg-dashboard-dark/50 border border-dashboard-border rounded-lg px-3 py-1.5 text-sm text-dashboard-text appearance-none cursor-pointer hover:border-primary-500/50 transition-colors min-w-[120px]"
          >
            <option v-for="option in businessSystemOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- 业务部 -->
        <div class="filter-group">
          <label class="text-xs text-dashboard-muted mb-1 block">业务部</label>
          <select
            :value="state.region"
            @change="setFilter('region', $event.target.value)"
            class="bg-dashboard-dark/50 border border-dashboard-border rounded-lg px-3 py-1.5 text-sm text-dashboard-text appearance-none cursor-pointer hover:border-primary-500/50 transition-colors min-w-[100px]"
          >
            <option v-for="option in regionOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- 右侧：操作按钮 -->
      <div class="flex items-center gap-3">
        <!-- 当前筛选条件显示 -->
        <div class="text-xs text-dashboard-muted flex items-center gap-2">
          <span>当前视图:</span>
          <span class="text-primary-400">{{ getFilterDescription }}</span>
        </div>

        <!-- 刷新按钮 -->
        <button
          @click="handleRefresh"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dashboard-dark/50 border border-dashboard-border text-sm text-dashboard-muted hover:text-dashboard-text hover:border-primary-500/50 transition-all"
          :disabled="isRefreshing"
        >
          <span :class="{ 'animate-spin-slow': isRefreshing }">🔄</span>
          <span>{{ isRefreshing ? '刷新中...' : '刷新' }}</span>
        </button>

        <!-- 重置按钮 -->
        <button
          @click="handleReset"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-dashboard-muted hover:text-dashboard-text transition-all"
        >
          <span>↩️</span>
          <span>重置</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGlobalFilter } from '../../composables/useGlobalFilter'

const {
  state,
  businessSystemOptions,
  regionOptions,
  setFilter,
  refreshAll,
  resetFilters,
  getFilterDescription
} = useGlobalFilter()

const isRefreshing = ref(false)

const handleRefresh = () => {
  isRefreshing.value = true
  refreshAll()
  setTimeout(() => {
    isRefreshing.value = false
  }, 800)
}

const handleReset = () => {
  resetFilters()
}
</script>

<style scoped>
/* 自定义下拉箭头 */
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

input[type="month"]::-webkit-calendar-picker-indicator {
  filter: invert(0.8);
  cursor: pointer;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin 1.5s linear infinite;
}
</style>
