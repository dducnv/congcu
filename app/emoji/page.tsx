"use client"

import React, { useEffect, useState } from 'react';
import emojiData from '@/core/data_local/emoji.json';

type Emoji = {
  slug: string;
  character: string;
  unicodeName: string;
  codePoint: string;
  group: string;
  subGroup: string;
};

const EmojiPage = () => {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [filteredEmojis, setFilteredEmojis] = useState<Emoji[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [subGroups, setSubGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSubGroup, setSelectedSubGroup] = useState('');
  const [search, setSearch] = useState('');

  const [copied, setCopied] = useState('');

  useEffect(() => {
    setEmojis(emojiData);
    setFilteredEmojis(emojiData);
    const groupSet = new Set(emojiData.map((e: Emoji) => e.group));
    setGroups(Array.from(groupSet));
    setSubGroups([]);
  }, []);

  useEffect(() => {
    let filtered = emojis;
    if (selectedGroup) {
      filtered = filtered.filter(e => e.group === selectedGroup);
    }
    if (selectedSubGroup) {
      filtered = filtered.filter(e => e.subGroup === selectedSubGroup);
    }
    if (search) {
      filtered = filtered.filter(e =>
        e.unicodeName.toLowerCase().includes(search.toLowerCase()) ||
        e.slug.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredEmojis(filtered);
    if (selectedGroup) {
      const subSet = new Set(emojis.filter(e => e.group === selectedGroup).map(e => e.subGroup));
      setSubGroups(Array.from(subSet));
    } else {
      setSubGroups([]);
    }
  }, [selectedGroup, selectedSubGroup, search, emojis]);

  const handleCopy = (emoji: string) => {
    navigator.clipboard.writeText(emoji);
    setCopied(emoji);
    setTimeout(() => setCopied(''), 1000);
  };

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Emoji Finder</h1>
      <div className='flex flex-wrap gap-3 mb-4'>
        <input
          type='text'
          placeholder='Tìm kiếm emoji...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          className='border border-black px-3 py-2 min-w-60'
        />
        <select
          value={selectedGroup}
          onChange={e => { setSelectedGroup(e.target.value); setSelectedSubGroup(''); }}
          className='border border-black px-3 py-2'
        >
          <option value=''>Tất cả nhóm</option>
          {groups.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select
          value={selectedSubGroup}
          onChange={e => setSelectedSubGroup(e.target.value)}
          className='border border-black px-3 py-2'
          disabled={!selectedGroup}
        >
          <option value=''>Tất cả sub-group</option>
          {subGroups.map(sg => <option key={sg} value={sg}>{sg}</option>)}
        </select>
      </div>
      <div className='flex flex-wrap gap-4'>
        {filteredEmojis.map(e => (
          <div key={e.slug} className='p-2 border border-black bg-white w-32 flex flex-col items-center justify-between'>
            <div className='text-4xl p-4'>{e.character}</div>
            <div className='text-xs text-center mb-2'>{e.unicodeName}</div>
            <button
              className='w-full py-1 text-mono border border-black bg-white hover:bg-gray-200 hover:shadow-social-l hover:translate-y-social-4m hover:translate-x-social-4p  ease-in duration-200'
              onClick={() => handleCopy(e.character)}
            >
              {copied === e.character ? 'Đã copy!' : 'Copy'}
            </button>
          </div>
        ))}
        {filteredEmojis.length === 0 && <div>Không tìm thấy emoji phù hợp.</div>}
      </div>
    </div>
  );
};

export default EmojiPage;