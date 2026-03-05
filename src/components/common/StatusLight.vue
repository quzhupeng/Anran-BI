<template>
  <span
    class="inline-flex items-center justify-center rounded-full"
    :class="[statusClass, sizeClass, { 'status-pulse': pulse }]"
    :title="title"
  ></span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'green',
    validator: (v) => ['green', 'yellow', 'red'].includes(v)
  },
  pulse: {
    type: Boolean,
    default: false
  },
  title: String,
  size: {
    type: String,
    default: 'normal',
    validator: (v) => ['small', 'normal', 'large'].includes(v)
  }
})

const statusClass = computed(() => {
  const colors = {
    green: 'bg-status-green',
    yellow: 'bg-status-yellow',
    red: 'bg-status-red'
  }
  return colors[props.status]
})

const sizeClass = computed(() => {
  const sizes = {
    small: 'w-2 h-2',
    normal: 'w-3 h-3',
    large: 'w-4 h-4'
  }
  return sizes[props.size]
})
</script>
