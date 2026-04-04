// Predefined avatar options for Blunt users
// Self-contained emoji + gradient combos — no external images needed

export interface AvatarOption {
  id: string;
  label: string;
  emoji: string;
  bg: string; // CSS gradient
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'ghost', label: 'Ghost', emoji: '👻', bg: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { id: 'fire', label: 'Fire', emoji: '🔥', bg: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { id: 'skull', label: 'Skull', emoji: '💀', bg: 'linear-gradient(135deg, #0a1128, #434343)' },
  { id: 'alien', label: 'Alien', emoji: '👽', bg: 'linear-gradient(135deg, #11998e, #38ef7d)' },
  { id: 'ninja', label: 'Ninja', emoji: '🥷', bg: 'linear-gradient(135deg, #0f0c29, #302b63)' },
  { id: 'mask', label: 'Mask', emoji: '🎭', bg: 'linear-gradient(135deg, #fc4a1a, #f7b733)' },
  { id: 'robot', label: 'Robot', emoji: '🤖', bg: 'linear-gradient(135deg, #0067f5, #00d2ff)' },
  { id: 'devil', label: 'Devil', emoji: '😈', bg: 'linear-gradient(135deg, #800020, #ff416c)' },
  { id: 'eye', label: 'Eye', emoji: '👁️', bg: 'linear-gradient(135deg, #a8edea, #fed6e3)' },
  { id: 'crown', label: 'Crown', emoji: '👑', bg: 'linear-gradient(135deg, #f7971e, #ffd200)' },
  { id: 'shield', label: 'Shield', emoji: '🛡️', bg: 'linear-gradient(135deg, #0067f5, #0a1128)' },
  { id: 'thunder', label: 'Thunder', emoji: '⚡', bg: 'linear-gradient(135deg, #f12711, #f5af19)' },
];

export const getAvatarById = (id?: string): AvatarOption => {
  return AVATAR_OPTIONS.find(a => a.id === id) || AVATAR_OPTIONS[0];
};
