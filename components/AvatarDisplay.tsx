import React from 'react';
import { getAvatarById } from '../constants/avatars';

interface AvatarDisplayProps {
  avatarId?: string;
  size?: number;
  className?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ avatarId, size = 40, className = '' }) => {
  const avatar = getAvatarById(avatarId);

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 shadow-soft ${className}`}
      style={{
        width: size,
        height: size,
        background: avatar.bg,
      }}
    >
      <span style={{ fontSize: size * 0.5, lineHeight: 1 }}>{avatar.emoji}</span>
    </div>
  );
};
