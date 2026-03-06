<template>
  <teleport to="body">
    <transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <div class="w-[760px] max-h-[90vh] overflow-auto rounded-xl border border-dashboard-border bg-dashboard-card shadow-2xl">
          <div class="flex items-center justify-between border-b border-dashboard-border p-4">
            <div>
              <h3 class="text-lg font-semibold text-dashboard-text">自定义首页</h3>
              <p class="text-xs text-dashboard-muted mt-1">管理首页模块显示顺序与可见性</p>
            </div>
            <button @click="handleClose" class="text-dashboard-muted hover:text-dashboard-text transition-colors">✕</button>
          </div>

          <div class="p-4 grid grid-cols-2 gap-3">
            <div
              v-for="module in modules"
              :key="module.key"
              class="rounded-lg border border-dashboard-border bg-dashboard-dark/40 p-3"
            >
              <div class="flex items-center justify-between">
                <div class="text-sm font-medium text-dashboard-text">{{ module.name }}</div>
                <button
                  @click="module.visible = !module.visible"
                  class="px-2 py-0.5 rounded text-xs"
                  :class="module.visible ? 'bg-status-green/20 text-status-green' : 'bg-dashboard-dark text-dashboard-muted'"
                >
                  {{ module.visible ? '显示' : '隐藏' }}
                </button>
              </div>
              <div class="mt-2 text-xs text-dashboard-muted">排序优先级：{{ module.order }}</div>
              <input
                v-model.number="module.order"
                type="range"
                min="1"
                max="10"
                class="mt-2 w-full accent-primary-500"
              />
            </div>
          </div>

          <div class="px-4 pb-4 text-xs text-dashboard-muted">
            保存后将即时刷新当前首页布局，不会影响经营分析会视图。
          </div>

          <div class="flex items-center justify-end gap-3 border-t border-dashboard-border p-4 bg-dashboard-dark/30">
            <button
              @click="handleClose"
              class="px-4 py-2 rounded-lg text-sm text-dashboard-muted hover:text-dashboard-text transition-colors"
            >
              取消
            </button>
            <button
              @click="handleSave"
              class="px-6 py-2 rounded-lg text-sm bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              保存布局
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { reactive } from 'vue'

defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'saved'])

const modules = reactive([
  { key: 'overview', name: '经营概览', order: 1, visible: true },
  { key: 'finance', name: '核心财务指标', order: 2, visible: true },
  { key: 'customer', name: '核心客户指标', order: 3, visible: true },
  { key: 'alerts', name: '智能预警中心', order: 4, visible: true }
])

const handleClose = () => {
  emit('update:visible', false)
}

const handleSave = () => {
  emit('saved', modules)
  handleClose()
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
