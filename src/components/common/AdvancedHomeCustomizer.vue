<template>
  <teleport to="body">
    <transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <!-- 左侧：组件库 -->
        <aside class="w-72 bg-dashboard-card border-r border-dashboard-border flex flex-col">
          <div class="p-4 border-b border-dashboard-border">
            <h3 class="text-base font-semibold text-dashboard-text">组件库</h3>
            <p class="text-xs text-dashboard-muted mt-1">拖拽组件到右侧画布</p>
          </div>

          <div class="flex-1 overflow-auto p-3 space-y-4">
            <!-- 布局容器 -->
            <div>
              <div class="text-xs text-dashboard-muted mb-2 flex items-center gap-2">
                <span>📦</span> 布局容器
              </div>
              <div class="space-y-2">
                <div
                  v-for="layout in layoutItems"
                  :key="layout.id"
                  draggable="true"
                  @dragstart="onDragStart({ type: 'layout', item: layout })"
                  class="bg-dashboard-dark/50 border border-dashboard-border rounded-lg p-2 cursor-grab hover:border-primary-500/40 transition-colors"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-lg">{{ layout.icon }}</span>
                    <div>
                      <div class="text-xs font-medium text-dashboard-text">{{ layout.name }}</div>
                      <div class="text-[10px] text-dashboard-muted">{{ layout.size }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 指标卡片 -->
            <div>
              <div class="text-xs text-dashboard-muted mb-2 flex items-center gap-2">
                <span>📊</span> 指标卡片
              </div>
              <div class="space-y-2">
                <div
                  v-for="metric in metricComponents"
                  :key="metric.id"
                  draggable="true"
                  @dragstart="onDragStart({ type: 'metric', item: metric })"
                  class="bg-dashboard-dark/50 border border-dashboard-border rounded-lg p-2 cursor-grab hover:border-primary-500/40 transition-colors"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-lg">{{ metric.icon }}</span>
                    <div>
                      <div class="text-xs font-medium text-dashboard-text">{{ metric.name }}</div>
                      <div class="text-[10px] text-dashboard-muted">{{ metric.description }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 图表组件 -->
            <div>
              <div class="text-xs text-dashboard-muted mb-2 flex items-center gap-2">
                <span>📈</span> 图表组件
              </div>
              <div class="space-y-2">
                <div
                  v-for="chart in chartComponents"
                  :key="chart.id"
                  draggable="true"
                  @dragstart="onDragStart({ type: 'chart', item: chart })"
                  class="bg-dashboard-dark/50 border border-dashboard-border rounded-lg p-2 cursor-grab hover:border-primary-500/40 transition-colors"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-lg">{{ chart.icon }}</span>
                    <div>
                      <div class="text-xs font-medium text-dashboard-text">{{ chart.name }}</div>
                      <div class="text-[10px] text-dashboard-muted">{{ chart.size }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- 右侧：布局编辑器 -->
        <div class="flex-1 flex flex-col">
          <!-- 顶部工具栏 -->
          <header class="h-14 bg-dashboard-card/95 border-b border-dashboard-border flex items-center justify-between px-4">
            <div class="flex items-center gap-3">
              <h2 class="text-base font-semibold text-dashboard-text">自定义首页</h2>
              <span class="text-xs text-dashboard-muted">网格：{{ gridCols }} × {{ gridRows }}</span>
            </div>
            <div class="flex items-center gap-2">
              <!-- 网格大小调整 -->
              <div class="flex items-center gap-1 mr-4">
                <label class="text-xs text-dashboard-muted">列</label>
                <select v-model.number="gridCols" class="bg-dashboard-dark border border-dashboard-border rounded px-2 py-1 text-xs text-dashboard-text">
                  <option v-for="n in [2,3,4,6]" :key="n" :value="n">{{ n }}</option>
                </select>
                <label class="text-xs text-dashboard-muted ml-2">行</label>
                <select v-model.number="gridRows" class="bg-dashboard-dark border border-dashboard-border rounded px-2 py-1 text-xs text-dashboard-text">
                  <option v-for="n in [3,4,5,6,8,10]" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>

              <!-- 布局模板 -->
              <div class="relative">
                <button
                  @click="showTemplateMenu = !showTemplateMenu"
                  class="px-3 py-1.5 rounded-lg border border-dashboard-border text-sm text-dashboard-muted hover:text-dashboard-text transition-colors"
                >
                  📋 套用模板
                </button>
                <div
                  v-if="showTemplateMenu"
                  class="absolute top-full right-0 mt-1 w-48 bg-dashboard-card border border-dashboard-border rounded-lg shadow-xl z-10"
                >
                  <div
                    v-for="template in layoutTemplates"
                    :key="template.id"
                    @click="applyTemplate(template)"
                    class="px-3 py-2 text-sm text-dashboard-text hover:bg-primary-500/10 cursor-pointer"
                  >
                    {{ template.name }}
                  </div>
                </div>
              </div>

              <button
                @click="clearCanvas"
                class="px-3 py-1.5 rounded-lg border border-dashboard-border text-sm text-dashboard-muted hover:text-status-red transition-colors"
              >
                🗑️ 清空
              </button>
              <button
                @click="handleClose"
                class="px-3 py-1.5 rounded-lg border border-dashboard-border text-sm text-dashboard-muted hover:text-dashboard-text transition-colors"
              >
                取消
              </button>
              <button
                @click="handleSave"
                class="px-4 py-1.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
              >
                保存布局
              </button>
            </div>
          </header>

          <!-- 画布区域 -->
          <div class="flex-1 overflow-auto p-6 bg-dashboard-dark/30">
            <div
              ref="canvasRef"
              class="grid gap-3 min-h-full transition-all duration-300"
              :style="{
                gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${gridRows}, minmax(80px, 1fr))`
              }"
              @dragover.prevent
              @drop="onCanvasDrop"
            >
              <!-- 网格单元格 -->
              <div
                v-for="cell in gridCells"
                :key="cell.id"
                class="border border-dashed border-dashboard-border/40 rounded-lg relative transition-colors"
                :class="[
                  dropTargetCell === cell.id ? 'border-primary-500 bg-primary-500/10' : '',
                  isCellOccupied(cell.id) ? 'border-transparent' : ''
                ]"
                @dragover="onCellDragOver(cell.id)"
                @dragleave="dropTargetCell = null"
              >
                <!-- 空单元格 -->
                <div
                  v-if="!getPlacedItem(cell.id)"
                  class="absolute inset-0 flex items-center justify-center text-dashboard-muted/30 text-xs"
                >
                  {{ cell.col }},{{ cell.row }}
                </div>

                <!-- 已放置的组件 -->
                <div
                  v-else
                  class="absolute inset-0 p-2"
                  :style="getPlacedItemStyle(cell.id)"
                >
                  <div
                    class="h-full rounded-lg border transition-all cursor-move group"
                    :class="[
                      selectedCell === cell.id ? 'border-primary-500 shadow-lg' : 'border-dashboard-border',
                      getComponentCategory(getPlacedItem(cell.id)?.item) === 'metric' ? 'bg-dashboard-dark/60' : 'bg-dashboard-card/80'
                    ]"
                    :draggable="!isResizing"
                    @dragstart="onItemDragStart(cell.id, getPlacedItem(cell.id)?.item)"
                    @click.stop="selectedCell = cell.id"
                  >
                    <!-- 组件内容 -->
                    <div class="h-full flex flex-col">
                      <div class="flex items-center justify-between px-2 py-1 border-b border-dashboard-border/50">
                        <span class="text-xs font-medium text-dashboard-text truncate">
                          {{ getPlacedItem(cell.id)?.item?.name }}
                        </span>
                        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            @click.stop="openResizePanel(cell.id)"
                            class="p-0.5 rounded hover:bg-primary-500/20 text-dashboard-muted hover:text-primary-400"
                            title="调整尺寸"
                          >
                            ⛶
                          </button>
                          <button
                            @click.stop="removeItem(cell.id)"
                            class="p-0.5 rounded hover:bg-status-red/20 text-dashboard-muted hover:text-status-red"
                            title="删除"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div class="flex-1 flex items-center justify-center text-dashboard-muted/50 text-[10px]">
                        {{ getPlacedItem(cell.id)?.item?.size || `${getPlacedItem(cell.id)?.width}×${getPlacedItem(cell.id)?.height}` }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部：尺寸调整面板 -->
          <transition name="slide-up">
            <div
              v-if="resizePanelVisible"
              class="absolute bottom-0 left-72 right-0 bg-dashboard-card/95 border-t border-dashboard-border p-4"
            >
              <div class="flex items-center gap-6">
                <span class="text-sm text-dashboard-text">调整组件尺寸：</span>
                <div class="flex items-center gap-2">
                  <label class="text-xs text-dashboard-muted">宽度（格）</label>
                  <div class="flex items-center gap-1">
                    <button
                      v-for="w in [1,2,3,4]"
                      :key="w"
                      @click="setItemSize('width', w)"
                      class="w-8 h-8 rounded border text-xs transition-colors"
                      :class="resizeItem?.width === w ? 'border-primary-500 bg-primary-500/20 text-primary-400' : 'border-dashboard-border text-dashboard-muted hover:border-primary-500/40'"
                    >
                      {{ w }}
                    </button>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <label class="text-xs text-dashboard-muted">高度（格）</label>
                  <div class="flex items-center gap-1">
                    <button
                      v-for="h in [1,2,3,4,5]"
                      :key="h"
                      @click="setItemSize('height', h)"
                      class="w-8 h-8 rounded border text-xs transition-colors"
                      :class="resizeItem?.height === h ? 'border-primary-500 bg-primary-500/20 text-primary-400' : 'border-dashboard-border text-dashboard-muted hover:border-primary-500/40'"
                    >
                      {{ h }}
                    </button>
                  </div>
                </div>
                <button
                  @click="closeResizePanel"
                  class="ml-auto px-3 py-1.5 rounded bg-primary-500 text-white text-xs"
                >
                  完成
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { cloneHomeLayout, defaultHomeLayout } from '../../utils/homeLayout'

const props = defineProps({
  visible: Boolean,
  initialLayout: {
    type: Object,
    default: () => cloneHomeLayout(defaultHomeLayout)
  }
})

const emit = defineEmits(['update:visible', 'saved'])

// 网格配置
const gridCols = ref(4)
const gridRows = ref(5)
const canvasRef = ref(null)

// 拖拽状态
const dragPayload = ref(null)
const dropTargetCell = ref(null)
const selectedCell = ref(null)
const isResizing = ref(false)
const resizePanelVisible = ref(false)
const resizeItem = ref(null)
const resizeCellId = ref(null)
const showTemplateMenu = ref(false)

// 已放置的组件
const placedItems = ref([])

// 布局容器
const layoutItems = [
  { id: 'container-full', name: '通栏容器', icon: '📋', size: '4×1', defaultWidth: 4, defaultHeight: 1 },
  { id: 'container-half', name: '半宽容器', icon: '📄', size: '2×1', defaultWidth: 2, defaultHeight: 1 },
  { id: 'container-card', name: '卡片容器', icon: '🃏', size: '1×1', defaultWidth: 1, defaultHeight: 1 },
  { id: 'container-large', name: '大卡片', icon: '📦', size: '2×2', defaultWidth: 2, defaultHeight: 2 }
]

// 指标卡片组件
const metricComponents = [
  { id: 'metric-overview', name: '经营概览', icon: '📊', component: 'BSCOverview', description: 'BSC四维度', defaultWidth: 4, defaultHeight: 2 },
  { id: 'metric-finance', name: '核心财务指标', icon: '💰', component: 'CoreFinanceCards', description: '报单/利润/费用', defaultWidth: 4, defaultHeight: 3 },
  { id: 'metric-customer', name: '核心客户指标', icon: '👥', component: 'CoreCustomerMetrics', description: '客户数据', defaultWidth: 2, defaultHeight: 2 },
  { id: 'metric-kpi', name: 'KPI指标卡', icon: '📈', component: 'KpiCard', description: '单指标展示', defaultWidth: 2, defaultHeight: 2 },
  { id: 'metric-region', name: '区域排名', icon: '🏆', component: 'RegionCompletionRank', description: '区域达成', defaultWidth: 2, defaultHeight: 2 }
]

// 图表组件
const chartComponents = [
  { id: 'chart-combo', name: '组合柱状图', icon: '📊', component: 'ComboBarChart', size: '2×2', defaultWidth: 2, defaultHeight: 2 },
  { id: 'chart-funnel', name: '营销漏斗', icon: '🔻', component: 'MarketingFunnelChart', size: '1×2', defaultWidth: 1, defaultHeight: 2 },
  { id: 'chart-radar', name: '流程雷达', icon: '🎯', component: 'ProcessRadar', size: '2×2', defaultWidth: 2, defaultHeight: 2 },
  { id: 'chart-alert', name: '预警中心', icon: '🔔', component: 'AlertCenter', size: '2×2', defaultWidth: 2, defaultHeight: 2 },
  { id: 'chart-trend', name: '迷你趋势图', icon: '📉', component: 'MiniTrendChart', size: '1×1', defaultWidth: 1, defaultHeight: 1 }
]

const availableComponents = [...layoutItems, ...metricComponents, ...chartComponents]

// 布局模板
const layoutTemplates = [
  {
    id: 'default',
    name: '🎯 默认布局',
    grid: { cols: 4, rows: 6 },
    items: [
      { cellId: '0,0', item: metricComponents[0], width: 4, height: 1 },
      { cellId: '0,1', item: metricComponents[1], width: 4, height: 3 },
      { cellId: '0,4', item: metricComponents[2], width: 2, height: 2 },
      { cellId: '2,4', item: chartComponents[3], width: 2, height: 2 }
    ]
  },
  {
    id: 'compact',
    name: '📱 紧凑布局',
    grid: { cols: 3, rows: 4 },
    items: [
      { cellId: '0,0', item: metricComponents[0], width: 3, height: 1 },
      { cellId: '0,1', item: metricComponents[1], width: 3, height: 2 },
      { cellId: '0,3', item: metricComponents[2], width: 2, height: 1 },
      { cellId: '2,3', item: chartComponents[4], width: 1, height: 1 }
    ]
  },
  {
    id: 'focus',
    name: '🔍 专注模式',
    grid: { cols: 2, rows: 3 },
    items: [
      { cellId: '0,0', item: metricComponents[1], width: 2, height: 2 },
      { cellId: '0,2', item: metricComponents[2], width: 1, height: 1 },
      { cellId: '1,2', item: chartComponents[3], width: 1, height: 1 }
    ]
  },
  {
    id: 'dashboard',
    name: '🖥️ 完整驾驶舱',
    grid: { cols: 4, rows: 6 },
    items: [
      { cellId: '0,0', item: metricComponents[0], width: 4, height: 1 },
      { cellId: '0,1', item: metricComponents[1], width: 4, height: 2 },
      { cellId: '0,3', item: metricComponents[2], width: 2, height: 2 },
      { cellId: '2,3', item: chartComponents[3], width: 2, height: 2 },
      { cellId: '0,5', item: chartComponents[4], width: 1, height: 1 },
      { cellId: '1,5', item: chartComponents[4], width: 1, height: 1 },
      { cellId: '2,5', item: chartComponents[4], width: 1, height: 1 },
      { cellId: '3,5', item: chartComponents[4], width: 1, height: 1 }
    ]
  }
]

// 计算网格单元格
const gridCells = computed(() => {
  const cells = []
  for (let row = 0; row < gridRows.value; row++) {
    for (let col = 0; col < gridCols.value; col++) {
      cells.push({
        id: `${col},${row}`,
        col,
        row
      })
    }
  }
  return cells
})

// 检查单元格是否被占用
const isCellOccupied = (cellId) => {
  const [col, row] = cellId.split(',').map(Number)
  return placedItems.value.some(item => {
    const [itemCol, itemRow] = item.cellId.split(',').map(Number)
    return col >= itemCol && col < itemCol + item.width &&
           row >= itemRow && row < itemRow + item.height
  })
}

// 获取单元格中的组件
const getPlacedItem = (cellId) => {
  const [col, row] = cellId.split(',').map(Number)
  return placedItems.value.find(item => {
    const [itemCol, itemRow] = item.cellId.split(',').map(Number)
    return col === itemCol && row === itemRow
  })
}

// 获取组件类别
const getComponentCategory = (item) => {
  if (metricComponents.some(m => m.id === item?.id)) return 'metric'
  if (chartComponents.some(c => c.id === item?.id)) return 'chart'
  return 'layout'
}

// 获取组件样式（用于跨格显示）
const getPlacedItemStyle = (cellId) => {
  const item = placedItems.value.find(placed => placed.cellId === cellId)
  if (!item) return {}
  return {
    gridColumn: `span ${item.width}`,
    gridRow: `span ${item.height}`
  }
}

// 拖拽开始
const onDragStart = (payload) => {
  dragPayload.value = payload
}

// 单元格拖拽悬停
const onCellDragOver = (cellId) => {
  if (!isCellOccupied(cellId)) {
    dropTargetCell.value = cellId
  }
}

// 画布放置
const onCanvasDrop = (event) => {
  if (!dragPayload.value || !dropTargetCell.value) return

  const item = dragPayload.value.item
  const cellId = dropTargetCell.value
  const sourceCellId = dragPayload.value.type === 'reorder' ? dragPayload.value.cellId : null
  const sourceItem = sourceCellId ? placedItems.value.find(placed => placed.cellId === sourceCellId) : null

  // 检查是否有足够空间
  const [col, row] = cellId.split(',').map(Number)
  const width = sourceItem?.width || item.defaultWidth || 1
  const height = sourceItem?.height || item.defaultHeight || 1

  // 检查是否超出边界
  if (col + width > gridCols.value || row + height > gridRows.value) {
    return
  }

  // 检查是否与其他组件重叠
  const hasOverlap = placedItems.value.some(placed => {
    if (placed.cellId === sourceCellId) return false
    const [pCol, pRow] = placed.cellId.split(',').map(Number)
    return !(col + width <= pCol || col >= pCol + placed.width ||
             row + height <= pRow || row >= pRow + placed.height)
  })

  if (!hasOverlap) {
    if (sourceItem) {
      sourceItem.cellId = cellId
      sourceItem.width = width
      sourceItem.height = height
    } else {
      placedItems.value.push({
        cellId,
        item,
        width,
        height
      })
    }
  }

  dragPayload.value = null
  dropTargetCell.value = null
}

// 组件拖拽开始（重新排列）
const onItemDragStart = (cellId, item) => {
  if (isResizing.value) return
  dragPayload.value = { type: 'reorder', cellId, item }
}

// 删除组件
const removeItem = (cellId) => {
  const index = placedItems.value.findIndex(p => p.cellId === cellId)
  if (index > -1) {
    placedItems.value.splice(index, 1)
  }
  if (selectedCell.value === cellId) {
    selectedCell.value = null
  }
}

// 打开尺寸调整面板
const openResizePanel = (cellId) => {
  const item = placedItems.value.find(p => p.cellId === cellId)
  if (item) {
    resizeCellId.value = cellId
    resizeItem.value = { width: item.width, height: item.height }
    resizePanelVisible.value = true
    isResizing.value = true
  }
}

// 设置组件尺寸
const setItemSize = (dimension, value) => {
  if (!resizeCellId.value) return

  const item = placedItems.value.find(p => p.cellId === resizeCellId.value)
  if (!item) return

  const [col, row] = resizeCellId.value.split(',').map(Number)
  const newWidth = dimension === 'width' ? value : item.width
  const newHeight = dimension === 'height' ? value : item.height

  // 检查是否超出边界
  if (col + newWidth > gridCols.value || row + newHeight > gridRows.value) {
    return
  }

  // 检查是否与其他组件重叠（排除自身）
  const hasOverlap = placedItems.value.some(placed => {
    if (placed.cellId === resizeCellId.value) return false
    const [pCol, pRow] = placed.cellId.split(',').map(Number)
    return !(col + newWidth <= pCol || col >= pCol + placed.width ||
             row + newHeight <= pRow || row >= pRow + placed.height)
  })

  if (!hasOverlap) {
    item.width = newWidth
    item.height = newHeight
    resizeItem.value = { width: newWidth, height: newHeight }
  }
}

// 应用模板
const applyTemplate = (template) => {
  gridCols.value = template.grid.cols
  gridRows.value = template.grid.rows
  placedItems.value = template.items.map(item => ({
    cellId: item.cellId,
    item: item.item,
    width: item.width,
    height: item.height
  }))
  showTemplateMenu.value = false
}

const closeResizePanel = () => {
  resizePanelVisible.value = false
  resizeItem.value = null
  resizeCellId.value = null
  isResizing.value = false
}

// 清空画布
const clearCanvas = () => {
  placedItems.value = []
  selectedCell.value = null
  closeResizePanel()
}

const resolveLibraryItem = (item) => {
  if (item?.id) return item

  const matchedItem = availableComponents.find(component => component.id === item?.componentId)
  if (matchedItem) return matchedItem

  return {
    id: item?.componentId || `custom-${item?.cellId}`,
    name: item?.componentName || '未命名组件',
    component: item?.component,
    size: `${item?.width || 1}×${item?.height || 1}`,
    defaultWidth: item?.width || 1,
    defaultHeight: item?.height || 1
  }
}

const hydrateLayout = (layout) => {
  const safeLayout = layout?.items?.length ? cloneHomeLayout(layout) : cloneHomeLayout(defaultHomeLayout)

  gridCols.value = safeLayout.grid?.cols || defaultHomeLayout.grid.cols
  gridRows.value = safeLayout.grid?.rows || defaultHomeLayout.grid.rows
  placedItems.value = safeLayout.items.map(item => ({
    cellId: item.cellId,
    item: resolveLibraryItem(item.item || item),
    width: item.width || item.item?.defaultWidth || 1,
    height: item.height || item.item?.defaultHeight || 1
  }))

  selectedCell.value = null
  closeResizePanel()
  dropTargetCell.value = null
  dragPayload.value = null
  showTemplateMenu.value = false
}

// 关闭面板
const handleClose = () => {
  closeResizePanel()
  showTemplateMenu.value = false
  emit('update:visible', false)
}

// 保存布局
const handleSave = () => {
  const layout = {
    grid: { cols: gridCols.value, rows: gridRows.value },
    items: placedItems.value.map(item => ({
      cellId: item.cellId,
      componentId: item.item?.id,
      componentName: item.item?.name,
      component: item.item?.component,
      width: item.width,
      height: item.height
    }))
  }
  emit('saved', layout)
  handleClose()
}

// 初始化
watch(() => props.visible, (visible) => {
  if (visible) {
    hydrateLayout(props.initialLayout)
  }
})
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

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.2s ease;
}

.slide-up-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
