<template>
  <Teleport to="body">
    <transition name="slide-up">
      <div 
        v-if="visible" 
        class="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
        @click="$emit('update:visible', false)"
      >
        <div 
          class="w-full max-h-[80vh] bg-dashboard-card rounded-t-2xl overflow-hidden"
          @click.stop
        >
          <!-- 头部 -->
          <div class="sticky top-0 bg-dashboard-card border-b border-dashboard-border p-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-dashboard-text">筛选条件</h3>
            <button 
              @click="$emit('update:visible', false)"
              class="p-2 text-dashboard-muted hover:text-dashboard-text"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 筛选内容 -->
          <div class="p-4 space-y-6 overflow-y-auto max-h-[60vh]">
            <!-- 时间段选择 -->
            <div>
              <label class="block text-sm font-medium text-dashboard-text mb-3">时间段</label>
              <div class="grid grid-cols-3 gap-2">
                <button 
                  v-for="period in timeOptions" 
                  :key="period.value"
                  @click="selectedTime = period.value"
                  class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="selectedTime === period.value 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-dashboard-dark/50 text-dashboard-muted hover:bg-dashboard-dark'"
                >
                  {{ period.label }}
                </button>
              </div>
            </div>

            <!-- 业务体系 -->
            <div>
              <label class="block text-sm font-medium text-dashboard-text mb-3">业务体系</label>
              <div class="space-y-2">
                <button 
                  v-for="system in businessOptions" 
                  :key="system.value"
                  @click="selectedBusiness = system.value"
                  class="w-full px-4 py-3 rounded-lg text-left transition-colors flex items-center justify-between"
                  :class="selectedBusiness === system.value 
                    ? 'bg-primary-600/20 border border-primary-500 text-primary-400' 
                    : 'bg-dashboard-dark/50 text-dashboard-muted hover:bg-dashboard-dark'"
                >
                  <span>{{ system.label }}</span>
                  <span v-if="selectedBusiness === system.value" class="text-primary-400">✓</span>
                </button>
              </div>
            </div>

            <!-- 区域 -->
            <div>
              <label class="block text-sm font-medium text-dashboard-text mb-3">区域</label>
              <div class="grid grid-cols-2 gap-2">
                <button 
                  v-for="region in regionOptions" 
                  :key="region.value"
                  @click="selectedRegion = region.value"
                  class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="selectedRegion === region.value 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-dashboard-dark/50 text-dashboard-muted hover:bg-dashboard-dark'"
                >
                  {{ region.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="sticky bottom-0 bg-dashboard-card border-t border-dashboard-border p-4 flex gap-3">
            <button 
              @click="handleReset"
              class="flex-1 py-3 rounded-xl bg-dashboard-dark text-dashboard-muted font-medium"
            >
              重置
            </button>
            <button 
              @click="handleApply"
              class="flex-1 py-3 rounded-xl bg-primary-600 text-white font-medium"
            >
              应用筛选
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useGlobalFilter } from '../../composables/useGlobalFilter'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'apply'])

const { timeOptions, businessOptions, regionOptions, setFilter } = useGlobalFilter()

const selectedTime = ref('month')
const selectedBusiness = ref('all')
const selectedRegion = ref('all')

const handleReset = () => {
  selectedTime.value = 'month'
  selectedBusiness.value = 'all'
  selectedRegion.value = 'all'
}

const handleApply = () => {
  setFilter({
    timeRange: selectedTime.value,
    businessSystem: selectedBusiness.value,
    region: selectedRegion.value
  })
  emit('apply', {
    timeRange: selectedTime.value,
    businessSystem: selectedBusiness.value,
    region: selectedRegion.value
  })
  emit('update:visible', false)
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
}

.slide-up-enter-from > div:last-child,
.slide-up-leave-to > div:last-child {
  transform: translateY(100%);
}
</style>
