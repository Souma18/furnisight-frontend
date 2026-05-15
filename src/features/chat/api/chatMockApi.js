import {
  CHAT_FALLBACK_REPLIES,
  CHAT_KEYWORD_RESPONSES,
  CHAT_WELCOME_MESSAGES,
} from '../mock/chatMockData'

function sleep(ms = 280) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let fallbackIndex = 0

function matchBotReply(text) {
  const lower = String(text).toLowerCase()
  const matched = CHAT_KEYWORD_RESPONSES.find((item) => item.keys.some((key) => lower.includes(key)))

  if (matched) {
    return {
      content: matched.reply,
      products: matched.product ? [matched.product] : [],
    }
  }

  const content = CHAT_FALLBACK_REPLIES[fallbackIndex % CHAT_FALLBACK_REPLIES.length]
  fallbackIndex += 1
  return { content, products: [] }
}

export async function fetchChatSessionMock() {
  await sleep(120)
  return {
    data: {
      messages: CHAT_WELCOME_MESSAGES,
      unreadCount: 1,
    },
  }
}

export async function sendChatMessageMock(text) {
  const delay = 900 + Math.random() * 600
  await sleep(delay)
  const reply = matchBotReply(text)

  return {
    data: {
      message: {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: reply.content,
        products: reply.products,
        createdAt: new Date().toISOString(),
      },
    },
  }
}
