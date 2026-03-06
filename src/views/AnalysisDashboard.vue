<template>
  <div class="min-h-screen bg-dashboard-dark animate-fade-in">
    <div class="sticky top-0 z-20 glass-effect border-b border-dashboard-border">
      <div class="px-6 py-4 flex flex-col gap-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-dashboard-text tracking-wide">经营分析会</h2>
            <p class="text-xs text-dashboard-muted mt-1">自由组装数据的报告生成器（独立全屏页面）</p>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="toggleExportMenu"
              class="px-5 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-lg"
            >
              导出报告 (支持 PPT/PDF)
            </button>
            <button
              @click="$emit('exit')"
              class="px-3 py-2 rounded-lg border border-dashboard-border text-dashboard-muted hover:text-dashboard-text transition-colors"
            >
              返回驾驶舱
            </button>
          </div>
        </div>

        <div class="flex flex-wrap items-end gap-4">
          <label class="text-xs text-dashboard-muted">
            起始日期
            <input
              v-model="filters.startDate"
              type="date"
              class="mt-1 block bg-dashboard-dark/50 border border-dashboard-border rounded-lg px-3 py-1.5 text-sm text-dashboard-text focus:outline-none focus:border-primary-500/50"
            />
          </label>
          <label class="text-xs text-dashboard-muted">
            结束日期
            <input
              v-model="filters.endDate"
              type="date"
              class="mt-1 block bg-dashboard-dark/50 border border-dashboard-border rounded-lg px-3 py-1.5 text-sm text-dashboard-text focus:outline-none focus:border-primary-500/50"
            />
          </label>
          <label class="text-xs text-dashboard-muted">
            业务线
            <select
              v-model="filters.businessLine"
              class="mt-1 block bg-dashboard-dark/50 border border-dashboard-border rounded-lg px-3 py-1.5 text-sm text-dashboard-text focus:outline-none focus:border-primary-500/50 min-w-[150px]"
            >
              <option v-for="line in businessLines" :key="line.value" :value="line.value">
                {{ line.label }}
              </option>
            </select>
          </label>
          <div class="text-xs text-dashboard-muted">
            当前上下文：{{ dateRangeLabel }} | {{ currentBusinessLineLabel }}
          </div>
        </div>
      </div>
    </div>

    <main class="p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4">
      <!-- 图表卡片库 -->
      <aside class="gradient-border p-4 h-fit xl:sticky xl:top-40">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-dashboard-text">图表卡片库</h3>
          <span class="text-xs text-dashboard-muted">来自驾驶舱</span>
        </div>
        <div class="space-y-2 max-h-[55vh] overflow-auto pr-1">
          <div
            v-for="template in cardTemplates"
            :key="template.id"
            draggable="true"
            @dragstart="onDragStartLibrary(template.id)"
            class="bg-dashboard-dark/40 border border-dashboard-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary-500/40 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium text-dashboard-text">{{ template.title }}</div>
                <div class="text-xs text-dashboard-muted mt-0.5">{{ template.description }}</div>
              </div>
              <button
                @click="addCardToCanvas(template.id)"
                class="text-xs px-2 py-1 rounded bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors"
              >
                + 添加
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- 版面编排区 -->
      <section class="gradient-border p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-dashboard-text">报告版面编排区</h3>
          <span class="text-xs text-dashboard-muted">支持拖拽排序 / 增删卡片 / 切换宽度</span>
        </div>

        <div
          class="min-h-[56vh] rounded-lg border border-dashboard-border/60 bg-dashboard-dark/30 p-3"
          @dragover.prevent
          @drop="onDropAt(canvasCards.length)"
        >
          <div v-if="!canvasCards.length" class="h-56 flex items-center justify-center text-dashboard-muted text-sm border border-dashed border-dashboard-border rounded-lg">
            将左侧图表卡片拖拽到这里开始组装报告
          </div>

          <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <template v-for="(card, index) in canvasCards" :key="card.uid">
              <div
                class="h-2 rounded transition-colors"
                :class="dropIndex === index ? 'bg-primary-500/60' : 'bg-transparent'"
                @dragover.prevent="dropIndex = index"
                @drop="onDropAt(index)"
              ></div>

              <article
                draggable="true"
                @dragstart="onDragStartCanvas(index)"
                @dragover.prevent
                @drop="onDropAt(index)"
                class="bg-dashboard-dark/50 border border-dashboard-border rounded-lg p-3 cursor-move"
                :class="card.span === 2 ? 'xl:col-span-2' : ''"
              >
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <h4 class="text-sm font-semibold text-dashboard-text">{{ card.title }}</h4>
                    <p class="text-xs text-dashboard-muted mt-0.5">{{ card.description }}</p>
                  </div>
                  <div class="flex items-center gap-1">
                    <button
                      @click="toggleCardSpan(index)"
                      class="text-xs px-2 py-1 rounded bg-dashboard-dark border border-dashboard-border text-dashboard-muted hover:text-dashboard-text transition-colors"
                    >
                      {{ card.span === 2 ? '半宽' : '通栏' }}
                    </button>
                    <button
                      @click="removeCard(index)"
                      class="text-xs px-2 py-1 rounded bg-status-red/20 text-status-red hover:bg-status-red/30 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>

                <div class="mt-3 rounded-lg border border-dashboard-border/70 bg-dashboard-dark/40 p-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-dashboard-muted">{{ currentBusinessLineLabel }}</span>
                    <span class="text-xs text-primary-300">{{ card.mockMetric }}</span>
                  </div>
                  <div class="mt-2 h-20 flex items-end gap-1.5">
                    <span
                      v-for="(bar, idx) in card.mockBars"
                      :key="idx"
                      class="flex-1 rounded-sm"
                      :style="{
                        height: `${bar}%`,
                        background: idx % 3 === 0 ? '#22d3ee' : idx % 3 === 1 ? '#38bdf8' : '#6366f1'
                      }"
                    ></span>
                  </div>
                  <div class="mt-2 text-xs text-dashboard-muted">
                    {{ dateRangeLabel }} · 达成率 {{ card.mockRate }}
                  </div>
                </div>
              </article>
            </template>
          </div>
        </div>
      </section>
    </main>

    <div class="sticky bottom-0 z-20 border-t border-dashboard-border bg-dashboard-card/95 backdrop-blur px-4 py-3">
      <button
        @click="toggleExportMenu"
        class="w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-base font-semibold transition-colors shadow-lg"
      >
        导出报告 (支持 PPT/PDF)
      </button>
    </div>

    <div v-if="showExportMenu" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" @click="showExportMenu = false">
      <div class="w-[320px] bg-dashboard-card border border-dashboard-border rounded-xl p-4" @click.stop>
        <h4 class="text-sm font-semibold text-dashboard-text mb-3">选择导出格式</h4>
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="handleExport('PPT')"
            class="py-2 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors"
          >
            导出PPT
          </button>
          <button
            @click="handleExport('PDF')"
            class="py-2 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors"
          >
            导出PDF
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'

