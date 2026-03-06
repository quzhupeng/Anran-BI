<template>
  <teleport to="body">
    <transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <div class="w-[640px] max-h-[90vh] overflow-auto rounded-xl border border-dashboard-border bg-dashboard-card shadow-2xl">
          <div class="flex items-center justify-between border-b border-dashboard-border p-4">
            <div>
              <h3 class="text-lg font-semibold text-dashboard-text">预警配置</h3>
              <p class="text-xs text-dashboard-muted mt-1">设置复杂规则触发条件与通知对象</p>
            </div>
            <button @click="handleClose" class="text-dashboard-muted hover:text-dashboard-text transition-colors">✕</button>
          </div>

          <div class="space-y-3 p-4">
            <div
              v-for="rule in rules"
              :key="rule.id"
              class="rounded-lg border border-dashboard-border bg-dashboard-dark/40 p-3"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="text-sm font-medium text-dashboard-text">{{ rule.name }}</div>
                <button
                  @click="rule.enabled = !rule.enabled"
                  class="px-2 py-0.5 text-xs rounded"
                  :class="rule.enabled ? 'bg-status-green/20 text-status-green' : 'bg-dashboard-dark text-dashboard-muted'"
                >
                  {{ rule.enabled ? '已启用' : '已停用' }}
                </button>
              </div>
              <div class="text-xs text-dashboard-muted">{{ rule.description }}</div>
              <div class="mt-2 grid grid-cols-3 gap-2">
                <label class="text-xs text-dashboard-muted">
                  阈值
                  <input
                    v-model.number="rule.threshold"
                    type="number"
                    class="mt-1 w-full rounded border border-dashboard-border bg-dashboard-dark/60 px-2 py-1 text-dashboard-text focus:outline-none"
                  />
                </label>
                <label class="text-xs text-dashboard-muted">
                  监测窗口(天)
                  <input
                    v-model.number="rule.windowDays"
                    type="number"
                    class="mt-1 w-full rounded border border-dashboard-border bg-dashboard-dark/60 px-2 py-1 text-dashboard-text focus:outline-none"
                  />
                </label>
                <label class="text-xs text-dashboard-muted">
                  优先级
                  <select
                    v-model="rule.level"
                    class="mt-1 w-full rounded border border-dashboard-border bg-dashboard-dark/60 px-2 py-1 text-dashboard-text focus:outline-none"
                  >
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select>
                </label>
              </div>
            </div>

            <div class="rounded-lg border border-status-green/40 bg-status-green/10 px-3 py-2 text-xs text-status-green">
              预警配置保存后，规则将立即在实时看板生效并同步至告警中心。
            </div>
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
              保存配置
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

const rules = reactive([
  {
    id: 'r1',
    name: '连续环比下降预警',
    description: '当核心指标连续N天环比下降时触发。',
    threshold: 3,
    windowDays: 7,
    level: 'high',
    enabled: true
  },
  {
    id: 'r2',
    name: '低于团队均值预警',
    description: '当指标低于团队均值阈值时触发。',
    threshold: 15,
    windowDays: 3,
    level: 'high',
    enabled: true
  },
  {
    id: 'r3',
    name: '波动异常预警',
    description: '当指标波动系数超过阈值时触发。',
    threshold: 10,
    windowDays: 7,
    level: 'medium',
    enabled: true
  }
])

const handleClose = () => {
  emit('update:visible', false)
}

const handleSave = () => {
  emit('saved', rules)
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
