<template>
  <div class="gradient-border p-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-sm font-semibold text-dashboard-text flex items-center gap-2">
        <span>📋</span>
        行动跟踪与任务下达
      </h2>
      <button
        @click="showBatchDispatch"
        class="text-xs px-3 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors"
      >
        ✉️ 批量派发
      </button>
    </div>

    <!-- 桌面端表格 -->
    <div class="hidden lg:block overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-dashboard-border">
            <th class="text-left py-3 px-3 text-xs text-dashboard-muted font-medium">BSC指标</th>
            <th class="text-left py-3 px-3 text-xs text-dashboard-muted font-medium">根因分析</th>
            <th class="text-left py-3 px-3 text-xs text-dashboard-muted font-medium">改进措施</th>
            <th class="text-left py-3 px-3 text-xs text-dashboard-muted font-medium">责任人</th>
            <th class="text-left py-3 px-3 text-xs text-dashboard-muted font-medium">截止日期</th>
            <th class="text-left py-3 px-3 text-xs text-dashboard-muted font-medium">状态</th>
            <th class="text-center py-3 px-3 text-xs text-dashboard-muted font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in actionTrackerData"
            :key="item.id"
            class="border-b border-dashboard-border/50 hover:bg-dashboard-dark/30 transition-colors"
          >
            <td class="py-3 px-3">
              <span class="text-dashboard-text font-medium">{{ item.indicator }}</span>
            </td>
            <td class="py-3 px-3 text-dashboard-muted max-w-xs">
              <span class="line-clamp-2">{{ item.rootCause }}</span>
            </td>
            <td class="py-3 px-3 text-dashboard-text max-w-xs">
              <span class="line-clamp-2">{{ item.action }}</span>
            </td>
            <td class="py-3 px-3">
              <span class="text-primary-400">{{ item.owner }}</span>
            </td>
            <td class="py-3 px-3 text-dashboard-muted">
              {{ item.deadline }}
            </td>
            <td class="py-3 px-3">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
                :class="getStatusClass(item.status)"
              >
                {{ item.status }}
              </span>
            </td>
            <td class="py-3 px-3 text-center">
              <button
                @click="openDispatchPanel(item)"
                class="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors text-xs"
              >
                <span>✉️</span>
                一键派发
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 移动端卡片列表 -->
    <div class="lg:hidden space-y-3">
      <div
        v-for="item in actionTrackerData"
        :key="item.id"
        class="bg-dashboard-dark/30 rounded-lg p-3"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-dashboard-text font-medium text-sm">{{ item.indicator }}</span>
          <span
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
            :class="getStatusClass(item.status)"
          >
            {{ item.status }}
          </span>
        </div>
        <div class="text-xs text-dashboard-muted mb-2 line-clamp-2">
          {{ item.rootCause }}
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-primary-400">{{ item.owner }}</span>
          <span class="text-dashboard-muted">截止: {{ item.deadline }}</span>
        </div>
        <button
          @click="openDispatchPanel(item)"
          class="mt-3 w-full flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors text-xs"
        >
          <span>✉️</span>
          一键派发任务
        </button>
      </div>
    </div>

    <!-- 底部统计 -->
    <div class="mt-4 pt-4 border-t border-dashboard-border">
      <div class="hidden lg:flex items-center justify-between">
        <div class="flex items-center gap-6 text-xs">
          <span class="text-dashboard-muted">
            总计: <strong class="text-dashboard-text">{{ actionTrackerData.length }}</strong> 项行动
          </span>
          <span class="text-dashboard-muted">
            进行中: <strong class="text-status-yellow">{{ inProgressCount }}</strong> 项
          </span>
          <span class="text-dashboard-muted">
            待启动: <strong class="text-status-red">{{ pendingCount }}</strong> 项
          </span>
          <span class="text-dashboard-muted">
            已完成: <strong class="text-status-green">{{ completedCount }}</strong> 项
          </span>
        </div>
        <button class="text-xs text-primary-400 hover:text-primary-300 transition-colors">
          导出报告 →
        </button>
      </div>

      <!-- 移动端统计 -->
      <div class="lg:hidden flex items-center justify-center gap-4 text-xs flex-wrap">
        <span class="text-dashboard-muted">
          <strong class="text-status-yellow">{{ inProgressCount }}</strong> 进行中
        </span>
        <span class="text-dashboard-muted">
          <strong class="text-status-red">{{ pendingCount }}</strong> 待启动
        </span>
        <span class="text-dashboard-muted">
          <strong class="text-status-green">{{ completedCount }}</strong> 已完成
        </span>
      </div>
    </div>

    <!-- 任务派发面板 -->
    <TaskDispatchPanel
      v-model:visible="showDispatchPanel"
      :taskData="currentTaskData"
      @submit="handleTaskSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { actionTrackerData } from '../../composables/useMockData'
import TaskDispatchPanel from '../common/TaskDispatchPanel.vue'

const showDispatchPanel = ref(false)
const currentTaskData = ref({})

const inProgressCount = computed(() => actionTrackerData.filter(i => i.status === '进行中').length)
const pendingCount = computed(() => actionTrackerData.filter(i => i.status === '待启动').length)
const completedCount = computed(() => actionTrackerData.filter(i => i.status === '已完成').length)

const getStatusClass = (status) => {
  const classes = {
    '进行中': 'bg-status-yellow/20 text-status-yellow',
    '待启动': 'bg-status-red/20 text-status-red',
    '已完成': 'bg-status-green/20 text-status-green'
  }
  return classes[status] || 'bg-dashboard-card text-dashboard-muted'
}

const openDispatchPanel = (item) => {
  currentTaskData.value = {
    indicator: item.indicator,
    currentValue: '72.3%', // 示例数据
    target: '85%',
    gap: '-12.7%',
    rootCause: item.rootCause,
    action: item.action
  }
  showDispatchPanel.value = true
}

const showBatchDispatch = () => {
  alert('批量派发功能开发中...')
}

const handleTaskSubmit = (task) => {
  console.log('任务已派发:', task)
  // 这里可以调用API提交任务
  alert(`任务已成功派发给 ${task.owner}！\n\n截止日期: ${task.deadline}\n优先级: ${task.priority === 'high' ? '紧急' : task.priority === 'medium' ? '一般' : '低'}`)
}
</script>
