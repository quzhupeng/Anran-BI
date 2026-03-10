<template>
  <div class="min-h-screen bg-dashboard-dark flex flex-col" :class="presentationMode ? 'fixed inset-0 z-50' : ''">
    <!-- 顶部操作栏 -->
    <div class="sticky top-0 z-20 glass-effect border-b border-dashboard-border">
      <div class="px-6 py-3 flex flex-col gap-3">
        <!-- 第一行：标题和主要操作 -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-semibold text-dashboard-text tracking-wide">经营分析会</h2>
            <!-- 会议模板选择器 -->
            <div class="relative">
              <button
                @click="showTemplateSelector = !showTemplateSelector"
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashboard-border text-sm text-dashboard-muted hover:text-dashboard-text transition-colors"
              >
                <span>📋</span>
                {{ currentTemplate?.name || '选择模板' }}
                <span class="text-xs">▼</span>
              </button>
              <div
                v-if="showTemplateSelector"
                class="absolute top-full left-0 mt-1 w-64 bg-dashboard-card border border-dashboard-border rounded-lg shadow-xl z-10"
              >
                <div
                  v-for="template in meetingTemplates"
                  :key="template.id"
                  @click="selectTemplate(template)"
                  class="px-4 py-3 cursor-pointer hover:bg-primary-500/10 border-b border-dashboard-border/50 last:border-0"
                >
                  <div class="text-sm font-medium text-dashboard-text">{{ template.name }}</div>
                  <div class="text-xs text-dashboard-muted mt-0.5">{{ template.description }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- 演讲模式 -->
            <button
              @click="togglePresentationMode"
              class="px-3 py-1.5 rounded-lg text-sm transition-colors"
              :class="presentationMode ? 'bg-primary-500 text-white' : 'border border-dashboard-border text-dashboard-muted hover:text-dashboard-text'"
            >
              🎤 演讲模式
            </button>

            <!-- 智能洞察 -->
            <button
              @click="showInsightPanel = !showInsightPanel"
              class="px-3 py-1.5 rounded-lg text-sm transition-colors"
              :class="showInsightPanel ? 'bg-primary-500 text-white' : 'border border-dashboard-border text-dashboard-muted hover:text-dashboard-text'"
            >
              💡 智能洞察
            </button>

            <!-- 会议纪要 -->
            <button
              @click="showMeetingNotes = !showMeetingNotes"
              class="px-3 py-1.5 rounded-lg text-sm transition-colors"
              :class="showMeetingNotes ? 'bg-primary-500 text-white' : 'border border-dashboard-border text-dashboard-muted hover:text-dashboard-text'"
            >
              📝 会议纪要
            </button>

            <!-- 报告概览 -->
            <button
              @click="generateMeetingMinutes"
              class="px-3 py-1.5 rounded-lg border border-dashboard-border text-sm text-dashboard-muted hover:text-dashboard-text transition-colors"
            >
              📋 报告概览
            </button>

            <!-- 导出报告 -->
            <button
              @click="showExportModal = true"
              class="px-4 py-1.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              导出报告
            </button>

            <!-- 退出 -->
            <button
              v-if="!presentationMode"
              @click="$emit('exit')"
              class="px-3 py-1.5 rounded-lg border border-dashboard-border text-sm text-dashboard-muted hover:text-dashboard-text transition-colors"
            >
              返回驾驶舱
            </button>
          </div>
        </div>

        <!-- 第二行：筛选条件和周期对比 -->
        <div class="flex flex-wrap items-end gap-4">
          <label class="text-xs text-dashboard-muted">
            起始日期
            <input
              v-model="analysisContext.startDate"
              type="date"
              class="mt-1 block bg-dashboard-dark/50 border border-dashboard-border rounded-lg px-3 py-1.5 text-sm text-dashboard-text focus:outline-none focus:border-primary-500/50"
            />
          </label>
          <label class="text-xs text-dashboard-muted">
            结束日期
            <input
              v-model="analysisContext.endDate"
              type="date"
              class="mt-1 block bg-dashboard-dark/50 border border-dashboard-border rounded-lg px-3 py-1.5 text-sm text-dashboard-text focus:outline-none focus:border-primary-500/50"
            />
          </label>
          <label class="text-xs text-dashboard-muted">
            业务线
            <select
              v-model="analysisContext.businessLine"
              class="mt-1 block bg-dashboard-dark/50 border border-dashboard-border rounded-lg px-3 py-1.5 text-sm text-dashboard-text focus:outline-none focus:border-primary-500/50 min-w-[150px]"
            >
              <option v-for="line in businessLines" :key="line.value" :value="line.value">
                {{ line.label }}
              </option>
            </select>
          </label>

          <!-- 周期对比 -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-dashboard-muted">周期对比：</span>
            <button
              v-for="period in comparePeriods"
              :key="period.value"
              @click="toggleCompare(period.value)"
              class="px-2 py-1 rounded text-xs transition-colors"
              :class="analysisContext.comparePeriods.includes(period.value) ? 'bg-primary-500/25 text-primary-300' : 'bg-dashboard-dark border border-dashboard-border text-dashboard-muted hover:text-dashboard-text'"
            >
              {{ period.label }}
            </button>
          </div>

          <div class="text-xs text-dashboard-muted ml-auto">
            {{ currentTemplate?.name }} · {{ dateRangeLabel }} · {{ currentBusinessLineLabel }}
          </div>
        </div>
      </div>
    </div>

    <!-- 会议纪要浮动面板 -->
    <transition name="slide-down">
      <div v-if="showMeetingNotes" class="sticky top-[120px] z-15 border-b border-primary-500/30 bg-dashboard-card/95 backdrop-blur-sm shadow-lg">
        <div class="px-6 py-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-base">📝</span>
              <h3 class="text-sm font-semibold text-dashboard-text">会议纪要</h3>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300">
                {{ meetingNotesTasks.length + meetingNotesReminders.length }} 条记录
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="dispatchAllMeetingNotes"
                class="px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-medium hover:bg-primary-600 transition-colors"
              >
                ✉️ 一键派发
              </button>
              <button
                @click="showMeetingNotes = false"
                class="w-7 h-7 flex items-center justify-center rounded text-dashboard-muted hover:text-dashboard-text hover:bg-dashboard-dark/40 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- 任务板块 -->
            <div class="bg-dashboard-dark/40 rounded-lg p-3 border border-dashboard-border">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-primary-400"></span>
                  <span class="text-xs font-semibold text-dashboard-text">任务</span>
                  <span class="text-[10px] text-dashboard-muted">（{{ meetingNotesTasks.length }}）</span>
                </div>
                <button
                  @click="addMeetingNotesTask"
                  class="text-[10px] px-1.5 py-0.5 rounded border border-primary-500/30 text-primary-300 hover:bg-primary-500/10 transition-colors"
                >
                  + 新增
                </button>
              </div>
              <div class="space-y-2 max-h-[180px] overflow-y-auto">
                <div
                  v-for="(task, tIdx) in meetingNotesTasks"
                  :key="tIdx"
                  class="rounded border border-dashboard-border/60 bg-dashboard-dark/50 p-2 text-xs"
                >
                  <div class="flex items-start gap-2">
                    <span class="flex-shrink-0 mt-0.5 text-[10px] font-bold text-primary-300">T{{ tIdx + 1 }}</span>
                    <div class="flex-1 space-y-1.5">
                      <input
                        v-model="task.content"
                        placeholder="任务内容..."
                        class="w-full bg-transparent border-b border-dashboard-border/40 text-dashboard-text placeholder-dashboard-muted/50 focus:outline-none focus:border-primary-500/50 pb-0.5 text-xs"
                      />
                      <div class="flex items-center gap-2">
                        <input
                          v-model="task.owner"
                          placeholder="责任人"
                          class="w-20 bg-transparent border-b border-dashboard-border/40 text-primary-300 placeholder-dashboard-muted/50 focus:outline-none focus:border-primary-500/50 pb-0.5 text-[10px]"
                        />
                        <input
                          v-model="task.deadline"
                          type="date"
                          class="bg-transparent border-b border-dashboard-border/40 text-dashboard-muted focus:outline-none focus:border-primary-500/50 pb-0.5 text-[10px]"
                        />
                      </div>
                    </div>
                    <button
                      @click="meetingNotesTasks.splice(tIdx, 1)"
                      class="flex-shrink-0 text-dashboard-muted hover:text-status-red text-[10px]"
                    >✕</button>
                  </div>
                </div>
                <div v-if="meetingNotesTasks.length === 0" class="text-center py-3 text-[10px] text-dashboard-muted">
                  暂无任务，点击"+ 新增"添加
                </div>
              </div>
            </div>

            <!-- 提醒项板块 -->
            <div class="bg-dashboard-dark/40 rounded-lg p-3 border border-dashboard-border">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-status-yellow"></span>
                  <span class="text-xs font-semibold text-dashboard-text">提醒项</span>
                  <span class="text-[10px] text-dashboard-muted">（{{ meetingNotesReminders.length }}）</span>
                </div>
                <button
                  @click="addMeetingNotesReminder"
                  class="text-[10px] px-1.5 py-0.5 rounded border border-status-yellow/30 text-status-yellow hover:bg-status-yellow/10 transition-colors"
                >
                  + 新增
                </button>
              </div>
              <div class="space-y-2 max-h-[180px] overflow-y-auto">
                <div
                  v-for="(reminder, rIdx) in meetingNotesReminders"
                  :key="rIdx"
                  class="rounded border border-dashboard-border/60 bg-dashboard-dark/50 p-2 text-xs"
                >
                  <div class="flex items-start gap-2">
                    <span class="flex-shrink-0 mt-0.5 text-[10px] font-bold text-status-yellow">R{{ rIdx + 1 }}</span>
                    <div class="flex-1 space-y-1.5">
                      <input
                        v-model="reminder.content"
                        placeholder="提醒事项..."
                        class="w-full bg-transparent border-b border-dashboard-border/40 text-dashboard-text placeholder-dashboard-muted/50 focus:outline-none focus:border-primary-500/50 pb-0.5 text-xs"
                      />
                      <input
                        v-model="reminder.target"
                        placeholder="提醒对象（部门/人员）"
                        class="w-full bg-transparent border-b border-dashboard-border/40 text-primary-300 placeholder-dashboard-muted/50 focus:outline-none focus:border-primary-500/50 pb-0.5 text-[10px]"
                      />
                    </div>
                    <button
                      @click="meetingNotesReminders.splice(rIdx, 1)"
                      class="flex-shrink-0 text-dashboard-muted hover:text-status-red text-[10px]"
                    >✕</button>
                  </div>
                </div>
                <div v-if="meetingNotesReminders.length === 0" class="text-center py-3 text-[10px] text-dashboard-muted">
                  暂无提醒项，点击"+ 新增"添加
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 主内容区 -->
    <main class="flex-1 flex">
      <!-- 指标卡片库（侧边栏） - 固定不动 -->
      <aside
        v-if="!presentationMode"
        class="w-72 flex-shrink-0 border-r border-dashboard-border overflow-y-auto sticky top-[120px] self-start max-h-[calc(100vh-120px)]"
        :class="showInsightPanel ? 'bg-dashboard-card/50' : 'bg-dashboard-card'"
      >
        <!-- 固定标题 -->
        <div class="p-4 border-b border-dashboard-border sticky top-0 z-10 bg-dashboard-card/95 backdrop-blur-sm">
          <h3 class="text-sm font-semibold text-dashboard-text">指标导航</h3>
          <p class="text-xs text-dashboard-muted mt-0.5">点击快速跳转到对应分析</p>
        </div>

        <!-- 指标快速跳转 -->
        <div class="p-3 space-y-1 border-b border-dashboard-border">
          <div class="text-[10px] text-dashboard-muted uppercase tracking-wider mb-2">分析流程</div>
          <button
            @click="scrollToSection('pdca-tracking')"
            class="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-primary-500/10 text-primary-400 hover:text-primary-300 transition-colors"
          >
            🔄 任务追踪
          </button>
          <button
            @click="scrollToSection('scorecard')"
            class="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-primary-500/10 text-dashboard-muted hover:text-dashboard-text transition-colors"
          >
            📋 经营情况概览
          </button>
        </div>

        <!-- 指标分析选择 -->
        <div class="p-3 space-y-1.5">
          <div class="flex items-center justify-between mb-1">
            <div class="text-[10px] text-dashboard-muted uppercase tracking-wider">指标分析选择</div>
            <span class="text-[10px] text-primary-300 font-medium">{{ visibleAnalysisIndicators.length }} 项已选</span>
          </div>
          <p class="text-[10px] text-dashboard-muted mb-2">点击切换指标在右侧分析中的显隐</p>

          <template v-for="(dimension, dimKey) in scorecardData" :key="dimKey">
            <div class="text-[10px] font-medium text-dashboard-muted mt-2.5 mb-1 px-1">
              {{ dimension.icon }} {{ dimension.name }}
            </div>
            <div
              v-for="row in dimension.rows"
              :key="row.id"
              class="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded cursor-pointer transition-all"
              :class="activeAnalysisIds.includes(row.id)
                ? 'bg-primary-500/10 hover:bg-primary-500/15'
                : 'opacity-40 hover:opacity-70 hover:bg-dashboard-dark/30'"
              @click="toggleAnalysisId(row.id)"
            >
              <span
                class="w-2 h-2 rounded-full flex-shrink-0"
                :class="{
                  'bg-status-red': row.status === 'red',
                  'bg-status-yellow': row.status === 'yellow',
                  'bg-status-green': row.status === 'green'
                }"
              ></span>
              <span
                class="truncate flex-1"
                :class="row.status === 'green' ? 'text-dashboard-muted' : (row.status === 'red' ? 'text-status-red' : 'text-status-yellow')"
              >
                {{ row.name }}
              </span>
              <span class="text-[10px] text-dashboard-muted">{{ row.rate }}%</span>
              <span
                class="text-[10px] w-4 text-center"
                :class="activeAnalysisIds.includes(row.id) ? 'text-status-green' : 'text-dashboard-muted'"
              >
                {{ activeAnalysisIds.includes(row.id) ? '✓' : '○' }}
              </span>
            </div>
          </template>
        </div>
      </aside>

      <!-- 报告画布 -->
      <section class="flex-1 p-4 lg:p-6 space-y-6 min-w-0">

        <!-- ==================== PDCA：上月任务追踪 ==================== -->
        <div data-section="pdca-tracking" class="rounded-lg border border-primary-500/20 bg-dashboard-dark/30 p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="text-lg">🔄</span>
              <h4 class="text-base font-semibold text-dashboard-text">任务追踪</h4>
            </div>
            <div class="flex items-center gap-3 text-xs">
              <span class="px-2 py-0.5 rounded-full bg-status-green/20 text-status-green">
                已完成 {{ pdcaStats.completed }}
              </span>
              <span class="px-2 py-0.5 rounded-full bg-status-yellow/20 text-status-yellow">
                部分完成 {{ pdcaStats.partial }}
              </span>
              <span class="px-2 py-0.5 rounded-full bg-status-red/20 text-status-red">
                未完成 {{ pdcaStats.uncompleted }}
              </span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead>
                <tr class="border-b border-dashboard-border">
                  <th class="text-left py-2 px-2 text-dashboard-muted font-medium">指标</th>
                  <th class="text-left py-2 px-2 text-dashboard-muted font-medium">上月整改动作</th>
                  <th class="text-left py-2 px-2 text-dashboard-muted font-medium">责任人</th>
                  <th class="text-left py-2 px-2 text-dashboard-muted font-medium">完成状态</th>
                  <th class="text-left py-2 px-2 text-dashboard-muted font-medium">执行结果</th>
                  <th class="text-center py-2 px-2 text-dashboard-muted font-medium">成效</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in lastMonthPdcaData"
                  :key="item.id"
                  class="border-b border-dashboard-border/40 hover:bg-dashboard-dark/30"
                >
                  <td class="py-2 px-2 text-dashboard-text font-medium">{{ item.indicator }}</td>
                  <td class="py-2 px-2 text-dashboard-muted max-w-[200px]">{{ item.action }}</td>
                  <td class="py-2 px-2 text-primary-300">{{ item.owner }}</td>
                  <td class="py-2 px-2">
                    <span
                      class="px-2 py-0.5 rounded-full text-[11px]"
                      :class="{
                        'bg-status-green/20 text-status-green': item.status === '已完成',
                        'bg-status-yellow/20 text-status-yellow': item.status === '部分完成',
                        'bg-status-red/20 text-status-red': item.status === '未完成'
                      }"
                    >
                      {{ item.status }}
                    </span>
                  </td>
                  <td class="py-2 px-2 text-dashboard-muted max-w-[260px]">{{ item.result }}</td>
                  <td class="py-2 px-2 text-center">
                    <span
                      class="inline-block w-2.5 h-2.5 rounded-full"
                      :class="{
                        'bg-status-green': item.effectiveness === 'high',
                        'bg-status-yellow': item.effectiveness === 'medium',
                        'bg-status-red': item.effectiveness === 'low'
                      }"
                      :title="{ high: '成效显著', medium: '有一定效果', low: '效果不佳' }[item.effectiveness]"
                    ></span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ==================== 总览：经营成绩单 ==================== -->
        <div data-section="scorecard" class="rounded-lg border border-dashboard-border/60 bg-dashboard-dark/30 p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="text-lg">📋</span>
              <h4 class="text-base font-semibold text-dashboard-text">经营情况概览</h4>
            </div>
            <span class="text-xs text-dashboard-muted">{{ dateRangeLabel }} · {{ currentBusinessLineLabel }}</span>
          </div>

          <!-- 成绩单表格 -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-dashboard-border">
                  <th class="text-left py-2 px-3 text-dashboard-muted font-medium">BSC维度</th>
                  <th class="text-left py-2 px-3 text-dashboard-muted font-medium">指标名称</th>
                  <th class="text-right py-2 px-3 text-dashboard-muted font-medium">当月目标</th>
                  <th class="text-right py-2 px-3 text-dashboard-muted font-medium">当月实际</th>
                  <th class="text-right py-2 px-3 text-dashboard-muted font-medium">当月达成率</th>
                  <th class="text-right py-2 px-3 text-dashboard-muted font-medium">累计目标</th>
                  <th class="text-right py-2 px-3 text-dashboard-muted font-medium">累计实际</th>
                  <th class="text-right py-2 px-3 text-dashboard-muted font-medium">累计达成率</th>
                  <th class="text-center py-2 px-3 text-dashboard-muted font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(dimension, dimKey) in scorecardData" :key="dimKey">
                  <tr
                    v-for="(row, rIdx) in dimension.rows"
                    :key="row.id"
                    class="border-b border-dashboard-border/40 hover:bg-dashboard-dark/30"
                    :class="row.isAbnormal ? 'bg-status-red/5' : ''"
                  >
                    <td v-if="rIdx === 0" :rowspan="dimension.rows.length" class="py-2 px-3 text-dashboard-text font-medium align-top border-r border-dashboard-border/30">
                      {{ dimension.icon }} {{ dimension.name }}
                    </td>
                    <td class="py-2 px-3 text-dashboard-text">{{ row.name }}</td>
                    <td class="py-2 px-3 text-right text-dashboard-muted">{{ row.targetStr }}</td>
                    <td class="py-2 px-3 text-right text-dashboard-text font-medium">{{ row.actualStr }}</td>
                    <td class="py-2 px-3 text-right font-semibold" :class="row.rateClass">{{ row.rate }}%</td>
                    <td class="py-2 px-3 text-right text-dashboard-muted">{{ row.accTargetStr }}</td>
                    <td class="py-2 px-3 text-right text-dashboard-text font-medium">{{ row.accActualStr }}</td>
                    <td class="py-2 px-3 text-right font-semibold" :class="row.accRateClass">{{ row.accRate }}%</td>
                    <td class="py-2 px-3 text-center">
                      <span
                        class="inline-block w-2.5 h-2.5 rounded-full"
                        :class="{
                          'bg-status-green': row.status === 'green',
                          'bg-status-yellow': row.status === 'yellow',
                          'bg-status-red status-pulse': row.status === 'red'
                        }"
                      ></span>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ==================== 分述：指标逐一分析 ==================== -->
        <div v-if="visibleAnalysisIndicators.length > 0" class="space-y-6">
          <div class="flex items-center gap-2">
            <span class="text-lg">🔍</span>
            <h4 class="text-base font-semibold text-dashboard-text">指标分析</h4>
            <span class="text-xs text-dashboard-muted">（共 {{ visibleAnalysisIndicators.length }} 项，可在左侧增减）</span>
          </div>

          <div
            v-for="item in visibleAnalysisIndicators"
            :key="item.id"
            :id="'indicator-' + item.id"
            class="rounded-lg border bg-dashboard-dark/30 overflow-hidden"
            :class="item.isNormal ? 'border-status-green/20' : 'border-status-red/20'"
          >
            <!-- ====== 达标指标：简化展示 ====== -->
            <template v-if="item.isNormal">
              <div class="px-5 py-3 bg-status-green/5 border-b border-status-green/20 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="w-2.5 h-2.5 rounded-full bg-status-green"></span>
                  <h5 class="text-sm font-semibold text-dashboard-text">{{ item.name }}</h5>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-status-green/20 text-status-green">
                    达成率 {{ item.rate }}%
                  </span>
                </div>
                <span class="text-xs text-dashboard-muted">{{ item.dimensionName }}</span>
              </div>
              <div class="p-5">
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-dashboard-dark/50 rounded-lg p-3 border border-dashboard-border">
                    <div class="text-xs text-dashboard-muted mb-1">当月数据</div>
                    <div class="flex items-baseline gap-2">
                      <span class="text-xl font-bold text-dashboard-text">{{ item.actualStr }}</span>
                      <span class="text-xs text-dashboard-muted">/ 目标 {{ item.targetStr }}</span>
                    </div>
                    <div class="text-xs mt-1 text-status-green">达成率 {{ item.rate }}%</div>
                  </div>
                  <div class="bg-dashboard-dark/50 rounded-lg p-3 border border-dashboard-border">
                    <div class="text-xs text-dashboard-muted mb-1">累计数据</div>
                    <div class="flex items-baseline gap-2">
                      <span class="text-xl font-bold text-dashboard-text">{{ item.accActualStr }}</span>
                      <span class="text-xs text-dashboard-muted">/ 目标 {{ item.accTargetStr }}</span>
                    </div>
                    <div class="text-xs mt-1" :class="item.accRateClass">达成率 {{ item.accRate }}%</div>
                  </div>
                </div>
                <div class="mt-3 text-center text-xs text-status-green py-2 rounded-lg bg-status-green/5 border border-status-green/10">
                  ✅ 该指标已达标，表现良好
                </div>
              </div>
            </template>

            <!-- ====== 异常指标：完整分析 ====== -->
            <template v-else>
              <!-- 指标标题 -->
              <div class="px-5 py-3 bg-status-red/5 border-b border-status-red/20 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="w-2.5 h-2.5 rounded-full bg-status-red status-pulse"></span>
                  <h5 class="text-sm font-semibold text-dashboard-text">{{ item.name }}</h5>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-status-red/20 text-status-red">
                    达成率 {{ item.rate }}%
                  </span>
                </div>
                <span class="text-xs text-dashboard-muted">{{ item.dimensionName }}</span>
              </div>

              <div class="p-5 space-y-4">
                <!-- 1. 数据概况 -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-dashboard-dark/50 rounded-lg p-3 border border-dashboard-border">
                    <div class="text-xs text-dashboard-muted mb-1">当月数据</div>
                    <div class="flex items-baseline gap-2">
                      <span class="text-xl font-bold text-dashboard-text">{{ item.actualStr }}</span>
                      <span class="text-xs text-dashboard-muted">/ 目标 {{ item.targetStr }}</span>
                    </div>
                    <div class="text-xs mt-1" :class="item.rateClass">达成率 {{ item.rate }}%，差距 {{ item.gapStr }}</div>
                  </div>
                  <div class="bg-dashboard-dark/50 rounded-lg p-3 border border-dashboard-border">
                    <div class="text-xs text-dashboard-muted mb-1">累计数据</div>
                    <div class="flex items-baseline gap-2">
                      <span class="text-xl font-bold text-dashboard-text">{{ item.accActualStr }}</span>
                      <span class="text-xs text-dashboard-muted">/ 目标 {{ item.accTargetStr }}</span>
                    </div>
                    <div class="text-xs mt-1" :class="item.accRateClass">达成率 {{ item.accRate }}%</div>
                  </div>
                </div>

                <!-- 2. 差距分析 -->
                <div class="bg-dashboard-dark/40 rounded-lg p-4 border border-dashboard-border">
                  <div class="flex items-center gap-2 mb-3">
                    <span class="w-5 h-5 rounded-full bg-status-red/20 text-status-red flex items-center justify-center text-xs font-bold">1</span>
                    <span class="text-sm font-medium text-dashboard-text">差距分析</span>
                  </div>
                  <div class="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div class="text-xs text-dashboard-muted">目标值</div>
                      <div class="text-lg font-semibold text-dashboard-text mt-1">{{ item.targetStr }}</div>
                    </div>
                    <div>
                      <div class="text-xs text-dashboard-muted">实际值</div>
                      <div class="text-lg font-semibold text-dashboard-text mt-1">{{ item.actualStr }}</div>
                    </div>
                    <div>
                      <div class="text-xs text-dashboard-muted">差距</div>
                      <div class="text-lg font-semibold text-status-red mt-1">{{ item.gapStr }}</div>
                    </div>
                  </div>
                  <div class="mt-3 h-2 rounded bg-dashboard-border overflow-hidden">
                    <div
                      class="h-full bg-status-red transition-all"
                      :style="{ width: Math.min(100, parseFloat(item.rate)) + '%' }"
                    ></div>
                  </div>
                </div>

                <!-- 3. 根因分析（Why分析法） -->
                <div class="bg-dashboard-dark/40 rounded-lg p-4 border border-dashboard-border">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <span class="w-5 h-5 rounded-full bg-status-yellow/20 text-status-yellow flex items-center justify-center text-xs font-bold">2</span>
                      <span class="text-sm font-medium text-dashboard-text">根因分析</span>
                      <span class="text-[10px] text-dashboard-muted">（请逐层追问Why，找出根本原因）</span>
                    </div>
                    <button
                      @click="addWhyRow(item.id)"
                      class="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border border-primary-500/30 text-primary-300 hover:bg-primary-500/10 transition-colors"
                      title="添加下一个Why"
                    >
                      <span class="text-sm font-bold leading-none">+</span> 添加Why
                    </button>
                  </div>
                  <!-- Why 列表 -->
                  <div class="space-y-2.5">
                    <div
                      v-for="(whyItem, wIdx) in getWhyRows(item.id)"
                      :key="wIdx"
                      class="flex items-start gap-2"
                    >
                      <span class="flex-shrink-0 mt-2 w-14 text-xs font-bold text-status-yellow">Why{{ wIdx + 1 }}:</span>
                      <div class="flex-1 relative">
                        <textarea
                          v-model="whyItem.content"
                          :placeholder="wIdx === 0 ? '为什么该指标未达成？请输入直接原因...' : '为什么会出现上一层原因？请继续深挖...'"
                          class="w-full bg-dashboard-dark/60 border border-dashboard-border rounded-lg px-3 py-2 text-xs text-dashboard-text placeholder-dashboard-muted/50 resize-none focus:outline-none focus:border-primary-500/50 min-h-[38px]"
                          rows="1"
                          @input="autoResizeTextarea($event)"
                        ></textarea>
                      </div>
                      <button
                        v-if="getWhyRows(item.id).length > 1"
                        @click="removeWhyRow(item.id, wIdx)"
                        class="flex-shrink-0 mt-1.5 w-6 h-6 flex items-center justify-center rounded text-dashboard-muted hover:text-status-red hover:bg-status-red/10 transition-colors text-xs"
                        title="删除此行"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <!-- AI辅助生成 -->
                  <div class="mt-3 pt-3 border-t border-dashboard-border/40 flex items-center justify-between">
                    <span class="text-[10px] text-dashboard-muted">人工分析为主，AI 可辅助提供参考建议</span>
                    <button
                      @click="aiGenerateWhys(item)"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500/15 text-primary-300 hover:bg-primary-500/25 transition-colors text-xs"
                    >
                      🤖 AI辅助生成
                    </button>
                  </div>
                </div>

                <!-- 4. 改善策略及行动计划 -->
                <div class="bg-dashboard-dark/40 rounded-lg p-4 border border-dashboard-border">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <span class="w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold">3</span>
                      <span class="text-sm font-medium text-dashboard-text">改善策略及行动计划</span>
                    </div>
                    <span class="text-[10px] text-dashboard-muted">可编辑内容后派发</span>
                  </div>

                  <!-- 策略说明 -->
                  <div class="mb-3 rounded border border-primary-500/20 bg-primary-500/5 p-3">
                    <div class="flex items-center gap-1.5 mb-1.5">
                      <span class="text-xs font-semibold text-primary-300">策略方向</span>
                    </div>
                    <textarea
                      v-model="getStrategy(item.id).content"
                      class="w-full bg-transparent text-xs text-dashboard-text placeholder-dashboard-muted/50 resize-none focus:outline-none min-h-[36px] leading-relaxed"
                      rows="2"
                      @input="autoResizeTextarea($event)"
                    ></textarea>
                  </div>

                  <!-- 行动计划列表 -->
                  <div class="space-y-2">
                    <div
                      v-for="(plan, pIdx) in getActionPlans(item.id)"
                      :key="pIdx"
                      class="rounded border border-dashboard-border/60 bg-dashboard-dark/50 p-3"
                    >
                      <div class="flex items-start gap-2">
                        <span class="flex-shrink-0 w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-[10px] font-bold mt-0.5">{{ pIdx + 1 }}</span>
                        <div class="flex-1 min-w-0 space-y-1.5">
                          <textarea
                            v-model="plan.content"
                            placeholder="行动计划内容..."
                            class="w-full bg-transparent text-xs text-dashboard-text placeholder-dashboard-muted/50 resize-none focus:outline-none min-h-[20px] leading-relaxed"
                            rows="1"
                            @input="autoResizeTextarea($event)"
                          ></textarea>
                          <div class="flex items-center gap-3 text-[10px]">
                            <span class="text-dashboard-muted">责任人：</span>
                            <input
                              v-model="plan.owner"
                              placeholder="责任人"
                              class="bg-transparent border-b border-dashboard-border/40 text-primary-300 placeholder-dashboard-muted/50 focus:outline-none focus:border-primary-500/50 pb-0.5 text-[10px] w-28"
                            />
                            <span class="text-dashboard-muted">截止：</span>
                            <input
                              v-model="plan.deadline"
                              type="date"
                              class="bg-transparent border-b border-dashboard-border/40 text-dashboard-muted focus:outline-none focus:border-primary-500/50 pb-0.5 text-[10px]"
                            />
                          </div>
                        </div>
                        <button
                          @click="openTaskDispatch({ indicator: item.name, action: plan.content, owner: plan.owner, department: '直销事业部', deadline: plan.deadline })"
                          class="flex-shrink-0 px-2.5 py-1 rounded-lg bg-primary-500/20 text-primary-300 hover:bg-primary-500/30 transition-colors text-[10px]"
                        >
                          ✉️ 派发
                        </button>
                      </div>
                    </div>
                  </div>
                  <!-- 添加行动计划 -->
                  <button
                    @click="addActionPlan(item.id)"
                    class="mt-2 w-full py-1.5 rounded-lg border border-dashed border-dashboard-border/60 text-[10px] text-dashboard-muted hover:text-primary-300 hover:border-primary-500/30 transition-colors"
                  >
                    + 添加行动计划
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- 无选中指标提示 -->
        <div v-else class="rounded-lg border border-dashboard-border/30 bg-dashboard-dark/20 p-8 text-center">
          <span class="text-3xl">📊</span>
          <div class="text-sm text-dashboard-muted mt-2">请在左侧选择需要分析的指标</div>
        </div>

      </section>

      <!-- 智能洞察面板 -->
      <aside
        v-if="showInsightPanel && !presentationMode"
        class="w-80 flex-shrink-0 border-l border-dashboard-border bg-dashboard-card overflow-auto"
      >
        <div class="p-4 border-b border-dashboard-border">
          <h3 class="text-sm font-semibold text-dashboard-text flex items-center gap-2">
            <span>💡</span> 智能洞察
          </h3>
          <p class="text-xs text-dashboard-muted mt-0.5">基于当前数据的自动分析</p>
        </div>

        <div class="p-4 space-y-4">
          <!-- 关键发现 -->
          <div>
            <div class="text-xs text-dashboard-muted mb-2 flex items-center gap-1">
              <span>🔍</span> 关键发现
            </div>
            <div class="space-y-2">
              <div
                v-for="(finding, index) in keyFindings"
                :key="index"
                class="rounded-lg border border-dashboard-border bg-dashboard-dark/40 p-3"
              >
                <div class="flex items-start gap-2">
                  <span class="text-sm">{{ finding.icon }}</span>
                  <div>
                    <div class="text-xs font-medium text-dashboard-text">{{ finding.title }}</div>
                    <div class="text-[11px] text-dashboard-muted mt-0.5">{{ finding.detail }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 风险预警 -->
          <div>
            <div class="text-xs text-dashboard-muted mb-2 flex items-center gap-1">
              <span>⚠️</span> 风险预警
            </div>
            <div class="space-y-2">
              <div
                v-for="(risk, index) in riskAlerts"
                :key="index"
                class="rounded-lg border border-status-red/30 bg-status-red/10 p-3"
              >
                <div class="text-xs font-medium text-status-red">{{ risk.title }}</div>
                <div class="text-[11px] text-dashboard-muted mt-1">{{ risk.detail }}</div>
              </div>
              <div v-if="!riskAlerts.length" class="text-xs text-dashboard-muted py-2 text-center">
                暂无风险预警
              </div>
            </div>
          </div>

          <!-- 建议行动 -->
          <div>
            <div class="text-xs text-dashboard-muted mb-2 flex items-center gap-1">
              <span>🎯</span> 建议行动
            </div>
            <div class="space-y-2">
              <div
                v-for="(action, index) in suggestedActions"
                :key="index"
                class="rounded-lg border border-primary-500/30 bg-primary-500/10 p-3"
              >
                <div class="text-xs font-medium text-primary-300">{{ action.title }}</div>
                <div class="text-[11px] text-dashboard-muted mt-1">{{ action.detail }}</div>
                <button
                  @click="applySuggestedAction(action)"
                  class="mt-2 text-[11px] text-primary-400 hover:text-primary-300"
                >
                  → 一键应用
                </button>
              </div>
            </div>
          </div>

          <!-- AI 对话入口 -->
          <button
            @click="$emit('open-chatbi')"
            class="w-full py-3 rounded-lg border border-dashboard-border bg-dashboard-dark/40 text-sm text-dashboard-muted hover:text-dashboard-text hover:border-primary-500/40 transition-colors"
          >
            🤖 与 AI 深度分析
          </button>
        </div>
      </aside>
    </main>

    <!-- 演讲模式底部控制栏 -->
    <div
      v-if="presentationMode"
      class="fixed bottom-0 left-0 right-0 h-16 bg-dashboard-card/95 border-t border-dashboard-border flex items-center justify-center gap-4"
    >
      <button
        @click="prevSlide"
        class="px-4 py-2 rounded-lg border border-dashboard-border text-dashboard-muted hover:text-dashboard-text"
      >
        ← 上一页
      </button>
      <span class="text-sm text-dashboard-text">
        {{ currentSlide + 1 }} / {{ totalSlides }}
      </span>
      <button
        @click="nextSlide"
        class="px-4 py-2 rounded-lg border border-dashboard-border text-dashboard-muted hover:text-dashboard-text"
      >
        下一页 →
      </button>
      <button
        @click="toggleAutoPlay"
        class="px-4 py-2 rounded-lg text-sm transition-colors"
        :class="autoPlay ? 'bg-primary-500 text-white' : 'border border-dashboard-border text-dashboard-muted'"
      >
        {{ autoPlay ? '⏸ 暂停' : '▶ 自动播放' }}
      </button>
      <button
        @click="togglePresentationMode"
        class="px-4 py-2 rounded-lg bg-status-red/20 text-status-red hover:bg-status-red/30"
      >
        ✕ 退出演讲
      </button>
    </div>

    <!-- 导出模态框 -->
    <div
      v-if="showExportModal"
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      @click="showExportModal = false"
    >
      <div class="w-[420px] bg-dashboard-card border border-dashboard-border rounded-xl p-5" @click.stop>
        <h4 class="text-base font-semibold text-dashboard-text mb-4">导出报告</h4>

        <div class="space-y-3 mb-5">
          <label class="flex items-center gap-3 p-3 rounded-lg border border-dashboard-border cursor-pointer hover:border-primary-500/40">
            <input type="radio" v-model="exportFormat" value="PPT" class="accent-primary-500" />
            <div>
              <div class="text-sm font-medium text-dashboard-text">PPT 演示文稿</div>
              <div class="text-xs text-dashboard-muted">适合会议演示和汇报</div>
            </div>
          </label>
          <label class="flex items-center gap-3 p-3 rounded-lg border border-dashboard-border cursor-pointer hover:border-primary-500/40">
            <input type="radio" v-model="exportFormat" value="PDF" class="accent-primary-500" />
            <div>
              <div class="text-sm font-medium text-dashboard-text">PDF 文档</div>
              <div class="text-xs text-dashboard-muted">适合存档和分发</div>
            </div>
          </label>
          <label class="flex items-center gap-3 p-3 rounded-lg border border-dashboard-border cursor-pointer hover:border-primary-500/40">
            <input type="radio" v-model="exportFormat" value="Excel" class="accent-primary-500" />
            <div>
              <div class="text-sm font-medium text-dashboard-text">Excel 数据表</div>
              <div class="text-xs text-dashboard-muted">适合进一步数据分析</div>
            </div>
          </label>
        </div>

        <div class="flex items-center justify-end gap-3">
          <button
            @click="showExportModal = false"
            class="px-4 py-2 rounded-lg border border-dashboard-border text-sm text-dashboard-muted hover:text-dashboard-text"
          >
            取消
          </button>
          <button
            @click="handleExport"
            class="px-5 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600"
          >
            开始导出
          </button>
        </div>
      </div>
    </div>

    <!-- 会议纪要模态框 -->
    <div
      v-if="showMinutesModal"
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      @click="showMinutesModal = false"
    >
      <div class="w-[700px] max-h-[80vh] bg-dashboard-card border border-dashboard-border rounded-xl overflow-hidden flex flex-col" @click.stop>
        <div class="p-4 border-b border-dashboard-border flex items-center justify-between">
          <h4 class="text-base font-semibold text-dashboard-text">📋 报告概览</h4>
          <div class="flex items-center gap-2">
            <button
              @click="copyMinutes"
              class="px-3 py-1.5 rounded-lg border border-dashboard-border text-xs text-dashboard-muted hover:text-dashboard-text"
            >
              📋 复制
            </button>
            <button
              @click="downloadMinutes"
              class="px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs"
            >
              ⬇ 下载
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-auto p-4">
          <pre class="text-sm text-dashboard-text whitespace-pre-wrap font-sans leading-relaxed">{{ meetingMinutesContent }}</pre>
        </div>
      </div>
    </div>

    <!-- 任务派发面板 -->
    <TaskDispatchPanel
      v-model:visible="showDispatchPanel"
      :taskData="dispatchTaskData"
      @submit="handleDispatchSubmit"
    />

    <!-- 通知提示 -->
    <transition name="fade">
      <div
        v-if="notice"
        class="fixed right-6 top-24 z-50 rounded-lg border border-primary-500/40 bg-primary-900/90 px-4 py-2 text-sm text-primary-100 shadow-lg"
      >
        {{ notice }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import TaskDispatchPanel from '../components/common/TaskDispatchPanel.vue'
import { bscIndicators, lastMonthPdcaData } from '../composables/useMockData'

defineEmits(['exit', 'open-chatbi'])

// ================== 会议模板系统 ==================
const meetingTemplates = [
  {
    id: 'quarterly',
    name: '📊 季度经营复盘',
    description: '全面分析季度经营状况，对比目标完成情况',
    defaultMetrics: ['overview', 'baodan-income', 'profit', 'customer-pie'],
    focusAreas: ['gap', 'cause']
  },
  {
    id: 'monthly',
    name: '📅 月度业绩汇报',
    description: '聚焦本月业绩表现，快速识别问题',
    defaultMetrics: ['baodan-income', 'online-income', 'alerts'],
    focusAreas: ['gap', 'task']
  },
  {
    id: 'topic',
    name: '🎯 专题分析会',
    description: '针对特定指标进行深度分析',
    defaultMetrics: ['baodan-income', 'profit'],
    focusAreas: ['cause', 'task']
  },
  {
    id: 'budget',
    name: '💰 预算执行分析',
    description: '追踪预算执行进度，分析偏差原因',
    defaultMetrics: ['profit', 'alerts'],
    focusAreas: ['gap', 'cause']
  }
]

const currentTemplate = ref(meetingTemplates[0])
const showTemplateSelector = ref(false)

const selectTemplate = (template) => {
  currentTemplate.value = template
  showTemplateSelector.value = false

  // 清空并添加模板默认指标
  metricCards.value = []
  template.defaultMetrics.forEach(metricId => {
    addMetricCard(metricId)
  })
}

// ================== 周期对比 ==================

// ================== 经营成绩单数据 ==================
const dimensionMeta = {
  finance: { name: '财务维度', icon: '💰' },
  customer: { name: '客户维度', icon: '👥' },
  operation: { name: '内部运营', icon: '⚙️' },
  learning: { name: '学习成长', icon: '📚' }
}

const formatScorecardValue = (val, unit) => {
  if (unit === '%') return `${val}%`
  if (unit === '天') return `${val}天`
  if (val >= 100000000) return (val / 100000000).toFixed(2) + '亿'
  if (val >= 10000) return (val / 10000).toFixed(1) + '万'
  return val.toLocaleString()
}

const getStatusByRate = (rate, inverse) => {
  if (inverse) {
    if (rate <= 1) return 'green'
    if (rate <= 1.15) return 'yellow'
    return 'red'
  }
  if (rate >= 0.95) return 'green'
  if (rate >= 0.85) return 'yellow'
  return 'red'
}

const getRateClass = (status) => {
  if (status === 'green') return 'text-status-green'
  if (status === 'yellow') return 'text-status-yellow'
  return 'text-status-red'
}

const scorecardData = computed(() => {
  const result = {}
  for (const [dimKey, dimension] of Object.entries(bscIndicators)) {
    const meta = dimensionMeta[dimKey]
    const rows = dimension.indicators.map(ind => {
      const rate = (ind.actual / ind.target * 100)
      const accActual = ind.accActual ?? ind.actual
      const accTarget = ind.accTarget ?? ind.target
      const accRate = (accActual / accTarget * 100)
      const status = getStatusByRate(ind.actual / ind.target, ind.inverse)
      const accStatus = getStatusByRate(accActual / accTarget, ind.inverse)
      const gapValue = ind.actual - ind.target
      // 对于反向指标（如库存天数，越低越好），差距方向要反转显示
      const isGapPositive = ind.inverse ? gapValue <= 0 : gapValue >= 0
      const gapStr = ind.unit === '%'
        ? `${Math.abs(ind.actual - ind.target).toFixed(1)}pp`
        : formatScorecardValue(Math.abs(gapValue), ind.unit)

      return {
        id: ind.id,
        name: ind.name,
        target: ind.target,
        actual: ind.actual,
        unit: ind.unit,
        inverse: ind.inverse,
        weight: ind.weight,
        targetStr: formatScorecardValue(ind.target, ind.unit),
        actualStr: formatScorecardValue(ind.actual, ind.unit),
        rate: rate.toFixed(1),
        rateClass: getRateClass(status),
        accTarget: accTarget,
        accActual: accActual,
        accTargetStr: formatScorecardValue(accTarget, ind.unit),
        accActualStr: formatScorecardValue(accActual, ind.unit),
        accRate: accRate.toFixed(1),
        accRateClass: getRateClass(accStatus),
        status,
        accStatus,
        isAbnormal: status === 'red',
        gapValue,
        gapStr: (isGapPositive ? '' : '-') + gapStr,
        dimensionName: meta.name
      }
    })
    result[dimKey] = { name: meta.name, icon: meta.icon, rows }
  }
  return result
})

const abnormalIndicators = computed(() => {
  const items = []
  for (const [dimKey, dimension] of Object.entries(scorecardData.value)) {
    for (const row of dimension.rows) {
      if (row.status === 'red' || row.status === 'yellow') {
        // 获取根因模板
        const templateId = getTemplateIdForIndicator(row.name)
        const causeTemplates = rootCauseTemplates[templateId] || rootCauseTemplates.overview
        const causes = causeTemplates.map((t, i) => ({
          dimension: t.dimension,
          factor: t.factor,
          contribution: [48, 32, 20][i] || 10,
          note: t.note
        }))
        // 生成任务
        const tasks = causeTemplates.slice(0, 2).map((t, i) => ({
          indicator: row.name,
          rootCause: `${t.dimension}：${t.factor}`,
          action: t.action,
          owner: t.owner,
          department: t.department,
          deadline: addDays(analysisContext.endDate, 7 + i * 3),
          status: i === 0 ? '进行中' : '待启动'
        }))
        items.push({ ...row, causes, tasks })
      }
    }
  }
  return items
})

const getTemplateIdForIndicator = (name) => {
  const map = {
    '报单收入': 'baodan-income',
    '利润': 'profit',
    '线上营销收入': 'online-income',
    '报单人数': 'customer-pie',
    '合高合格人次': 'customer-pie',
    '新人经营率': 'customer-pie'
  }
  return map[name] || 'overview'
}

// 模板ID → BSC指标ID映射
const templateToIndicatorIds = {
  'baodan-income': ['f1'],
  'online-income': ['f3'],
  'profit': ['f2'],
  'customer-pie': ['c1', 'c2'],
  'new-person-rate': ['c3'],
  'alerts': [],
  'overview': [],
  'talent-reserve': ['l2'],
  'inventory-days': ['o2']
}

// 控制右侧分析区显示哪些指标
const activeAnalysisIds = ref([])

// 初始化：默认选中所有异常指标
const initActiveAnalysisIds = () => {
  const ids = []
  for (const dimension of Object.values(scorecardData.value)) {
    for (const row of dimension.rows) {
      if (row.status === 'red' || row.status === 'yellow') {
        ids.push(row.id)
      }
    }
  }
  activeAnalysisIds.value = ids
}

// 所有指标的分析数据（含正常和异常）
const allAnalysisData = computed(() => {
  const items = []
  for (const [dimKey, dimension] of Object.entries(scorecardData.value)) {
    for (const row of dimension.rows) {
      if (row.status === 'red' || row.status === 'yellow') {
        const templateId = getTemplateIdForIndicator(row.name)
        const causeTemplates = rootCauseTemplates[templateId] || rootCauseTemplates.overview
        const causes = causeTemplates.map((t, i) => ({
          dimension: t.dimension,
          factor: t.factor,
          contribution: [48, 32, 20][i] || 10,
          note: t.note
        }))
        const tasks = causeTemplates.slice(0, 2).map((t, i) => ({
          indicator: row.name,
          rootCause: `${t.dimension}：${t.factor}`,
          action: t.action,
          owner: t.owner,
          department: t.department,
          deadline: addDays(analysisContext.endDate, 7 + i * 3),
          status: i === 0 ? '进行中' : '待启动'
        }))
        items.push({ ...row, causes, tasks, isNormal: false })
      } else {
        items.push({ ...row, causes: [], tasks: [], isNormal: true })
      }
    }
  }
  return items
})

// 右侧实际显示的指标（受 activeAnalysisIds 控制）
const visibleAnalysisIndicators = computed(() => {
  return allAnalysisData.value.filter(item => activeAnalysisIds.value.includes(item.id))
})

// 切换单个指标的分析显示
const toggleAnalysisId = (id) => {
  const idx = activeAnalysisIds.value.indexOf(id)
  if (idx !== -1) {
    activeAnalysisIds.value.splice(idx, 1)
  } else {
    activeAnalysisIds.value.push(id)
  }
}

// PDCA追踪统计
const pdcaStats = computed(() => {
  const completed = lastMonthPdcaData.filter(i => i.status === '已完成').length
  const partial = lastMonthPdcaData.filter(i => i.status === '部分完成').length
  const uncompleted = lastMonthPdcaData.filter(i => i.status === '未完成').length
  return { completed, partial, uncompleted }
})
const comparePeriods = [
  { value: 'mom', label: '环比' },
  { value: 'yoy', label: '同比' },
  { value: 'qwq', label: '上季' }
]

// ================== 演讲模式 ==================
const presentationMode = ref(false)
const currentSlide = ref(0)
const totalSlides = computed(() => Math.max(3, metricCards.value.length + 2))
const autoPlay = ref(false)
let autoPlayTimer = null

const togglePresentationMode = () => {
  presentationMode.value = !presentationMode.value
  if (!presentationMode.value && autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
    autoPlay.value = false
  }
}

const prevSlide = () => {
  currentSlide.value = Math.max(0, currentSlide.value - 1)
}

const nextSlide = () => {
  currentSlide.value = Math.min(totalSlides.value - 1, currentSlide.value + 1)
}

const toggleAutoPlay = () => {
  autoPlay.value = !autoPlay.value
  if (autoPlay.value) {
    autoPlayTimer = setInterval(() => {
      if (currentSlide.value < totalSlides.value - 1) {
        currentSlide.value++
      } else {
        currentSlide.value = 0
      }
    }, 8000)
  } else if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

// ================== 智能洞察 ==================
const showInsightPanel = ref(false)

const keyFindings = computed(() => {
  const findings = []

  // 基于数据分析生成发现
  const underperforming = closureData.value.gaps.filter(g => g.gapRate < 0)
  if (underperforming.length > 0) {
    findings.push({
      icon: '📉',
      title: `${underperforming.length}项指标未达标`,
      detail: `最大差距：${underperforming[0]?.indicator} (${underperforming[0]?.gapRate.toFixed(1)}%)`
    })
  }

  const overperforming = closureData.value.gaps.filter(g => g.gapRate >= 10)
  if (overperforming.length > 0) {
    findings.push({
      icon: '📈',
      title: `${overperforming.length}项指标超额完成`,
      detail: `最佳表现：${overperforming[0]?.indicator} (+${overperforming[0]?.gapRate.toFixed(1)}%)`
    })
  }

  if (metricCards.value.length > 0) {
    findings.push({
      icon: '📊',
      title: '整体达成情况',
      detail: `分析了${metricCards.value.length}项核心指标`
    })
  }

  return findings
})

const riskAlerts = computed(() => {
  const alerts = []

  closureData.value.gaps.forEach(gap => {
    if (gap.gapRate < -15) {
      alerts.push({
        title: `${gap.indicator} 严重不达标`,
        detail: `差距${Math.abs(gap.gapRate).toFixed(1)}%，需要立即关注`
      })
    }
  })

  return alerts
})

const suggestedActions = computed(() => {
  const actions = []

  if (closureData.value.tasks.length > 0) {
    actions.push({
      title: '生成整改任务',
      detail: `为${closureData.value.tasks.length}项问题生成整改任务`,
      type: 'generate_tasks'
    })
  }

  if (closureData.value.causes.length > 0) {
    actions.push({
      title: '深度根因分析',
      detail: '使用AI进一步分析根本原因',
      type: 'ai_analysis'
    })
  }

  return actions
})

const applySuggestedAction = (action) => {
  if (action.type === 'generate_tasks') {
    // 滚动到任务督导区域
    const taskSection = document.querySelector('[data-section="task-supervision"]')
    if (taskSection) {
      taskSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    showNotice('已定位到任务督导区域')
  } else if (action.type === 'ai_analysis') {
    // 触发ChatBI
  }
}

// ================== 会议纪要生成 ==================
const showMinutesModal = ref(false)
const meetingMinutesContent = ref('')

const generateMeetingMinutes = () => {
  const date = new Date().toLocaleDateString('zh-CN')
  const template = currentTemplate.value

  const content = `
═══════════════════════════════════════════════════════════
                    经营分析报告概览
═══════════════════════════════════════════════════════════

【会议基本信息】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
会议类型：${template.name}
会议日期：${date}
分析周期：${dateRangeLabel.value}
业务范围：${currentBusinessLineLabel.value}
参与指标：${metricCards.value.length} 项

【指标达成概况】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${closureData.value.gaps.map((gap, i) =>
  `${i + 1}. ${gap.indicator}
   目标：${formatLarge(gap.target)} | 实际：${formatLarge(gap.actual)} | 差距：${gap.gapRate >= 0 ? '+' : ''}${gap.gapRate.toFixed(1)}%`
).join('\n\n')}

【差距分析】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${closureData.value.gaps.filter(g => g.gapRate < 0).map((gap, i) =>
  `${i + 1}. ${gap.indicator}：差距 ${Math.abs(gap.gapRate).toFixed(1)}%`
).join('\n') || '所有指标均已达成目标'}

【根因分析】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${closureData.value.causes.map(cause =>
  `▶ ${cause.indicator}
  ${cause.reasons.map(r => `  • ${r.dimension}：${r.factor}（贡献度 ${r.contribution}%）`).join('\n')}
  结论：${cause.conclusion}`
).join('\n\n') || '暂无需根因分析的指标'}

【整改任务】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${closureData.value.tasks.map((task, i) =>
  `${i + 1}. ${task.indicator}
   根因：${task.rootCause}
   动作：${task.action}
   责任人：${task.owner} | 截止：${task.deadline} | 状态：${task.status}`
).join('\n\n') || '暂无待整改任务'}

【下一步行动】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 跟进整改任务执行进度
2. 下周复盘差距改善情况
3. 持续监控风险指标

═══════════════════════════════════════════════════════════
                    纪要生成时间：${new Date().toLocaleString('zh-CN')}
═══════════════════════════════════════════════════════════
`

  meetingMinutesContent.value = content.trim()
  showMinutesModal.value = true
}

const copyMinutes = () => {
  navigator.clipboard.writeText(meetingMinutesContent.value)
  showNotice('报告概览已复制到剪贴板')
}

const downloadMinutes = () => {
  const blob = new Blob([meetingMinutesContent.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `经营分析报告概览_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.txt`
  a.click()
  URL.revokeObjectURL(url)
  showNotice('报告概览已下载')
}

// ================== 原有功能 ==================
const businessLines = [
  { value: 'all', label: '全部业务线' },
  { value: 'diamond', label: '钻石体系' },
  { value: 'huaqi', label: '华旗体系' },
  { value: 'innovation', label: '创新业务' }
]

const metricTemplates = [
  { id: 'baodan-income', title: '报单收入趋势', description: '计划/实际/达成率组合图', baseTarget: 47500000, category: 'finance' },
  { id: 'online-income', title: '线上营销收入趋势', description: '线上业务增长趋势图', baseTarget: 8640000, category: 'finance' },
  { id: 'profit', title: '利润趋势', description: '利润计划达成跟踪图', baseTarget: 12600000, category: 'finance' },
  { id: 'customer-pie', title: '报单人数渠道构成', description: '客户来源结构变化', baseTarget: 145000, category: 'customer' },
  { id: 'new-person-rate', title: '新人经营率', description: '新人帮扶与经营跟踪', baseTarget: 85, category: 'customer' },
  { id: 'alerts', title: '预警摘要指标', description: '高风险预警指标跟踪', baseTarget: 100, category: 'operation' },
  { id: 'overview', title: '经营概览指标', description: '核心 KPI 汇总观察', baseTarget: 1000, category: 'operation' },
  { id: 'talent-reserve', title: '人才储备率', description: '关键岗位人才储备跟踪', baseTarget: 80, category: 'learning' },
  { id: 'inventory-days', title: '库存周转天数', description: '产成品库存效率分析', baseTarget: 45, category: 'operation' }
]

const metricCategoryNames = {
  finance: '💰 财务类',
  customer: '👥 客户类',
  operation: '⚙️ 经营类',
  learning: '📚 学习成长类'
}

const groupedMetricTemplates = computed(() => {
  const groups = {}
  for (const template of metricTemplates) {
    const cat = template.category || 'operation'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(template)
  }
  return groups
})

const rootCauseTemplates = {
  'baodan-income': [
    { dimension: '人', factor: '一线团队成交跟进节奏下滑', note: '关键战区高意向客户二次回访延迟', action: '按战区重排回访节奏', department: '直销事业部', owner: '张经理（华东区）' },
    { dimension: '场', factor: '重点区域活动触达不足', note: '华北与华南线下会场和私域直播排期缺口', action: '补齐华北/华南周度活动排期', department: '运营管理部', owner: '刘主管（运营部）' },
    { dimension: '流程', factor: '线索分层与分发链路滞后', note: '高价值线索未在黄金窗口期完成分派', action: '上线高价值线索超时预警', department: '运营管理部', owner: '陈经理（华南区）' }
  ],
  'online-income': [
    { dimension: '场', factor: '投放流量结构偏离高转化人群', note: '主力渠道预算向低质流量倾斜', action: '重配投放人群包与预算', department: '运营管理部', owner: '刘主管（运营部）' },
    { dimension: '流程', factor: '营销漏斗中段承接断层', note: '线索入池后缺少分层培育策略', action: '重构线索培育SOP', department: '运营管理部', owner: '陈经理（华南区）' }
  ],
  profit: [
    { dimension: '货', factor: '高毛利产品贡献占比不足', note: '本期低毛利产品占比偏高', action: '调整产品结构目标', department: '财务管理部', owner: '李总监（财务部）' },
    { dimension: '流程', factor: '费用执行偏离预算节奏', note: '阶段性活动费用集中支出', action: '建立费用周审机制', department: '财务管理部', owner: '李总监（财务部）' }
  ],
  'customer-pie': [
    { dimension: '人', factor: '新客经营动作标准不一', note: '不同团队的新客承接动作差异大', action: '统一新客经营动作清单', department: '直销事业部', owner: '张经理（华东区）' },
    { dimension: '场', factor: '核心渠道来源结构失衡', note: '老客转介绍占比下降', action: '重启核心渠道激励', department: '运营管理部', owner: '陈经理（华南区）' }
  ],
  alerts: [
    { dimension: '流程', factor: '预警规则参数未按阶段校准', note: '阈值沿用旧周期口径', action: '按业务线重算规则阈值', department: '运营管理部', owner: '刘主管（运营部）' }
  ],
  overview: [
    { dimension: '组织', factor: '目标拆解粒度不足', note: '一级指标已拆解，但二级行动目标缺失', action: '补齐二级行动目标树', department: '运营管理部', owner: '王部长（人力资源）' }
  ]
}

const today = new Date()
const start = new Date()
start.setDate(today.getDate() - 29)
const formatDate = (date) => date.toISOString().split('T')[0]

const analysisContext = reactive({
  startDate: formatDate(start),
  endDate: formatDate(today),
  businessLine: 'all',
  comparePeriods: []
})

const metricCards = ref([])
const metricDerived = ref([])

const dragPayload = ref(null)
const showExportModal = ref(false)
const exportFormat = ref('PPT')

const showDispatchPanel = ref(false)
const dispatchTaskData = ref({})
const notice = ref('')
let noticeTimer = null
const taskStatusOverrides = reactive({})

// ================== 会议纪要 ==================
const showMeetingNotes = ref(false)

const meetingNotesTasks = reactive([
  { content: '营销中心就业绩差距分解政策目标到每个城市经理，进行目标跟踪', owner: '营销中心-王总监', deadline: '2026-03-17' },
  { content: '城市经理与辖区内骨干保持每周一次高频次沟通，推动公司业务政策及体系荣誉考核', owner: '各城市经理', deadline: '2026-03-14' },
  { content: '区域结合公司沙龙活动积极推动市场开展小型活动，提升市场进人能力', owner: '区域业务部', deadline: '2026-03-21' }
])

const meetingNotesReminders = reactive([
  { content: '下周一前提交各区域Q4业务政策宣推计划', target: '各区域负责人' },
  { content: '关注新上市产品销售情况，及时反馈市场动态', target: '直销事业部全体' }
])

const addMeetingNotesTask = () => {
  meetingNotesTasks.push({ content: '', owner: '', deadline: '' })
}

const addMeetingNotesReminder = () => {
  meetingNotesReminders.push({ content: '', target: '' })
}

const dispatchAllMeetingNotes = () => {
  const taskCount = meetingNotesTasks.filter(t => t.content.trim()).length
  const reminderCount = meetingNotesReminders.filter(r => r.content.trim()).length
  showNotice(`已派发 ${taskCount} 条任务、${reminderCount} 条提醒`)
}

const currentBusinessLineLabel = computed(() => {
  return businessLines.find((item) => item.value === analysisContext.businessLine)?.label || '全部业务线'
})

const dateRangeLabel = computed(() => `${analysisContext.startDate} 至 ${analysisContext.endDate}`)

const contextFactor = computed(() => {
  const businessMap = { all: 1, diamond: 1.08, huaqi: 0.95, innovation: 1.14 }
  const startDate = new Date(analysisContext.startDate)
  const endDate = new Date(analysisContext.endDate)
  const from = startDate <= endDate ? startDate : endDate
  const to = startDate <= endDate ? endDate : startDate
  const daySpan = Math.max(7, Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1)
  const dateBoost = 0.9 + Math.min(0.25, daySpan / 180)
  return (businessMap[analysisContext.businessLine] || 1) * dateBoost
})

const addDays = (dateString, days) => {
  const base = new Date(dateString)
  base.setDate(base.getDate() + days)
  return formatDate(base)
}

const formatLarge = (value) => {
  const abs = Math.abs(value)
  if (abs >= 100000000) return `${(value / 100000000).toFixed(2)}亿`
  if (abs >= 10000) return `${(value / 10000).toFixed(1)}万`
  return Math.round(value).toLocaleString()
}

const getBarColor = (rate) => {
  if (rate >= 100) return '#22c55e, #4ade80'
  if (rate >= 85) return '#eab308, #facc15'
  return '#ef4444, #f87171'
}

const createMetricCard = (templateId) => {
  const template = metricTemplates.find((item) => item.id === templateId)
  if (!template) return null
  return {
    uid: `${template.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    templateId: template.id,
    title: template.title,
    description: template.description,
    span: 1
  }
}

const rebuildMetricDerived = () => {
  metricDerived.value = metricCards.value.map((card, index) => {
    const template = metricTemplates.find((item) => item.id === card.templateId)
    const baseTarget = template?.baseTarget || 100
    const seed = Array.from(card.title).reduce((sum, char) => sum + char.charCodeAt(0), 0) + index
    const target = baseTarget * contextFactor.value * (1 + ((seed % 5) - 2) * 0.03)
    const actual = target * (0.84 + ((seed % 7) * 0.045))
    const gapValue = actual - target
    const gapRate = (gapValue / (target || 1)) * 100
    const rate = (actual / (target || 1)) * 100
    const mom = -5 + (seed % 15)
    const yoy = 8 + (seed % 20)
    const bars = Array.from({ length: 12 }, (_, i) => {
      const wave = 10 * Math.sin((i + seed) / 2.1) + 6 * Math.cos((i + seed) / 4.2)
      return Math.max(22, Math.min(96, 66 + wave))
    }).map((item) => Number(item.toFixed(0)))
    return { cardId: card.uid, templateId: card.templateId, title: card.title, target, actual, gapValue, gapRate, rate, mom, yoy, bars }
  })
}

const buildContributionWeights = (seed) => {
  const raw = [48, 32, 20].map((base, index) => base + (((seed + index * 3) % 5) - 2))
  const sum = raw.reduce((total, value) => total + value, 0)
  const normalized = raw.map((value) => Math.max(8, Math.round((value / sum) * 100)))
  const offset = 100 - normalized.reduce((total, value) => total + value, 0)
  normalized[0] += offset
  return normalized
}

const getCauseTemplates = (templateId) => rootCauseTemplates[templateId] || rootCauseTemplates.overview

const closureData = computed(() => {
  const sortedGaps = [...metricDerived.value].sort((a, b) => a.gapRate - b.gapRate).slice(0, 5).map((item) => ({
    cardId: item.cardId, templateId: item.templateId, indicator: item.title,
    target: item.target, actual: item.actual, gapValue: item.gapValue, gapRate: item.gapRate
  }))

  const underPerformed = sortedGaps.filter((gap) => gap.gapRate < 0)
  const causes = underPerformed.map((gap, index) => {
    const templates = getCauseTemplates(gap.templateId)
    const weights = buildContributionWeights(Math.abs(Math.round(gap.gapRate * 10)) + index)
    const reasons = templates.slice(0, 3).map((template, reasonIndex) => ({
      id: `reason-${gap.cardId}-${reasonIndex}`,
      dimension: template.dimension, factor: template.factor,
      contribution: weights[reasonIndex], note: template.note, action: template.action,
      department: template.department, owner: template.owner
    }))
    const primaryReason = reasons[0]
    return {
      id: `cause-${gap.cardId}`, cardId: gap.cardId, indicator: gap.indicator, gapRate: gap.gapRate,
      reasons, conclusion: `优先处理${primaryReason.dimension}维度"${primaryReason.factor}"，预计可回补约${primaryReason.contribution}%缺口。`
    }
  })

  const tasks = causes.flatMap((group, groupIndex) =>
    group.reasons.slice(0, 2).map((reason, reasonIndex) => {
      const taskId = `task-${group.cardId}-${reasonIndex}`
      const groupGap = underPerformed.find((item) => item.cardId === group.cardId)
      return {
        id: taskId, indicator: group.indicator,
        rootCause: `${reason.dimension}：${reason.factor}`, action: reason.action,
        owner: reason.owner, department: reason.department,
        deadline: addDays(analysisContext.endDate, 5 + groupIndex * 3 + reasonIndex * 2),
        status: taskStatusOverrides[taskId] || (groupIndex % 2 === 0 ? '待启动' : '进行中')
      }
    })
  )

  return { gaps: sortedGaps, causes, tasks }
})

const taskStats = computed(() => {
  const stats = { 待启动: 0, 进行中: 0, 已完成: 0 }
  closureData.value.tasks.forEach(task => { stats[task.status] = (stats[task.status] || 0) + 1 })
  return [
    { status: '待启动', label: '待启动', count: stats['待启动'] || 0, class: 'text-status-red' },
    { status: '进行中', label: '进行中', count: stats['进行中'] || 0, class: 'text-status-yellow' },
    { status: '已完成', label: '已完成', count: stats['已完成'] || 0, class: 'text-status-green' }
  ]
})

watch(() => [analysisContext.startDate, analysisContext.endDate, analysisContext.businessLine, metricCards.value.length], () => {
  Object.keys(taskStatusOverrides).forEach(key => delete taskStatusOverrides[key])
  rebuildMetricDerived()
}, { immediate: true })

const addMetricCard = (templateId) => {
  const card = createMetricCard(templateId)
  if (!card) return
  metricCards.value.push(card)
  rebuildMetricDerived()
}

const removeMetricCard = (index) => {
  metricCards.value.splice(index, 1)
  rebuildMetricDerived()
}

const isMetricAdded = (templateId) => {
  return metricCards.value.some(card => card.templateId === templateId)
}

const toggleMetricCard = (templateId) => {
  const indicatorIds = templateToIndicatorIds[templateId] || []
  const index = metricCards.value.findIndex(card => card.templateId === templateId)
  if (index !== -1) {
    removeMetricCard(index)
    indicatorIds.forEach(id => {
      const idx = activeAnalysisIds.value.indexOf(id)
      if (idx !== -1) activeAnalysisIds.value.splice(idx, 1)
    })
    showNotice('已移除指标分析')
  } else {
    addMetricCard(templateId)
    indicatorIds.forEach(id => {
      if (!activeAnalysisIds.value.includes(id)) {
        activeAnalysisIds.value.push(id)
      }
    })
    showNotice('已添加指标到分析')
  }
}

const manualCauses = reactive({})

// Why分析法
const whyAnalysis = reactive({})

const getWhyRows = (indicatorId) => {
  if (!whyAnalysis[indicatorId]) {
    whyAnalysis[indicatorId] = [{ content: '' }]
  }
  return whyAnalysis[indicatorId]
}

const addWhyRow = (indicatorId) => {
  if (!whyAnalysis[indicatorId]) {
    whyAnalysis[indicatorId] = [{ content: '' }]
  }
  if (whyAnalysis[indicatorId].length < 7) {
    whyAnalysis[indicatorId].push({ content: '' })
  }
}

const removeWhyRow = (indicatorId, index) => {
  if (whyAnalysis[indicatorId] && whyAnalysis[indicatorId].length > 1) {
    whyAnalysis[indicatorId].splice(index, 1)
  }
}

const autoResizeTextarea = (event) => {
  const el = event.target
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

const aiGenerateWhys = (item) => {
  const templateId = getTemplateIdForIndicator(item.name)
  const causeTemplates = rootCauseTemplates[templateId] || rootCauseTemplates.overview
  if (!whyAnalysis[item.id]) {
    whyAnalysis[item.id] = []
  }
  whyAnalysis[item.id] = causeTemplates.map((t) => ({
    content: `${t.dimension}：${t.factor}。${t.note}`
  }))
  showNotice('AI已生成根因参考，请根据实际情况修改')
}

// ================== 改善策略及行动计划 ==================
const strategyData = reactive({})
const actionPlansData = reactive({})

// 默认示例素材
const defaultStrategy = '通过公司政策引导全体系借助4季度业务政策，推动市场业绩拉动，同时区域业务部要积极配合、引导、推动辖区各团队年底荣誉考核。'

const defaultActionPlans = [
  { content: '积极宣推季度业务政策；每月组织召开城市发展委会议', owner: '营销中心-王总监', deadline: '2026-03-17' },
  { content: '营销中心就业绩差距分解政策目标到每个城市经理进行目标跟踪', owner: '营销中心-王总监', deadline: '2026-03-21' },
  { content: '城市经理要与辖区内骨干保持每周一次的高频次沟通，推动公司业务政策及体系荣誉考核', owner: '各城市经理', deadline: '2026-03-14' },
  { content: '区域结合着公司的沙龙活动积极推动市场开展小型活动，提升市场进人能力', owner: '区域业务部', deadline: '2026-03-28' }
]

const getStrategy = (indicatorId) => {
  if (!strategyData[indicatorId]) {
    strategyData[indicatorId] = { content: defaultStrategy }
  }
  return strategyData[indicatorId]
}

const getActionPlans = (indicatorId) => {
  if (!actionPlansData[indicatorId]) {
    actionPlansData[indicatorId] = defaultActionPlans.map(p => ({ ...p }))
  }
  return actionPlansData[indicatorId]
}

const addActionPlan = (indicatorId) => {
  if (!actionPlansData[indicatorId]) {
    actionPlansData[indicatorId] = defaultActionPlans.map(p => ({ ...p }))
  }
  actionPlansData[indicatorId].push({ content: '', owner: '', deadline: '' })
}

const toggleMetricSpan = (index) => {
  const card = metricCards.value[index]
  if (!card) return
  card.span = card.span === 2 ? 1 : 2
}

const onDragStartLibrary = (templateId) => { dragPayload.value = { type: 'library', templateId } }
const onDragStartMetric = (index) => { dragPayload.value = { type: 'metric', index } }

const onMetricDropAt = (targetIndex) => {
  if (!dragPayload.value) return
  if (dragPayload.value.type === 'library') {
    const card = createMetricCard(dragPayload.value.templateId)
    if (card) metricCards.value.splice(targetIndex, 0, card)
  } else if (dragPayload.value.type === 'metric') {
    const sourceIndex = dragPayload.value.index
    if (sourceIndex !== targetIndex && sourceIndex + 1 !== targetIndex) {
      const [moved] = metricCards.value.splice(sourceIndex, 1)
      const adjustedIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
      metricCards.value.splice(adjustedIndex, 0, moved)
    }
  }
  dragPayload.value = null
  rebuildMetricDerived()
}

const getTaskStatusClass = (status) => {
  const classMap = { 待启动: 'bg-status-red/20 text-status-red', 进行中: 'bg-status-yellow/20 text-status-yellow', 已完成: 'bg-status-green/20 text-status-green' }
  return classMap[status] || 'bg-dashboard-card text-dashboard-muted'
}

const getMetricView = (index) => metricDerived.value[index] || { target: 0, actual: 0, rate: 0, mom: 0, yoy: 0, gapValue: 0, bars: Array(12).fill(24) }

const showNotice = (message) => {
  notice.value = message
  if (noticeTimer) clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => { notice.value = '' }, 2200)
}

const openTaskDispatch = (task) => {
  dispatchTaskData.value = {
    indicator: task.indicator,
    currentValue: formatLarge(closureData.value.gaps.find(g => g.indicator === task.indicator)?.actual || 0),
    target: formatLarge(closureData.value.gaps.find(g => g.indicator === task.indicator)?.target || 0),
    gap: `${closureData.value.gaps.find(g => g.indicator === task.indicator)?.gapRate.toFixed(1) || 0}%`,
    department: task.department, owner: task.owner,
    rootCause: task.rootCause, action: task.action,
    chartSnapshot: `${task.indicator} | ${dateRangeLabel.value}`
  }
  showDispatchPanel.value = true
}

const handleDispatchSubmit = () => { showNotice('任务已派发') }

const handleExport = () => {
  showExportModal.value = false
  showNotice(`正在导出 ${exportFormat.value} 报告...`)
}

const scrollToSection = (sectionId) => {
  const el = document.querySelector(`[data-section="${sectionId}"]`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const scrollToIndicator = (indicatorId) => {
  const el = document.getElementById('indicator-' + indicatorId)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const toggleCompare = (period) => {
  const index = analysisContext.comparePeriods.indexOf(period)
  if (index > -1) {
    analysisContext.comparePeriods.splice(index, 1)
  } else {
    analysisContext.comparePeriods.push(period)
  }
}

onUnmounted(() => {
  if (noticeTimer) clearTimeout(noticeTimer)
  if (autoPlayTimer) clearInterval(autoPlayTimer)
})

// 初始化：使用默认模板
selectTemplate(meetingTemplates[0])
// 初始化：激活所有异常指标
initActiveAnalysisIds()
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-12px); }
</style>
