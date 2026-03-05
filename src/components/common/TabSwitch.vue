<template>
  <div class="flex bg-dashboard-dark/50 rounded-lg p-0.5 border border-dashboard-border">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      @click="$emit('update:modelValue', tab.value)"
      class="px-3 py-1 text-xs rounded-md transition-all duration-200"
      :class="[
        modelValue === tab.value 
          ? 'bg-primary-500 text-white shadow' 
          : 'text-dashboard-muted hover:text-dashboard-text hover:bg-dashboard-card'
      ]"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  tabs: {
    type: Array,
    default: () => [
      { label: '当月', value: 'month' },
      { label: '截至今日累计', value: 'accumulated' }
    ]
  },
  modelValue: String
})

defineEmits(['update:modelValue'])
</script>
