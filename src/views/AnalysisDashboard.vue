<template>
  <div class="space-y-4 animate-fade-in">
    <!-- 红绿灯预警墙 -->
    <AlertWall />
    
    <!-- 差距与原因分析区 -->
    <GapAnalysis />
    
    <!-- 行动跟踪与任务下达 -->
    <ActionTracker />
  </div>
</template>

<script setup>
import AlertWall from '../components/analysis/AlertWall.vue'
import GapAnalysis from '../components/analysis/GapAnalysis.vue'
import ActionTracker from '../components/analysis/ActionTracker.vue'
</script>
