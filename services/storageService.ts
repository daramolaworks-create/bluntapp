import { BluntMessage, BluntReply } from '../types';

const STORAGE_KEY = 'blunt_messages_v1';

export const saveBlunt = (blunt: BluntMessage): void => {
  const existing = getStoredBlunts();
  existing.push(blunt);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

export const getBlunt = (id: string): BluntMessage | null => {
  const blunts = getStoredBlunts();
  return blunts.find((b) => b.id === id) || null;
};

export const updateBlunt = (updatedBlunt: BluntMessage): void => {
  const blunts = getStoredBlunts();
  const index = blunts.findIndex((b) => b.id === updatedBlunt.id);
  if (index !== -1) {
    blunts[index] = updatedBlunt;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blunts));
  }
};

export const addReply = (bluntId: string, replyContent: string): BluntMessage | null => {
  const blunt = getBlunt(bluntId);
  if (!blunt) return null;

  const reply: BluntReply = {
    id: crypto.randomUUID(),
    content: replyContent,
    createdAt: Date.now(),
  };

  const updatedBlunt = {
    ...blunt,
    replies: [...blunt.replies, reply],
  };

  updateBlunt(updatedBlunt);
  return updatedBlunt;
};

export const acknowledgeBlunt = (id: string): void => {
  const blunt = getBlunt(id);
  if (blunt) {
    updateBlunt({ ...blunt, acknowledged: true });
  }
};

export const denyBlunt = (id: string): void => {
  const blunt = getBlunt(id);
  if (blunt) {
    updateBlunt({ ...blunt, denied: true });
  }
};

export const getStoredBlunts = (): BluntMessage[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse storage', e);
    return [];
  }
};

export const getPublicBlunts = (): BluntMessage[] => {
  return getStoredBlunts().filter(b => b.postToFeed === true);
};
