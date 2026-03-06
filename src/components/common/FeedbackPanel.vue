<template>
  <teleport to="body">
    <transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <div class="w-[560px] max-h-[90vh] overflow-auto rounded-xl border border-dashboard-border bg-dashboard-card shadow-2xl">
          <div class="flex items-center justify-between border-b border-dashboard-border p-4">
            <div>
              <h3 class="text-lg font-semibold text-dashboard-text">意见反馈</h3>
              <p class="text-xs text-dashboard-muted mt-1">你的反馈将用于优化驾驶舱体验</p>
            </div>
            <button @click="handleClose" class="text-dashboard-muted hover:text-dashboard-text transition-colors">✕</button>
          </div>

          <div class="space-y-3 p-4">
            <div>
              <label class="mb-1 block text-xs text-dashboard-muted">反馈类型</label>
              <select
                v-model="form.type"
                class="w-full rounded-lg border border-dashboard-border bg-dashboard-dark/50 px-3 py-2 text-sm text-dashboard-text"
              >
                <option value="bug">问题反馈</option>
                <option value="experience">体验优化</option>
                <option value="feature">功能建议</option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-xs text-dashboard-muted">反馈内容</label>
              <textarea
                v-model="form.content"
                rows="5"
                placeholder="请描述你遇到的问题或建议..."
                class="w-full resize-none rounded-lg border border-dashboard-border bg-dashboard-dark/50 px-3 py-2 text-sm text-dashboard-text"
              ></textarea>
            </div>

            <div>
              <label class="mb-1 block text-xs text-dashboard-muted">联系方式（可选）</label>
              <input
                v-model="form.contact"
                placeholder="邮箱/手机号"
                class="w-full rounded-lg border border-dashboard-border bg-dashboard-dark/50 px-3 py-2 text-sm text-dashboard-text"
              />
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
              @click="handleSubmit"
              :disabled="!form.content.trim()"
              class="px-6 py-2 rounded-lg text-sm bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              提交反馈
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

const emit = defineEmits(['update:visible', 'submitted'])

const form = reactive({
  type: 'experience',
  content: '',
  contact: ''
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = () => {
  emit('submitted', { ...form })
  form.content = ''
  form.contact = ''
  form.type = 'experience'
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
