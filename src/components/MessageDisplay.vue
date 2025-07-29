<template>
  <div class="message-display">
    <!-- Main Message Text -->
    <div v-if="parsedMessage.messageText" class="message-text">
      {{ parsedMessage.messageText }}
    </div>

    <!-- Embedded Dates as Tags -->
    <div v-if="parsedMessage.hasEmbeddedDates" class="embedded-dates mt-3">
      <div class="flex items-center space-x-2 mb-2">
        <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="text-sm font-medium text-blue-600 dark:text-blue-400">Proposed Dates:</span>
      </div>
      
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(date, index) in parsedMessage.embeddedDates"
          :key="index"
          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors"
          :class="dateTagClass"
        >
          <svg class="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ date }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { parseMessageWithDates } from '../utils/messageUtils.js'

// Props
const props = defineProps({
  message: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'default', // 'default', 'sent', 'received'
    validator: (value) => ['default', 'sent', 'received'].includes(value)
  }
})

// Computed
const parsedMessage = computed(() => {
  return parseMessageWithDates(props.message)
})

const dateTagClass = computed(() => {
  switch (props.variant) {
    case 'sent':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700'
    case 'received':
      return 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-600'
    default:
      return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
  }
})
</script>

<style scoped>
.message-text {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.embedded-dates {
  /* Additional styling if needed */
}
</style> 