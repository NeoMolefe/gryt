import { supabase } from '@/lib/supabase'
import type { ChatHistoryEntry, ChatMessage, KwaziRequest, KwaziResponse } from '@/types/kwazi.types'

export async function sendKwaziMessage(input: KwaziRequest): Promise<KwaziResponse> {
  const { data, error } = await supabase.functions.invoke<KwaziResponse>('chat-kwazi', { body: input })

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('No response from Kwazi')
  }

  return data
}

const DAILY_LIMIT = 10

/** Remaining Kwazi messages for today, based on the kwazi_usage table. */
export async function fetchKwaziRemaining(userId: string): Promise<number> {
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('kwazi_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch Kwazi usage:', error.message)
    return DAILY_LIMIT
  }

  return Math.max(0, DAILY_LIMIT - (data?.count ?? 0))
}

export async function fetchChatHistory(userId: string): Promise<ChatHistoryEntry[]> {
  const { data, error } = await supabase
    .from('chat_history')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch chat history:', error.message)
    return []
  }

  return (data ?? []) as ChatHistoryEntry[]
}

export async function deleteChatHistoryEntry(id: string): Promise<void> {
  const { error } = await supabase.from('chat_history').delete().eq('id', id)
  if (error) {
    console.error('Failed to delete chat history entry:', error.message)
  }
}

export async function archiveChat(userId: string, messages: ChatMessage[], startedAt: string): Promise<void> {
  if (messages.length === 0) return

  const { error } = await supabase.from('chat_history').insert({
    user_id: userId,
    messages,
    started_at: startedAt,
    ended_at: new Date().toISOString(),
  })

  if (error) {
    console.error('Failed to archive chat history:', error.message)
  }
}
