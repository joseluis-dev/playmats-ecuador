import type { UIMessage } from 'ai';
import { generateId } from 'ai';

// LocalStorage keys
const CURRENT_CHAT_ID_KEY = 'chatbot:currentChatId:v1';
const CHAT_MESSAGES_KEY_PREFIX = 'chatbot:messages:'; // full key => prefix + chatId

interface StoredChat {
  id: string;
  messages: UIMessage[];
  updatedAt: number; // epoch ms
  version: number; // allow migrations later
}

const STORAGE_VERSION = 1;
const MAX_MESSAGES = 50; // límite para evitar crecimiento descontrolado

export function getOrCreateChatId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(CURRENT_CHAT_ID_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(CURRENT_CHAT_ID_KEY, id);
  }
  return id;
}

export function loadChat(id: string): UIMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CHAT_MESSAGES_KEY_PREFIX + id);
    if (!raw) return [];
    const stored: StoredChat = JSON.parse(raw);
    // Basic shape validation – if not matching, reset
    if (!stored || stored.id !== id || !Array.isArray(stored.messages)) return [];
    return stored.messages as UIMessage[];
  } catch {
    return [];
  }
}

export function saveChat(id: string, messages: UIMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Mantener solo los últimos N mensajes (preservando orden cronológico)
    const trimmed = messages.length > MAX_MESSAGES
      ? messages.slice(-MAX_MESSAGES)
      : messages;
    const payload: StoredChat = {
      id,
      messages: trimmed,
      updatedAt: Date.now(),
      version: STORAGE_VERSION,
    };
    localStorage.setItem(
      CHAT_MESSAGES_KEY_PREFIX + id,
      JSON.stringify(payload)
    );
  } catch (err) {
    // Fail silently but log in dev
    if (import.meta.env?.DEV) {
      console.warn('Failed to persist chat messages', err);
    }
  }
}

export function clearChat(id?: string) {
  if (typeof window === 'undefined') return;
  const chatId = id || localStorage.getItem(CURRENT_CHAT_ID_KEY);
  if (chatId) {
    localStorage.removeItem(CHAT_MESSAGES_KEY_PREFIX + chatId);
  }
}

export function resetChat() {
  if (typeof window === 'undefined') return;
  const id = generateId();
  localStorage.setItem(CURRENT_CHAT_ID_KEY, id);
  saveChat(id, []);
  return id;
}
