<template>
  <EnhancedAnalysisDashboard
    @exit="$emit('exit')"
    @open-chatbi="$emit('open-chatbi')"
  />
</template>

<script setup>
import EnhancedAnalysisDashboard from './EnhancedAnalysisDashboard.vue'

defineEmits(['exit', 'open-chatbi'])
</script>