defineEmits(['exit'])

const businessLines = [
  { value: 'all', label: '全部业务线' },
  { value: 'diamond', label: '钻石体系' },
  { value: 'huaqi', label: '华旗体系' },
  { value: 'innovation', label: '创新业务' }
]

const cardTemplates = [
  { id: 'baodan-income', title: '报单收入趋势', description: '计划/实际/达成率组合图' },
  { id: 'online-income', title: '线上营销收入趋势', description: '多周期趋势追踪图' },
  { id: 'profit', title: '利润趋势', description: '利润计划达成跟踪图' },
  { id: 'customer-pie', title: '报单人数渠道构成', description: '客户来源饼图' },
  { id: 'alerts', title: '预警摘要', description: '复杂规则预警列表' },
  { id: 'overview', title: '经营概览指标', description: '核心 KPI 汇总卡片' }
]

const today = new Date()
const start = new Date()
start.setDate(today.getDate() - 29)

const toYmd = (date) => date.toISOString().split('T')[0]

const filters = reactive({
  startDate: toYmd(start),
  endDate: toYmd(today),
  businessLine: 'all'
})

const canvasCards = ref([])
const dragPayload = ref(null)
const dropIndex = ref(-1)
const showExportMenu = ref(false)

const currentBusinessLineLabel = computed(() => {
  return businessLines.find((line) => line.value === filters.businessLine)?.label || '全部业务线'
})

