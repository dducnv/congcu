"use client"
import React, { useState } from 'react';
import md5 from 'crypto-js/md5';
import hmacSHA256 from 'crypto-js/hmac-sha256';

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function toBase64(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...Array.from(new Uint8Array(buffer))));
}

const hashTypes = [
  { label: 'SHA-256', value: 'sha-256' },
  { label: 'SHA-512', value: 'sha-512' },
  { label: 'MD5', value: 'md5' },
  { label: 'HMAC-SHA256', value: 'hmac-sha256' },
  { label: 'Random (Base64)', value: 'random-base64' },
  { label: 'Random (Hex)', value: 'random-hex' },
];

const GenerateSecretKeyPage = () => {
  const [type, setType] = useState('sha-256');
  const [input, setInput] = useState('');
  const [secret, setSecret] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    setError('');
    setResult('');
    let realInput = input;
    if (
      (type.startsWith('sha-') || type === 'md5' || type === 'hmac-sha256') &&
      !input
    ) {
      // Sinh chuỗi random nếu input rỗng
      const arr = new Uint8Array(16);
      window.crypto.getRandomValues(arr);
      realInput = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
      setInput(realInput); // Cập nhật input để user thấy
    }
    try {
      if (type.startsWith('sha-')) {
        const enc = new TextEncoder().encode(realInput);
        const hash = await window.crypto.subtle.digest(type, enc);
        setResult(toHex(hash));
      } else if (type === 'md5') {
        setResult(md5(realInput).toString());
      } else if (type === 'hmac-sha256') {
        if (!secret) {
          setError('Vui lòng nhập secret cho HMAC!');
          return;
        }
        setResult(hmacSHA256(realInput, secret).toString());
      } else if (type === 'random-base64') {
        const arr = new Uint8Array(32);
        window.crypto.getRandomValues(arr);
        setResult(btoa(String.fromCharCode(...Array.from(arr))));
      } else if (type === 'random-hex') {
        const arr = new Uint8Array(32);
        window.crypto.getRandomValues(arr);
        setResult(Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join(''));
      }
    } catch (e) {
      setError('Có lỗi xảy ra!');
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }

  return (
    <div className='max-w-xl mx-auto p-6 text-mono'>
      <h1 className='text-2xl font-bold mb-4'>Tạo khoá bảo mật</h1>
      <div className='mb-4'>
        <label className='block mb-1 font-semibold'>Chọn loại khoá</label>
        <select
          className='border border-black px-3 py-2 w-full'
          value={type}
          onChange={e => setType(e.target.value)}
        >
          {hashTypes.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {type.startsWith('sha-') || type === 'md5' || type === 'hmac-sha256' ? (
        <div className='mb-4'>
          <label className='block mb-1 font-semibold'>Chuỗi nguồn</label>
          <div className='flex gap-2'>
            <input
              className='border border-black px-3 py-2 w-full'
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder='Nhập chuỗi nguồn...'
            />
            <button
              type='button'
              className='px-3 py-2 border border-black bg-white hover:bg-gray-200 text-xs whitespace-nowrap'
              onClick={() => {
                const arr = new Uint8Array(16);
                window.crypto.getRandomValues(arr);
                setInput(Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join(''));
              }}
            >
              Random
            </button>
          </div>
        </div>
      ) : null}
      {type === 'hmac-sha256' && (
        <div className='mb-4'>
          <label className='block mb-1 font-semibold'>Secret</label>
          <input
            className='border border-black px-3 py-2 w-full'
            value={secret}
            onChange={e => setSecret(e.target.value)}
            placeholder='Nhập secret...'
          />
        </div>
      )}
      <button
        className='px-4 py-2 bg-black text-white rounded hover:bg-gray-800 mb-4'
        onClick={handleGenerate}
        disabled={type === 'hmac-sha256' && !secret}
      >
        Tạo khoá
      </button>
      {error && <div className='text-red-500 mb-2'>{error}</div>}
      {result && (
        <div className='mb-2'>
          <label className='block mb-1 font-semibold'>Kết quả</label>
          <div className='flex items-center gap-2'>
            <input
              className='border border-black px-3 py-2 w-full font-mono text-xs'
              value={result}
              readOnly
            />
            <button
              className='px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs'
              onClick={handleCopy}
            >
              {copied ? 'Đã copy!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
      <div className='mt-6 text-xs text-gray-500'>
        Hỗ trợ: SHA-256, SHA-512, MD5, HMAC-SHA256, random key (Base64, Hex).<br/>
      </div>
    </div>
  );
};

export default GenerateSecretKeyPage;