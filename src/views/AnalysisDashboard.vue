<template>
  <div class="min-h-screen bg-dashboard-dark animate-fade-in">
    <div class="sticky top-0 z-20 glass-effect border-b border-dashboard-border">
      <div class="px-6 py-4 flex flex-col gap-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-dashboard-text tracking-wide">经营分析会</h2>
            <p class="text-xs text-dashboard-muted mt-1">自由组装指标 + 闭环经营分析 + 报告导出</p>
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
          <div class="text-xs text-dashboard-muted">
            当前上下文：{{ dateRangeLabel }} | {{ currentBusinessLineLabel }}
          </div>
        </div>
      </div>
    </div>

    <main class="p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4">
      <!-- 指标卡片库 -->
      <aside class="gradient-border p-4 h-fit xl:sticky xl:top-40">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-dashboard-text">指标卡片库</h3>
          <span class="text-xs text-dashboard-muted">可拖拽添加</span>
        </div>
        <div class="space-y-2 max-h-[55vh] overflow-auto pr-1">
          <div
            v-for="template in metricTemplates"
            :key="template.id"
            draggable="true"
            @dragstart="onDragStartLibrary(template.id)"
            class="bg-dashboard-dark/40 border border-dashboard-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary-500/40 transition-colors"
          >
            <div class="flex items-center justify-between gap-2">
              <div>
                <div class="text-sm font-medium text-dashboard-text">{{ template.title }}</div>
                <div class="text-xs text-dashboard-muted mt-0.5">{{ template.description }}</div>
              </div>
              <button
                @click="addMetricCard(template.id)"
                class="text-xs px-2 py-1 rounded bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors whitespace-nowrap"
              >
                + 添加
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- 报告画布 -->
      <section class="gradient-border p-4 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-dashboard-text">报告编排画布</h3>
          <span class="text-xs text-dashboard-muted">指标区可增删，闭环区固定不可删除</span>
        </div>

        <!-- 指标区 -->
        <div class="rounded-lg border border-dashboard-border/60 bg-dashboard-dark/30 p-3">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-medium text-dashboard-text">指标区（自由组合）</h4>
            <span class="text-xs text-dashboard-muted">{{ metricCards.length }} 张指标卡</span>
          </div>

          <div
            class="min-h-[180px]"
            @dragover.prevent
            @drop="onMetricDropAt(metricCards.length)"
          >
            <div
              v-if="!metricCards.length"
              class="h-40 flex items-center justify-center text-dashboard-muted text-sm border border-dashed border-dashboard-border rounded-lg"
            >
              拖拽左侧指标到此处，开始组装报告
            </div>

            <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <template v-for="(card, index) in metricCards" :key="card.uid">
                <div
                  class="h-2 rounded transition-colors xl:col-span-2"
                  :class="metricDropIndex === index ? 'bg-primary-500/60' : 'bg-transparent'"
                  @dragover.prevent="metricDropIndex = index"
                  @drop="onMetricDropAt(index)"
                ></div>

                <article
                  draggable="true"
                  @dragstart="onDragStartMetric(index)"
                  @dragover.prevent
                  @drop="onMetricDropAt(index)"
                  class="bg-dashboard-dark/50 border border-dashboard-border rounded-lg p-3 cursor-move"
                  :class="card.span === 2 ? 'xl:col-span-2' : ''"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <h5 class="text-sm font-semibold text-dashboard-text">{{ card.title }}</h5>
                      <p class="text-xs text-dashboard-muted mt-0.5">{{ card.description }}</p>
                    </div>
                    <div class="flex items-center gap-1">
                      <button
                        @click="toggleMetricSpan(index)"
                        class="text-xs px-2 py-1 rounded bg-dashboard-dark border border-dashboard-border text-dashboard-muted hover:text-dashboard-text transition-colors"
                      >
                        {{ card.span === 2 ? '半宽' : '通栏' }}
                      </button>
                      <button
                        @click="removeMetricCard(index)"
                        class="text-xs px-2 py-1 rounded bg-status-red/20 text-status-red hover:bg-status-red/30 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>

                  <div class="mt-3 rounded-lg border border-dashboard-border/70 bg-dashboard-dark/40 p-3">
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-dashboard-muted">{{ currentBusinessLineLabel }}</span>
                      <span class="text-primary-300">
                        目标 {{ formatLarge(getMetricView(index).target) }} / 实际 {{ formatLarge(getMetricView(index).actual) }}
                      </span>
                    </div>
                    <div class="mt-2 h-20 flex items-end gap-1.5">
                      <span
                        v-for="(bar, idx) in getMetricView(index).bars"
                        :key="idx"
                        class="flex-1 rounded-sm"
                        :style="{
                          height: `${bar}%`,
                          background: idx % 3 === 0 ? '#22d3ee' : idx % 3 === 1 ? '#38bdf8' : '#6366f1'
                        }"
                      ></span>
                    </div>
                    <div class="mt-2 text-xs text-dashboard-muted">
                      {{ dateRangeLabel }} · 达成率 {{ getMetricView(index).rate.toFixed(1) }}%
                    </div>
                  </div>
                </article>
              </template>
            </div>
          </div>
        </div>

        <!-- 闭环区 -->
        <div class="rounded-lg border border-dashboard-border/60 bg-dashboard-dark/30 p-3">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-medium text-dashboard-text">闭环区（必选模块）</h4>
            <span class="text-xs text-dashboard-muted">支持拖拽排序 / 展开收起</span>
          </div>

          <div class="space-y-3" @dragover.prevent @drop="onClosureDropAt(closureBlocks.length)">
            <template v-for="(block, index) in closureBlocks" :key="block.id">
              <div
                class="h-2 rounded transition-colors"
                :class="closureDropIndex === index ? 'bg-primary-500/60' : 'bg-transparent'"
                @dragover.prevent="closureDropIndex = index"
                @drop="onClosureDropAt(index)"
              ></div>

              <article
                draggable="true"
                @dragstart="onDragStartClosure(index)"
                @dragover.prevent
                @drop="onClosureDropAt(index)"
                class="border border-dashboard-border rounded-lg bg-dashboard-dark/45"
              >
                <header class="px-3 py-2 border-b border-dashboard-border flex items-center justify-between">
                  <div>
                    <h5 class="text-sm font-semibold text-dashboard-text">{{ block.title }}</h5>
                    <p class="text-xs text-dashboard-muted">{{ block.description }}</p>
                  </div>
                  <div class="flex items-center gap-1">
                    <button
                      @click="block.compact = !block.compact"
                      class="text-xs px-2 py-1 rounded bg-dashboard-dark border border-dashboard-border text-dashboard-muted hover:text-dashboard-text transition-colors"
                    >
                      {{ block.compact ? '标准' : '紧凑' }}
                    </button>
                    <button
                      @click="block.collapsed = !block.collapsed"
                      class="text-xs px-2 py-1 rounded bg-dashboard-dark border border-dashboard-border text-dashboard-muted hover:text-dashboard-text transition-colors"
                    >
                      {{ block.collapsed ? '展开' : '收起' }}
                    </button>
                  </div>
                </header>

                <div v-if="!block.collapsed" class="p-3" :class="block.compact ? 'space-y-1.5' : 'space-y-3'">
                  <!-- 差距分析 -->
                  <div v-if="block.id === 'gap'" class="space-y-2">
                    <div
                      v-for="gap in closureData.gaps"
                      :key="gap.cardId"
                      class="rounded-lg border border-dashboard-border bg-dashboard-dark/30 p-2"
                    >
                      <div class="flex items-center justify-between text-xs">
                        <span class="text-dashboard-text">{{ gap.indicator }}</span>
                        <span
                          class="font-semibold"
                          :class="gap.gapValue < 0 ? 'text-status-red' : 'text-status-green'"
                        >
                          {{ gap.gapValue < 0 ? '' : '+' }}{{ formatLarge(gap.gapValue) }} ({{ gap.gapRate.toFixed(1) }}%)
                        </span>
                      </div>
                      <div class="mt-1 text-[11px] text-dashboard-muted">
                        计划 {{ formatLarge(gap.target) }} / 实际 {{ formatLarge(gap.actual) }}
                      </div>
                    </div>
                    <div v-if="!closureData.gaps.length" class="text-xs text-dashboard-muted">
                      暂无可分析指标，请先在指标区添加卡片。
                    </div>
                  </div>

                  <!-- 根因分析 -->
                  <div v-else-if="block.id === 'cause'" class="space-y-2">
                    <div
                      v-for="causeGroup in closureData.causes"
                      :key="causeGroup.id"
                      class="rounded-lg border border-dashboard-border bg-dashboard-dark/30 p-2"
                    >
                      <div class="flex items-center justify-between text-xs">
                        <span class="text-dashboard-text">{{ causeGroup.indicator }}</span>
                        <span class="text-status-red font-semibold">
                          未达成 {{ Math.abs(causeGroup.gapRate).toFixed(1) }}%
                        </span>
                      </div>

                      <div class="mt-2 space-y-1.5">
                        <div
                          v-for="reason in causeGroup.reasons"
                          :key="reason.id"
                          class="rounded border border-dashboard-border/70 bg-dashboard-dark/40 p-2"
                        >
                          <div class="flex items-center justify-between text-[11px]">
                            <span class="text-dashboard-text">{{ reason.dimension }} · {{ reason.factor }}</span>
                            <span class="text-status-yellow font-semibold">{{ reason.contribution }}%</span>
                          </div>
                          <div class="mt-1 h-1.5 rounded bg-dashboard-border overflow-hidden">
                            <div
                              class="h-full bg-status-yellow"
                              :style="{ width: `${reason.contribution}%` }"
                            ></div>
                          </div>
                          <div class="mt-1 text-[11px] text-dashboard-muted">{{ reason.note }}</div>
                          <div class="text-[11px] text-primary-300/90 mt-0.5">证据：{{ reason.evidence }}</div>
                        </div>
                      </div>

                      <div class="mt-2 text-[11px] text-primary-300">
                        结论：{{ causeGroup.conclusion }}
                      </div>
                    </div>
                    <div v-if="!closureData.causes.length" class="text-xs text-dashboard-muted">
                      当前指标均已达成，无需根因拆解。
                    </div>
                  </div>

                  <!-- 任务督导 -->
                  <div v-else class="space-y-3">
                    <div class="flex items-center gap-2">
                      <button
                        @click="taskViewMode = 'table'"
                        class="px-2.5 py-1 rounded text-xs transition-colors"
                        :class="taskViewMode === 'table' ? 'bg-primary-500/25 text-primary-300' : 'bg-dashboard-dark border border-dashboard-border text-dashboard-muted'"
                      >
                        表格视图
                      </button>
                      <button
                        @click="taskViewMode = 'kanban'"
                        class="px-2.5 py-1 rounded text-xs transition-colors"
                        :class="taskViewMode === 'kanban' ? 'bg-primary-500/25 text-primary-300' : 'bg-dashboard-dark border border-dashboard-border text-dashboard-muted'"
                      >
                        看板视图
                      </button>
                      <span class="text-[11px] text-dashboard-muted">仅对未达成指标自动生成整改任务</span>
                    </div>

                    <div v-if="taskViewMode === 'table'" class="overflow-x-auto">
                      <table class="w-full text-xs">
                        <thead>
                          <tr class="border-b border-dashboard-border">
                            <th class="text-left py-2 text-dashboard-muted font-medium">指标</th>
                            <th class="text-left py-2 text-dashboard-muted font-medium">根因</th>
                            <th class="text-left py-2 text-dashboard-muted font-medium">整改动作</th>
                            <th class="text-left py-2 text-dashboard-muted font-medium">责任人</th>
                            <th class="text-left py-2 text-dashboard-muted font-medium">截止</th>
                            <th class="text-left py-2 text-dashboard-muted font-medium">状态</th>
                            <th class="text-left py-2 text-dashboard-muted font-medium">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="task in closureData.tasks"
                            :key="task.id"
                            class="border-b border-dashboard-border/50"
                          >
                            <td class="py-2 text-dashboard-text">{{ task.indicator }}</td>
                            <td class="py-2 text-dashboard-muted max-w-[220px]">{{ task.rootCause }}</td>
                            <td class="py-2 text-dashboard-muted max-w-[220px]">{{ task.action }}</td>
                            <td class="py-2 text-primary-300">{{ task.owner }}</td>
                            <td class="py-2 text-dashboard-muted">{{ task.deadline }}</td>
                            <td class="py-2">
                              <span
                                class="px-2 py-0.5 rounded-full"
                                :class="getTaskStatusClass(task.status)"
                              >
                                {{ task.status }}
                              </span>
                            </td>
                            <td class="py-2">
                              <div class="flex items-center gap-1">
                                <button
                                  @click="openTaskDispatch(task)"
                                  class="px-2 py-0.5 rounded bg-primary-500/20 text-primary-300 hover:bg-primary-500/30 transition-colors"
                                >
                                  一键派发任务
                                </button>
                                <button
                                  class="px-2 py-0.5 rounded bg-dashboard-dark border border-dashboard-border text-dashboard-muted hover:text-dashboard-text transition-colors"
                                >
                                  督办
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div v-if="!closureData.tasks.length" class="text-xs text-dashboard-muted py-2">
                        暂无待整改任务。
                      </div>
                    </div>

                    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-2">
                      <div
                        v-for="lane in taskKanbanLanes"
                        :key="lane.status"
                        class="rounded-lg border border-dashboard-border bg-dashboard-dark/30 p-2"
                      >
                        <div class="text-xs font-semibold text-dashboard-text mb-2">
                          {{ lane.label }} ({{ lane.items.length }})
                        </div>
                        <div class="space-y-2">
                          <div
                            v-for="task in lane.items"
                            :key="task.id"
                            class="rounded border border-dashboard-border/60 bg-dashboard-dark/40 p-2"
                          >
                            <div class="text-xs text-dashboard-text">{{ task.indicator }}</div>
                            <div class="text-[11px] text-dashboard-muted mt-0.5">{{ task.rootCause }}</div>
                            <div class="text-[11px] text-dashboard-muted mt-0.5">{{ task.owner }} · {{ task.deadline }}</div>
                            <button
                              @click="openTaskDispatch(task)"
                              class="mt-1.5 px-2 py-0.5 rounded bg-primary-500/20 text-primary-300 hover:bg-primary-500/30 transition-colors text-[11px]"
                            >
                              一键派发任务
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-if="taskViewMode === 'kanban' && !closureData.tasks.length" class="text-xs text-dashboard-muted py-2">
                      暂无待整改任务。
                    </div>
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
      <div class="w-[360px] bg-dashboard-card border border-dashboard-border rounded-xl p-4" @click.stop>
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
        <p class="text-[11px] text-dashboard-muted mt-3">
          将导出当前筛选条件、指标布局、差距分析、根因分析和任务督导快照。
        </p>
      </div>
    </div>

    <TaskDispatchPanel
      v-model:visible="showDispatchPanel"
      :taskData="dispatchTaskData"
      @submit="handleDispatchSubmit"
    />

    <transition name="fade">
      <div
        v-if="dispatchNotice"
        class="fixed right-6 top-24 z-50 rounded-lg border border-primary-500/40 bg-primary-900/80 px-3 py-2 text-xs text-primary-100 shadow-lg"
      >
        {{ dispatchNotice }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import TaskDispatchPanel from '../components/common/TaskDispatchPanel.vue'

defineEmits(['exit'])

const businessLines = [
  { value: 'all', label: '全部业务线' },
  { value: 'diamond', label: '钻石体系' },
  { value: 'huaqi', label: '华旗体系' },
  { value: 'innovation', label: '创新业务' }
]

const metricTemplates = [
  { id: 'baodan-income', title: '报单收入趋势', description: '计划/实际/达成率组合图', baseTarget: 47500000 },
  { id: 'online-income', title: '线上营销收入趋势', description: '线上业务增长趋势图', baseTarget: 8640000 },
  { id: 'profit', title: '利润趋势', description: '利润计划达成跟踪图', baseTarget: 12600000 },
  { id: 'customer-pie', title: '报单人数渠道构成', description: '客户来源结构变化', baseTarget: 145000 },
  { id: 'alerts', title: '预警摘要指标', description: '高风险预警指标跟踪', baseTarget: 100 },
  { id: 'overview', title: '经营概览指标', description: '核心 KPI 汇总观察', baseTarget: 1000 }
]

const rootCauseTemplates = {
  'baodan-income': [
    {
      dimension: '人',
      factor: '一线团队成交跟进节奏下滑',
      note: '关键战区高意向客户二次回访延迟，首单转化率偏低。',
      evidenceHint: '近7天高意向客户48小时内回访率低于标准线',
      action: '按战区重排回访节奏，建立日清盘点机制并复盘高转化话术。',
      department: '直销事业部',
      owner: '张经理（华东区）'
    },
    {
      dimension: '场',
      factor: '重点区域活动触达不足',
      note: '华北与华南线下会场和私域直播排期缺口，流量池衰减。',
      evidenceHint: '活动场次低于计划，新增线索补给不足',
      action: '补齐华北/华南周度活动排期，增加区域联动专场并追踪到场率。',
      department: '运营管理部',
      owner: '刘主管（运营部）'
    },
    {
      dimension: '流程',
      factor: '线索分层与分发链路滞后',
      note: '高价值线索未在黄金窗口期完成分派，导致机会流失。',
      evidenceHint: '高价值线索超时分派比例连续上升',
      action: '上线高价值线索超时预警，要求24小时内完成分派并回写结果。',
      department: '运营管理部',
      owner: '陈经理（华南区）'
    }
  ],
  'online-income': [
    {
      dimension: '场',
      factor: '投放流量结构偏离高转化人群',
      note: '主力渠道预算向低质流量倾斜，优质人群覆盖下降。',
      evidenceHint: '核心投放渠道点击转化率连续下探',
      action: '重配投放人群包与预算，优先保障高ROI渠道并设置止损线。',
      department: '运营管理部',
      owner: '刘主管（运营部）'
    },
    {
      dimension: '流程',
      factor: '营销漏斗中段承接断层',
      note: '线索入池后缺少分层培育策略，商机转化效率不足。',
      evidenceHint: '线索到商机转化率低于阶段目标',
      action: '重构线索培育SOP，按线索等级配置自动触达与人工跟进策略。',
      department: '运营管理部',
      owner: '陈经理（华南区）'
    },
    {
      dimension: '货',
      factor: '线上主推产品卖点表达弱化',
      note: '素材内容强调优惠而非价值，影响用户决策速度。',
      evidenceHint: '详情页停留时长与加购率同步下降',
      action: '升级主推产品素材矩阵，强化价值主张并开展AB测试。',
      department: '运营管理部',
      owner: '张经理（华东区）'
    }
  ],
  profit: [
    {
      dimension: '货',
      factor: '高毛利产品贡献占比不足',
      note: '本期低毛利产品占比偏高，拉低综合毛利水平。',
      evidenceHint: '高毛利产品销售占比低于计划结构',
      action: '调整产品结构目标，推动高毛利组合包优先成交。',
      department: '财务管理部',
      owner: '李总监（财务部）'
    },
    {
      dimension: '流程',
      factor: '费用执行偏离预算节奏',
      note: '阶段性活动费用集中支出，费用率高于控制线。',
      evidenceHint: '费用率连续3期高于预算控制阈值',
      action: '建立费用周审机制，按ROI动态审批并冻结低效预算。',
      department: '财务管理部',
      owner: '李总监（财务部）'
    },
    {
      dimension: '组织',
      factor: '跨部门利润看板响应滞后',
      note: '业务与财务协同复盘频次不足，纠偏动作落地慢。',
      evidenceHint: '利润偏差发现至纠偏决策间隔拉长',
      action: '固定周度经营复盘机制，建立偏差超阈值强制会签流程。',
      department: '运营管理部',
      owner: '王部长（人力资源）'
    }
  ],
  'customer-pie': [
    {
      dimension: '人',
      factor: '新客经营动作标准不一',
      note: '不同团队的新客承接动作差异大，复购链路断点明显。',
      evidenceHint: '新客30日留存率低于目标',
      action: '统一新客经营动作清单并按周抽检执行质量。',
      department: '直销事业部',
      owner: '张经理（华东区）'
    },
    {
      dimension: '场',
      factor: '核心渠道来源结构失衡',
      note: '老客转介绍占比下降，新增渠道贡献不足。',
      evidenceHint: '高质量渠道线索占比连续下滑',
      action: '重启核心渠道激励，恢复转介绍专项活动。',
      department: '运营管理部',
      owner: '陈经理（华南区）'
    },
    {
      dimension: '流程',
      factor: '客户分层运营触发不及时',
      note: '关键节点提醒触发晚，导致客户活跃度回落。',
      evidenceHint: '客户触达时效低于目标SLA',
      action: '优化客户生命周期触发策略，补齐关键节点自动提醒。',
      department: '运营管理部',
      owner: '刘主管（运营部）'
    }
  ],
  alerts: [
    {
      dimension: '流程',
      factor: '预警规则参数未按阶段校准',
      note: '阈值沿用旧周期口径，误报与漏报并存。',
      evidenceHint: '规则命中后复核偏差率上升',
      action: '按业务线重算规则阈值并上线灰度验证。',
      department: '运营管理部',
      owner: '刘主管（运营部）'
    },
    {
      dimension: '组织',
      factor: '预警处置责任边界不清',
      note: '跨部门预警缺少明确接单机制，响应时长拉长。',
      evidenceHint: '跨部门预警闭环时长高于目标',
      action: '明确预警责任矩阵，设置首响和闭环时限考核。',
      department: '运营管理部',
      owner: '王部长（人力资源）'
    },
    {
      dimension: '人',
      factor: '预警复盘质量不稳定',
      note: '处置后缺少复盘模板，经验无法复用。',
      evidenceHint: '同类预警重复触发频次偏高',
      action: '建立标准复盘模板并纳入周例会追踪。',
      department: '直销事业部',
      owner: '张经理（华东区）'
    }
  ],
  overview: [
    {
      dimension: '组织',
      factor: '目标拆解粒度不足',
      note: '一级指标已拆解，但二级行动目标缺失导致落地偏差。',
      evidenceHint: '团队周计划与经营目标映射不足',
      action: '补齐二级行动目标树，按周检查目标映射完整性。',
      department: '运营管理部',
      owner: '王部长（人力资源）'
    },
    {
      dimension: '流程',
      factor: '跨看板口径未完全统一',
      note: '同一指标在不同视图口径不一致，影响协同判断。',
      evidenceHint: '复盘会议中口径争议次数增加',
      action: '统一指标定义与口径字典，经营会前自动校验口径一致性。',
      department: '运营管理部',
      owner: '刘主管（运营部）'
    },
    {
      dimension: '人',
      factor: '经营动作跟踪节奏不稳定',
      note: '任务推进节奏受个人管理习惯影响较大，执行离散。',
      evidenceHint: '重点任务按期完成率波动明显',
      action: '设置任务周追踪节奏和红黄灯机制，保障动作连续性。',
      department: '直销事业部',
      owner: '张经理（华东区）'
    }
  ]
}

const today = new Date()
const start = new Date()
start.setDate(today.getDate() - 29)
const formatDate = (date) => date.toISOString().split('T')[0]

const analysisContext = reactive({
  startDate: formatDate(start),
  endDate: formatDate(today),
  businessLine: 'all'
})

const metricCards = ref([])
const metricDerived = ref([])
const closureBlocks = ref([
  { id: 'gap', title: '差距分析', description: '目标-实际差距排名', collapsed: false, compact: false },
  { id: 'cause', title: '根因分析', description: '按指标拆解未达成原因', collapsed: false, compact: false },
  { id: 'task', title: '任务督导', description: '由根因自动生成整改任务', collapsed: false, compact: false }
])
const taskViewMode = ref('table')

const dragPayload = ref(null)
const metricDropIndex = ref(-1)
const closureDropIndex = ref(-1)
const showExportMenu = ref(false)

const showDispatchPanel = ref(false)
const dispatchTaskData = ref({
  indicator: '',
  currentValue: '',
  target: '',
  gap: '',
  department: '直销事业部',
  owner: '张经理（华东区）',
  rootCause: '',
  action: '',
  chartSnapshot: ''
})
const currentDispatchTaskId = ref('')
const dispatchNotice = ref('')
let dispatchNoticeTimer = null
const taskStatusOverrides = reactive({})

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
    const bars = Array.from({ length: 12 }, (_, i) => {
      const wave = 10 * Math.sin((i + seed) / 2.1) + 6 * Math.cos((i + seed) / 4.2)
      return Math.max(22, Math.min(96, 66 + wave))
    }).map((item) => Number(item.toFixed(0)))
    return {
      cardId: card.uid,
      templateId: card.templateId,
      title: card.title,
      target,
      actual,
      gapValue,
      gapRate,
      rate,
      bars
    }
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

const getCauseTemplates = (templateId) => {
  return rootCauseTemplates[templateId] || rootCauseTemplates.overview
}

const closureData = computed(() => {
  const sortedGaps = [...metricDerived.value]
    .sort((a, b) => a.gapRate - b.gapRate)
    .slice(0, 5)
    .map((item) => ({
      cardId: item.cardId,
      templateId: item.templateId,
      indicator: item.title,
      target: item.target,
      actual: item.actual,
      gapValue: item.gapValue,
      gapRate: item.gapRate
    }))

  const underPerformed = sortedGaps.filter((gap) => gap.gapRate < 0)

  const causes = underPerformed.map((gap, index) => {
    const templates = getCauseTemplates(gap.templateId)
    const weights = buildContributionWeights(Math.abs(Math.round(gap.gapRate * 10)) + index)
    const reasons = templates.slice(0, 3).map((template, reasonIndex) => ({
      id: `reason-${gap.cardId}-${reasonIndex}`,
      dimension: template.dimension,
      factor: template.factor,
      contribution: weights[reasonIndex],
      note: template.note,
      evidence: `${template.evidenceHint}；目标${formatLarge(gap.target)}，实际${formatLarge(gap.actual)}，差距${formatLarge(Math.abs(gap.gapValue))}`,
      action: template.action,
      department: template.department,
      owner: template.owner
    }))
    const primaryReason = reasons[0]
    return {
      id: `cause-${gap.cardId}`,
      cardId: gap.cardId,
      indicator: gap.indicator,
      gapRate: gap.gapRate,
      reasons,
      conclusion: `优先处理${primaryReason.dimension}维度“${primaryReason.factor}”，预计可回补约${primaryReason.contribution}%缺口。`
    }
  })

  const statusCycle = ['待启动', '进行中']
  const tasks = causes.flatMap((group, groupIndex) =>
    group.reasons.slice(0, 2).map((reason, reasonIndex) => {
      const taskId = `task-${group.cardId}-${reasonIndex}`
      const baseStatus = statusCycle[(groupIndex + reasonIndex) % statusCycle.length]
      const groupGap = underPerformed.find((item) => item.cardId === group.cardId)
      const priority = groupGap?.gapRate <= -12 || reason.contribution >= 45 ? '高' : '中'
      return {
        id: taskId,
        indicator: group.indicator,
        rootCause: `${reason.dimension}：${reason.factor}`,
        rootCauseDetail: `${reason.note}；${reason.evidence}`,
        action: reason.action,
        owner: reason.owner,
        department: reason.department,
        deadline: addDays(analysisContext.endDate, 5 + groupIndex * 3 + reasonIndex * 2),
        status: taskStatusOverrides[taskId] || baseStatus,
        priority,
        target: groupGap?.target || 0,
        actual: groupGap?.actual || 0,
        gapValue: groupGap?.gapValue || 0,
        gapRate: groupGap?.gapRate || 0
      }
    })
  )

  return {
    gaps: sortedGaps,
    causes,
    tasks
  }
})

const taskKanbanLanes = computed(() => {
  const laneDefs = [
    { status: '待启动', label: '待启动' },
    { status: '进行中', label: '进行中' },
    { status: '已完成', label: '已完成' }
  ]
  return laneDefs.map((lane) => ({
    ...lane,
    items: closureData.value.tasks.filter((task) => task.status === lane.status)
  }))
})

const resetTaskStatusOverrides = () => {
  Object.keys(taskStatusOverrides).forEach((key) => {
    delete taskStatusOverrides[key]
  })
}

watch(
  () => [analysisContext.startDate, analysisContext.endDate, analysisContext.businessLine, metricCards.value.length],
  () => {
    resetTaskStatusOverrides()
    rebuildMetricDerived()
  },
  { immediate: true }
)

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

const toggleMetricSpan = (index) => {
  const card = metricCards.value[index]
  if (!card) return
  card.span = card.span === 2 ? 1 : 2
}

const onDragStartLibrary = (templateId) => {
  dragPayload.value = { type: 'library', templateId }
}

const onDragStartMetric = (index) => {
  dragPayload.value = { type: 'metric', index }
}

const onDragStartClosure = (index) => {
  dragPayload.value = { type: 'closure', index }
}

const onMetricDropAt = (targetIndex) => {
  if (!dragPayload.value) return
  if (dragPayload.value.type === 'library') {
    const card = createMetricCard(dragPayload.value.templateId)
    if (card) {
      metricCards.value.splice(targetIndex, 0, card)
    }
  } else if (dragPayload.value.type === 'metric') {
    const sourceIndex = dragPayload.value.index
    if (sourceIndex !== targetIndex && sourceIndex + 1 !== targetIndex) {
      const [moved] = metricCards.value.splice(sourceIndex, 1)
      const adjustedIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
      metricCards.value.splice(adjustedIndex, 0, moved)
    }
  }
  dragPayload.value = null
  metricDropIndex.value = -1
  rebuildMetricDerived()
}

const onClosureDropAt = (targetIndex) => {
  if (!dragPayload.value || dragPayload.value.type !== 'closure') return
  const sourceIndex = dragPayload.value.index
  if (sourceIndex !== targetIndex && sourceIndex + 1 !== targetIndex) {
    const [moved] = closureBlocks.value.splice(sourceIndex, 1)
    const adjustedIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
    closureBlocks.value.splice(adjustedIndex, 0, moved)
  }
  dragPayload.value = null
  closureDropIndex.value = -1
}

const getTaskStatusClass = (status) => {
  const classMap = {
    待启动: 'bg-status-red/20 text-status-red',
    进行中: 'bg-status-yellow/20 text-status-yellow',
    已完成: 'bg-status-green/20 text-status-green'
  }
  return classMap[status] || 'bg-dashboard-card text-dashboard-muted'
}

const getMetricView = (index) => {
  return metricDerived.value[index] || {
    target: 0,
    actual: 0,
    rate: 0,
    bars: Array(12).fill(24)
  }
}

const toggleExportMenu = () => {
  showExportMenu.value = !showExportMenu.value
}

const showDispatchToast = (message) => {
  dispatchNotice.value = message
  if (dispatchNoticeTimer) clearTimeout(dispatchNoticeTimer)
  dispatchNoticeTimer = setTimeout(() => {
    dispatchNotice.value = ''
  }, 2200)
}

const openTaskDispatch = (task) => {
  currentDispatchTaskId.value = task.id
  dispatchTaskData.value = {
    indicator: task.indicator,
    currentValue: formatLarge(task.actual),
    target: formatLarge(task.target),
    gap: `${task.gapRate.toFixed(1)}%`,
    department: task.department,
    owner: task.owner,
    rootCause: task.rootCauseDetail,
    action: task.action,
    chartSnapshot: `${task.indicator} | ${dateRangeLabel.value} | 计划/实际/达成率组合图`
  }
  showDispatchPanel.value = true
}

const handleDispatchSubmit = (payload) => {
  if (currentDispatchTaskId.value) {
    taskStatusOverrides[currentDispatchTaskId.value] = '进行中'
  }
  showDispatchToast(`任务已派发：${payload.indicator}（已与云栖任务系统状态同步）`)
}

const buildExportPayload = (format) => {
  const taskSummary = closureData.value.tasks.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {})
  return {
    format,
    analysisContext: { ...analysisContext },
    metricCards: metricCards.value.map((card, index) => ({
      index: index + 1,
      title: card.title,
      span: card.span === 2 ? 'full' : 'half'
    })),
    closureSummary: {
      gaps: closureData.value.gaps.slice(0, 3).map((item) => ({
        indicator: item.indicator,
        gapRate: Number(item.gapRate.toFixed(1))
      })),
      causes: closureData.value.causes.slice(0, 3).map((item) => ({
        indicator: item.indicator,
        primaryCause: item.reasons[0]?.factor || '无',
        contribution: item.reasons[0]?.contribution || 0
      })),
      taskSummary
    },
    taskSnapshot: closureData.value.tasks.map((task) => ({
      indicator: task.indicator,
      rootCause: task.rootCause,
      owner: task.owner,
      status: task.status,
      deadline: task.deadline
    }))
  }
}

const handleExport = (format) => {
  const payload = buildExportPayload(format)
  showExportMenu.value = false
  alert(
    `正在导出 ${format} 报告...\n\n` +
    `时间：${dateRangeLabel.value}\n` +
    `业务线：${currentBusinessLineLabel.value}\n` +
    `指标卡：${payload.metricCards.length} 张\n` +
    `差距项：${payload.closureSummary.gaps.length} 项\n` +
    `任务数：${payload.taskSnapshot.length} 项`
  )
}

onUnmounted(() => {
  if (dispatchNoticeTimer) clearTimeout(dispatchNoticeTimer)
})

// 默认注入指标卡
addMetricCard('overview')
addMetricCard('baodan-income')
addMetricCard('profit')
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
