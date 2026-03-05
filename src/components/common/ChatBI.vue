<template>
  <teleport to="body">
    <transition name="slide-up">
      <div v-if="visible" class="fixed bottom-0 right-6 w-[420px] h-[600px] z-50 flex flex-col">
        <div class="bg-dashboard-card border border-dashboard-border rounded-t-2xl shadow-2xl flex flex-col h-full overflow-hidden">
          <!-- 头部 -->
          <div class="flex items-center justify-between p-4 border-b border-dashboard-border bg-gradient-to-r from-primary-600 to-primary-500">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <span class="text-2xl">🤖</span>
              </div>
              <div>
                <h3 class="text-white font-semibold">智能助手</h3>
                <p class="text-white/70 text-xs">用自然语言查询经营数据</p>
              </div>
            </div>
            <button @click="handleClose" class="text-white/70 hover:text-white text-xl transition-colors">✕</button>
          </div>
          
          <!-- 对话区域 -->
          <div ref="chatContainer" class="flex-1 overflow-auto p-4 space-y-4">
            <!-- 欢迎消息 -->
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                <span class="text-lg">🤖</span>
              </div>
              <div class="flex-1 bg-dashboard-dark/50 rounded-2xl rounded-tl-none p-3">
                <p class="text-sm text-dashboard-text">
                  您好！我是您的智能数据分析助手。您可以用自然语言向我提问，例如：
                </p>
                <div class="mt-3 space-y-2">
                  <button 
                    v-for="suggestion in suggestions" 
                    :key="suggestion"
                    @click="handleSuggestionClick(suggestion)"
                    class="block w-full text-left px-3 py-2 text-xs text-primary-400 bg-primary-500/10 rounded-lg hover:bg-primary-500/20 transition-colors"
                  >
                    {{ suggestion }}
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 对话历史 -->
            <template v-for="(message, index) in chatHistory" :key="index">
              <!-- 用户消息 -->
              <div v-if="message.role === 'user'" class="flex items-start gap-3 justify-end">
                <div class="flex-1 bg-primary-500/20 rounded-2xl rounded-tr-none p-3 max-w-[85%]">
                  <p class="text-sm text-dashboard-text">{{ message.content }}</p>
                </div>
                <div class="w-8 h-8 rounded-lg bg-dashboard-dark flex items-center justify-center flex-shrink-0">
                  <span class="text-lg">👤</span>
                </div>
              </div>
              
              <!-- AI回复 -->
              <div v-else class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <span class="text-lg">🤖</span>
                </div>
                <div class="flex-1 bg-dashboard-dark/50 rounded-2xl rounded-tl-none p-3">
                  <div v-html="message.content" class="text-sm text-dashboard-text prose prose-sm prose-invert max-w-none"></div>
                  
                  <!-- 快捷操作按钮 -->
                  <div v-if="message.actions" class="mt-3 flex gap-2">
                    <button 
                      v-for="action in message.actions" 
                      :key="action.label"
                      @click="handleActionClick(action)"
                      class="px-3 py-1.5 text-xs rounded-lg bg-dashboard-dark border border-dashboard-border text-dashboard-muted hover:text-dashboard-text hover:border-primary-500/50 transition-all"
                    >
                      {{ action.label }}
                    </button>
                  </div>
                </div>
              </div>
            </template>
            
            <!-- 加载状态 -->
            <div v-if="isLoading" class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                <span class="text-lg">🤖</span>
              </div>
              <div class="flex-1 bg-dashboard-dark/50 rounded-2xl rounded-tl-none p-3">
                <div class="flex items-center gap-2 text-sm text-dashboard-muted">
                  <span class="animate-bounce">●</span>
                  <span class="animate-bounce delay-100">●</span>
                  <span class="animate-bounce delay-200">●</span>
                  <span class="ml-2">正在分析中...</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 输入区域 -->
          <div class="p-4 border-t border-dashboard-border bg-dashboard-dark/30">
            <div class="flex items-center gap-2">
              <div class="flex-1 relative">
                <input
                  v-model="userInput"
                  @keypress.enter="sendMessage"
                  type="text"
                  placeholder="输入您的问题..."
                  class="w-full bg-dashboard-dark/50 border border-dashboard-border rounded-xl px-4 py-3 pr-12 text-sm text-dashboard-text placeholder-dashboard-muted focus:outline-none focus:border-primary-500/50 transition-colors"
                />
                <button 
                  v-if="userInput"
                  @click="userInput = ''"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-dashboard-muted hover:text-dashboard-text"
                >
                  ✕
                </button>
              </div>
              <button 
                @click="sendMessage"
                :disabled="!userInput.trim() || isLoading"
                class="w-12 h-12 rounded-xl bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="text-xl">发送</span>
              </button>
            </div>
            <p class="text-xs text-dashboard-muted mt-2 text-center">
              支持自然语言查询，如 "华东区本月报单收入"
            </p>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible'])

const userInput = ref('')
const isLoading = ref(false)
const chatContainer = ref(null)

const suggestions = [
  '华南区上周的植物干细胞销售收入',
  '对比钻石和华旗体系本月报单人数趋势',
  '新人经营率未达标的原因分析'
]

const chatHistory = reactive([])

