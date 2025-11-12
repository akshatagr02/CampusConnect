import React from 'react';

interface AvatarProps {
  name: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ name, className }) => {
  const getInitials = (name: string) => {
    if (!name) return '??';
    const names = name.trim().split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Simple hashing function to get a consistent color for the avatar
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash; // Ensure 32bit integer
    }
    const colorRange = [
        '#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6'
    ];
    return colorRange[Math.abs(hash) % colorRange.length];
  };
  
  const initials = getInitials(name);
  const bgColor = stringToColor(name);

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-bold select-none ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <span>{initials}</span>
    </div>
  );
};

export default Avatar;