const dateRangeLabel = computed(() => `${filters.startDate} 至 ${filters.endDate}`)

const lineFactor = computed(() => {
  const map = { all: 1, diamond: 1.06, huaqi: 0.98, innovation: 1.12 }
  return map[filters.businessLine] || 1
})

const dayCount = computed(() => {
  const startDate = new Date(filters.startDate)
  const endDate = new Date(filters.endDate)
  const from = startDate <= endDate ? startDate : endDate
  const to = startDate <= endDate ? endDate : startDate
  const diff = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1
  return Math.max(7, Math.min(90, Number.isNaN(diff) ? 30 : diff))
})

const createCanvasCard = (templateId) => {
  const template = cardTemplates.find((item) => item.id === templateId)
  if (!template) return null
  const uid = `${template.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return {
    uid,
    templateId: template.id,
    title: template.title,
    description: template.description,
    span: 1,
    mockMetric: '',
    mockRate: '',
    mockBars: []
  }
}

const refreshCardMock = (card, index) => {
  const seed = Array.from(card.title).reduce((sum, char) => sum + char.charCodeAt(0), 0) + index
  const base = (65 + (seed % 24)) * lineFactor.value
  const bars = Array.from({ length: 12 }, (_, i) => {
    const wave = 10 * Math.sin((i + seed) / 2.7) + 6 * Math.cos((i + seed) / 4.4)
    const trend = (dayCount.value > 35 ? i * 0.45 : i * 0.2)
    return Math.max(22, Math.min(98, base + wave + trend))
  })

  const avg = bars.reduce((sum, item) => sum + item, 0) / bars.length
  const rate = Math.max(72, Math.min(126, avg + (seed % 7) - 3))

  card.mockBars = bars.map((item) => Number(item.toFixed(0)))
  card.mockRate = `${rate.toFixed(1)}%`
  card.mockMetric = `${Math.round((avg * 1.25 + 280) * 10)}万`
}

const refreshAllCards = () => {
  canvasCards.value.forEach((card, index) => refreshCardMock(card, index))
}

watch(
  () => [filters.startDate, filters.endDate, filters.businessLine, canvasCards.value.length],
  refreshAllCards,
  { immediate: true }
)

const addCardToCanvas = (templateId) => {
  const card = createCanvasCard(templateId)
  if (!card) return
  canvasCards.value.push(card)
  refreshAllCards()
}

const removeCard = (index) => {
  canvasCards.value.splice(index, 1)
}

const toggleCardSpan = (index) => {
  const card = canvasCards.value[index]
  if (!card) return
  card.span = card.span === 2 ? 1 : 2
}

const onDragStartLibrary = (templateId) => {
  dragPayload.value = { type: 'library', templateId }
}

const onDragStartCanvas = (index) => {
  dragPayload.value = { type: 'canvas', index }
}

const onDropAt = (targetIndex) => {
  if (!dragPayload.value) return
  if (dragPayload.value.type === 'library') {
    const card = createCanvasCard(dragPayload.value.templateId)
    if (!card) return
    canvasCards.value.splice(targetIndex, 0, card)
  } else if (dragPayload.value.type === 'canvas') {
    const sourceIndex = dragPayload.value.index
    if (sourceIndex === targetIndex || sourceIndex + 1 === targetIndex) {
      dragPayload.value = null
      dropIndex.value = -1
      return
    }
    const [moved] = canvasCards.value.splice(sourceIndex, 1)
    const adjustedIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
    canvasCards.value.splice(adjustedIndex, 0, moved)
  }
  dragPayload.value = null
  dropIndex.value = -1
  refreshAllCards()
}

const toggleExportMenu = () => {
  showExportMenu.value = !showExportMenu.value
}

const handleExport = (format) => {
  showExportMenu.value = false
  alert(`正在导出 ${format} 报告...\n\n时间范围：${dateRangeLabel.value}\n业务线：${currentBusinessLineLabel.value}\n版面卡片：${canvasCards.value.length} 个`)
}

// 初始化一组默认版面
addCardToCanvas('overview')
addCardToCanvas('baodan-income')
addCardToCanvas('profit')
</script>
