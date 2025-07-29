// Message utilities for handling embedded dates in messages

/**
 * Format a message with embedded dates
 * @param {string} messageText - The main message text
 * @param {Array} selectedDates - Array of date strings (YYYY-MM-DD)
 * @returns {string} - Formatted message with embedded dates
 */
export function formatMessageWithDates(messageText, selectedDates = []) {
  if (!selectedDates || selectedDates.length === 0) {
    return messageText
  }

  // Create the embedded dates section
  const dateStrings = selectedDates.map(date => {
    const dateObj = new Date(date)
    return formatDateForMessage(dateObj)
  })

  // Format the message with embedded dates
  const datesSection = `\n\n📅 Proposed Dates:\n${dateStrings.map(date => `• ${date}`).join('\n')}`
  
  return messageText + datesSection
}

/**
 * Parse a message to extract embedded dates and text
 * @param {string} fullMessage - The complete message with potential embedded dates
 * @returns {Object} - { messageText, embeddedDates, hasEmbeddedDates }
 */
export function parseMessageWithDates(fullMessage) {
  if (!fullMessage) {
    return {
      messageText: '',
      embeddedDates: [],
      hasEmbeddedDates: false
    }
  }

  // Look for the embedded dates pattern
  const datesPattern = /\n\n📅 Proposed Dates:\n((?:• .+\n?)+)/
  const match = fullMessage.match(datesPattern)

  if (!match) {
    return {
      messageText: fullMessage,
      embeddedDates: [],
      hasEmbeddedDates: false
    }
  }

  // Extract the main message text (everything before the dates section)
  const messageText = fullMessage.replace(datesPattern, '').trim()

  // Extract the dates
  const datesSection = match[1]
  const dateLines = datesSection.split('\n').filter(line => line.startsWith('• '))
  const embeddedDates = dateLines.map(line => line.replace('• ', '').trim())

  return {
    messageText,
    embeddedDates,
    hasEmbeddedDates: true
  }
}

/**
 * Format a date for display in a message
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
export function formatDateForMessage(date) {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === now.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow'
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}

/**
 * Extract date objects from embedded date strings
 * @param {Array} embeddedDateStrings - Array of formatted date strings from messages
 * @returns {Array} - Array of Date objects
 */
export function parseDatesFromMessage(embeddedDateStrings) {
  const dates = []
  const now = new Date()
  
  embeddedDateStrings.forEach(dateString => {
    let date = null
    
    if (dateString.toLowerCase() === 'today') {
      date = new Date(now)
    } else if (dateString.toLowerCase() === 'tomorrow') {
      date = new Date(now)
      date.setDate(date.getDate() + 1)
    } else {
      // Try to parse the formatted date string
      date = new Date(dateString)
    }
    
    if (date && !isNaN(date.getTime())) {
      dates.push(date)
    }
  })
  
  return dates
}

/**
 * Get team IDs from a conversation for availability lookup
 * @param {Object} conversation - Conversation object
 * @returns {Array} - Array of two team IDs
 */
export function getTeamIdsFromConversation(conversation) {
  if (!conversation) return []
  
  return [
    conversation.requesting_team_id,
    conversation.target_team_id
  ].filter(Boolean)
}

/**
 * Create a preview of the message with embedded dates
 * @param {string} messageText - The main message text
 * @param {Array} selectedDates - Array of date strings (YYYY-MM-DD)
 * @returns {string} - Preview text for UI
 */
export function createMessagePreview(messageText, selectedDates = []) {
  if (!selectedDates || selectedDates.length === 0) {
    return messageText
  }

  const dateCount = selectedDates.length
  const dateText = dateCount === 1 ? '1 date' : `${dateCount} dates`
  
  return `${messageText} (includes ${dateText})`
} 