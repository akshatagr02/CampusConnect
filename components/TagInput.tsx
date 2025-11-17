
import React, { useState } from 'react';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder: string;
  maxTags?: number;
}

const Tag: React.FC<{ tag: string; onRemove: () => void }> = ({ tag, onRemove }) => (
  <div className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium mr-2 mb-2 px-2.5 py-1 rounded-full">
    {tag}
    <button onClick={onRemove} className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

export const TagInput: React.FC<TagInputProps> = ({ tags, setTags, placeholder, maxTags }) => {
  const [inputValue, setInputValue] = useState('');
  const isLimitReached = maxTags !== undefined && tags.length >= maxTags;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault();
      if (!isLimitReached && !tags.includes(inputValue.trim())) {
        setTags([...tags, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div>
      <div className="flex flex-wrap">
        {tags.map((tag) => (
          <Tag key={tag} tag={tag} onRemove={() => removeTag(tag)} />
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isLimitReached ? `Maximum of ${maxTags} links reached` : placeholder}
        disabled={isLimitReached}
        className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  );
};