// 模拟AI响应
const mockResponses = {
  '华南区上周的植物干细胞销售收入': {
    content: `
      <p class="font-medium text-dashboard-text mb-2">华南区 | 植物干细胞 | 上周</p>
      <div class="bg-dashboard-dark/50 rounded-lg p-3 mb-3">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-dashboard-muted">销售收入</p>
            <p class="text-xl font-bold text-primary-400">¥128.5万</p>
          </div>
          <div>
            <p class="text-xs text-dashboard-muted">目标达成率</p>
            <p class="text-xl font-bold text-status-yellow">85.3%</p>
          </div>
        </div>
        <div class="mt-2 text-xs text-dashboard-muted">
          环比: <span class="text-status-red">-8.2%</span>
        </div>
      </div>
      <p class="text-xs text-dashboard-muted">
        💡 分析：华南区植物干细胞收入低于目标14.7%，主要受市场活动执行率下降影响。
      </p>
    `,
    actions: [
      { label: '查看趋势图', action: 'viewTrend' },
      { label: '对比其他区域', action: 'compare' },
      { label: '创建改进任务', action: 'createTask' }
    ]
  },
  '对比钻石和华旗体系本月报单人数趋势': {
    content: `
      <p class="font-medium text-dashboard-text mb-2">钻石体系 vs 华旗体系 | 本月报单人数对比</p>
      <div class="bg-dashboard-dark/50 rounded-lg p-3 mb-3">
        <table class="w-full text-xs">
          <tr class="text-dashboard-muted">
            <td></td>
            <td class="text-right">钻石体系</td>
            <td class="text-right">华旗体系</td>
          </tr>
          <tr class="text-dashboard-text">
            <td class="text-dashboard-muted">报单人数</td>
            <td class="text-right font-medium">8.5万</td>
            <td class="text-right font-medium">5.8万</td>
          </tr>
          <tr class="text-dashboard-text">
            <td class="text-dashboard-muted">达成率</td>
            <td class="text-right text-status-green">95.2%</td>
            <td class="text-right text-status-yellow">92.1%</td>
          </tr>
          <tr class="text-dashboard-text">
            <td class="text-dashboard-muted">环比变化</td>
            <td class="text-right text-status-green">+5.3%</td>
            <td class="text-right text-status-red">-2.1%</td>
          </tr>
        </table>
      </div>
      <p class="text-xs text-dashboard-muted">
        💡 分析：钻石体系表现优于华旗体系，建议参考钻石体系的培训赋能模式。
      </p>
    `,
    actions: [
      { label: '查看详情', action: 'viewDetail' },
      { label: '导出报告', action: 'export' }
    ]
  },
  '新人经营率未达标的原因分析': {
    content: `
      <p class="font-medium text-dashboard-text mb-2">新人经营率未达标原因分析</p>
      <div class="bg-dashboard-dark/50 rounded-lg p-3 mb-3 space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="text-dashboard-muted">当前值</span>
          <span class="text-status-red font-medium">72.3%</span>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-dashboard-muted">目标值</span>
          <span class="text-dashboard-text">85%</span>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-dashboard-muted">差距</span>
          <span class="text-status-red">-12.7%</span>
        </div>
      </div>
      <p class="font-medium text-dashboard-text mb-1">主要影响因素：</p>
      <ul class="text-xs text-dashboard-muted space-y-1 list-disc list-inside">
        <li>新人培训覆盖率仅68%（目标90%）</li>
        <li>团队帮扶机制落实率52%（目标80%）</li>
        <li>新人首月活动参与率下降8.5%</li>
      </ul>
      <div class="mt-3 p-2 bg-status-yellow/10 border border-status-yellow/30 rounded-lg">
        <p class="text-xs text-status-yellow">
          ⚠️ 建议：立即启动新人专项帮扶计划
        </p>
      </div>
    `,
    actions: [
      { label: '创建改进任务', action: 'createTask' },
      { label: '查看培训数据', action: 'viewTraining' }
    ]
  }
}

const handleClose = () => {
  emit('update:visible', false)
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return
  
  const question = userInput.value.trim()
  chatHistory.push({ role: 'user', content: question })
  userInput.value = ''
  isLoading.value = true
  
  // 模拟AI处理延迟
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // 查找匹配的预设响应
  let response = mockResponses[question]
  
  if (!response) {
    // 默认响应
    response = {
      content: `
        <p class="text-dashboard-text">我理解您想了解："<strong>${question}</strong>"</p>
        <p class="text-xs text-dashboard-muted mt-2">
          💡 请尝试更具体的查询，例如：<br/>
          • 指定区域：华南区、华东区<br/>
          • 指定时间：本周、本月、本季度<br/>
          • 指定指标：报单收入、利润达成率
        </p>
      `
    }
  }
  
  chatHistory.push({ role: 'assistant', ...response })
  isLoading.value = false
  
  // 滚动到底部
  setTimeout(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  }, 100)
}

const handleSuggestionClick = (suggestion) => {
  userInput.value = suggestion
  sendMessage()
}

const handleActionClick = (action) => {
  if (action.action === 'createTask') {
    alert('正在为您创建改进任务...')
  } else if (action.action === 'viewTrend') {
    alert('正在打开趋势图...')
  } else if (action.action === 'compare') {
    alert('正在打开对比视图...')
  } else if (action.action === 'export') {
    alert('正在导出报告...')
  } else {
    alert(`功能开发中: ${action.label}`)
  }
}

// 监听visible变化，滚动到底部
watch(() => props.visible, (val) => {
  if (val) {
    setTimeout(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      }
    }, 100)
  }
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.delay-100 {
  animation-delay: 0.1s;
}

.delay-200 {
  animation-delay: 0.2s;
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
