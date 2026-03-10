<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="handleClose">
        <div class="bg-dashboard-card border border-dashboard-border rounded-xl shadow-2xl w-[600px] max-h-[90vh] overflow-auto" @click.stop>
          <!-- 头部 -->
          <div class="flex items-center justify-between p-4 border-b border-dashboard-border">
            <div class="flex items-center gap-2">
              <span class="text-xl">✉️</span>
              <h3 class="text-lg font-semibold text-dashboard-text">创建改进任务</h3>
            </div>
            <button @click="handleClose" class="text-dashboard-muted hover:text-dashboard-text transition-colors">
              ✕
            </button>
          </div>
          
          <!-- 主体内容 -->
          <div class="p-4 space-y-4">
            <!-- 问题背景（自动填充） -->
            <div class="bg-dashboard-dark/50 rounded-lg p-3 border border-dashboard-border">
              <div class="text-xs text-dashboard-muted mb-2">📋 问题背景（已自动填充）</div>
              <div class="text-sm text-dashboard-text">
                <div class="font-medium mb-1">{{ taskData.indicator }}</div>
                <div class="text-xs text-dashboard-muted">
                  当前值: <span :class="getValueClass()">{{ taskData.currentValue }}</span> | 
                  目标: {{ taskData.target }} | 
                  差距: <span class="text-status-red">{{ taskData.gap }}</span>
                </div>
              </div>
            </div>

            <div class="bg-primary-900/20 rounded-lg p-3 border border-primary-700/40">
              <div class="text-xs text-primary-300 mb-1">🤖 智能带出</div>
              <div class="text-xs text-dashboard-muted">
                已自动带出问题指标、当前图表截图、责任部门/责任人建议。
              </div>
            </div>

            <!-- 图表截图（自动带出） -->
            <div class="bg-dashboard-dark/30 rounded-lg p-3 border border-dashed border-dashboard-border">
              <label class="text-xs text-dashboard-muted mb-2 block">当前图表截图（自动关联）</label>
              <div class="h-20 rounded bg-dashboard-dark/60 border border-dashboard-border flex items-center justify-center text-xs text-dashboard-muted">
                {{ taskData.chartSnapshot || '当前组合图（计划值/实际值/达成率）' }}
              </div>
            </div>
            
            <!-- 关联根因 -->
            <div>
              <label class="text-xs text-dashboard-muted mb-1 block">根因分析</label>
              <textarea 
                v-model="form.rootCause"
                class="w-full bg-dashboard-dark/50 border border-dashboard-border rounded-lg px-3 py-2 text-sm text-dashboard-text resize-none"
                rows="3"
                placeholder="请输入问题根因..."
              ></textarea>
            </div>
            
            <!-- 改进措施 -->
            <div>
              <label class="text-xs text-dashboard-muted mb-1 block">改进措施</label>
              <textarea 
                v-model="form.action"
                class="w-full bg-dashboard-dark/50 border border-dashboard-border rounded-lg px-3 py-2 text-sm text-dashboard-text resize-none"
                rows="3"
                placeholder="请输入改进措施..."
              ></textarea>
            </div>
            
            <!-- 责任部门/责任人 -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs text-dashboard-muted mb-1 block">责任部门</label>
                <select
                  v-model="form.department"
                  class="w-full bg-dashboard-dark/50 border border-dashboard-border rounded-lg px-3 py-2 text-sm text-dashboard-text"
                >
                  <option v-for="department in departmentOptions" :key="department.value" :value="department.value">
                    {{ department.label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="text-xs text-dashboard-muted mb-1 block">责任人</label>
                <select 
                  v-model="form.owner"
                  class="w-full bg-dashboard-dark/50 border border-dashboard-border rounded-lg px-3 py-2 text-sm text-dashboard-text"
                >
                  <option value="">请选择责任人</option>
                  <option v-for="person in ownerOptions" :key="person.value" :value="person.value">
                    {{ person.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- 截止时间 -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs text-dashboard-muted mb-1 block">截止时间</label>
                <input 
                  type="date"
                  v-model="form.deadline"
                  class="w-full bg-dashboard-dark/50 border border-dashboard-border rounded-lg px-3 py-2 text-sm text-dashboard-text"
                />
              </div>
              
              <div>
                <label class="text-xs text-dashboard-muted mb-1 block">同步状态</label>
                <div class="h-[38px] rounded-lg border border-status-green/40 bg-status-green/10 flex items-center px-3 text-xs text-status-green">
                  已与云七任务系统打通，状态将自动同步
                </div>
              </div>
            </div>
            
            <!-- 优先级 -->
            <div>
              <label class="text-xs text-dashboard-muted mb-1 block">优先级</label>
              <div class="flex gap-2">
                <button 
                  v-for="level in priorityLevels"
                  :key="level.value"
                  @click="form.priority = level.value"
                  class="flex-1 px-3 py-2 rounded-lg text-sm transition-all"
                  :class="[
                    form.priority === level.value 
                      ? level.activeClass 
                      : 'bg-dashboard-dark/50 border border-dashboard-border text-dashboard-muted hover:text-dashboard-text'
                  ]"
                >
                  {{ level.label }}
                </button>
              </div>
            </div>
            
            <!-- 附件区域 -->
            <div class="bg-dashboard-dark/30 rounded-lg p-3 border border-dashed border-dashboard-border">
              <div class="flex items-center gap-2 text-xs text-dashboard-muted">
                <span>📎</span>
                <span>数据截图将自动生成并作为任务附件</span>
              </div>
            </div>
          </div>
          
          <!-- 底部操作 -->
          <div class="flex items-center justify-end gap-3 p-4 border-t border-dashboard-border bg-dashboard-dark/30">
            <button 
              @click="handleClose"
              class="px-4 py-2 rounded-lg text-sm text-dashboard-muted hover:text-dashboard-text transition-colors"
            >
              取消
            </button>
            <button 
              @click="handleSubmit"
              class="px-6 py-2 rounded-lg text-sm bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              确认派发
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  taskData: {
    type: Object,
    default: () => ({
      indicator: '',
      currentValue: '',
      target: '',
      gap: '',
      department: '直销事业部',
      owner: '张经理（华东区）',
      chartSnapshot: ''
    })
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const form = reactive({
  rootCause: '',
  action: '',
  department: 'directSales',
  owner: 'zhangjl',
  deadline: getDefaultDeadline(),
  priority: 'medium'
})

const departmentOptions = [
  { value: 'directSales', label: '直销事业部' },
  { value: 'finance', label: '财务管理部' },
  { value: 'operation', label: '运营管理部' },
  { value: 'hr', label: '人力资源部' }
]

// 责任人选项
const ownerOptions = [
  { value: 'zhangjl', label: '张经理（华东区）' },
  { value: 'lizg', label: '李总监（财务部）' },
  { value: 'wangbuz', label: '王部长（人力资源）' },
  { value: 'liuzg', label: '刘主管（运营部）' },
  { value: 'chenxm', label: '陈经理（华南区）' }
]

// 优先级选项
const priorityLevels = [
  { value: 'high', label: '紧急', activeClass: 'bg-status-red text-white' },
  { value: 'medium', label: '一般', activeClass: 'bg-status-yellow text-dashboard-dark' },
  { value: 'low', label: '低', activeClass: 'bg-dashboard-card border border-dashboard-border text-dashboard-text' }
]

function getDefaultDeadline() {
  const date = new Date()
  date.setDate(date.getDate() + 14) // 默认两周后
  return date.toISOString().split('T')[0]
}

// 监听传入的数据，自动填充
watch(() => props.taskData, (newData) => {
  if (newData.rootCause) {
    form.rootCause = newData.rootCause
  }
  if (newData.action) {
    form.action = newData.action
  }
  if (newData.department) {
    const mappedDepartment = departmentOptions.find(item => item.label === newData.department || item.value === newData.department)
    form.department = mappedDepartment?.value || form.department
  }
  if (newData.owner) {
    const mappedOwner = ownerOptions.find(item => item.label === newData.owner || item.value === newData.owner)
    form.owner = mappedOwner?.value || form.owner
  }
}, { immediate: true })

const getValueClass = () => {
  return 'text-status-red'
}

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = () => {
  emit('submit', {
    ...form,
    indicator: props.taskData.indicator,
    currentValue: props.taskData.currentValue,
    target: props.taskData.target,
    gap: props.taskData.gap
  })
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
