"use client"
import hmacSHA256 from 'crypto-js/hmac-sha256';
import md5 from 'crypto-js/md5';
import { useMemo, useState } from 'react';

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function toBase64FromBytes(arr: Uint8Array) {
  return btoa(String.fromCharCode(...Array.from(arr)));
}
function toBase64(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...Array.from(new Uint8Array(buffer))));
}
function toBase64Url(base64: string) {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

const hashTypes = [
  { label: 'SHA-256', value: 'sha-256' },
  { label: 'SHA-512', value: 'sha-512' },
  { label: 'MD5', value: 'md5' },
  { label: 'HMAC-SHA256', value: 'hmac-sha256' },
  { label: 'Random (Base64)', value: 'random-base64' },
  { label: 'Random (Hex)', value: 'random-hex' },
  { label: 'Random (Custom)', value: 'random-custom' },
];

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = `!\"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~`;
// Các ký tự dễ gây nhầm lẫn thường loại trừ khi sinh secret thủ công
const AMBIGUOUS = new Set(Array.from('0Ool1I|S5B8G6Z2'));

function uniqueChars(str: string): string {
  const set = new Set<string>();
  for (const ch of Array.from(str)) set.add(ch);
  return Array.from(set).join('');
}

function filterAmbiguous(alphabet: string, excludeAmbiguous: boolean) {
  if (!excludeAmbiguous) return alphabet;
  return Array.from(alphabet).filter(ch => !AMBIGUOUS.has(ch)).join('');
}

// Tính entropy xấp xỉ: bits = length * log2(|alphabet|)
function calcEntropyBits(length: number, alphabetSize: number) {
  if (alphabetSize <= 1 || length <= 0) return 0;
  return length * (Math.log(alphabetSize) / Math.log(2));
}
function entropyLabel(bits: number) {
  if (bits >= 128) return 'rất mạnh';
  if (bits >= 100) return 'mạnh';
  if (bits >= 80) return 'khá';
  if (bits >= 64) return 'trung bình';
  return 'yếu';
}

// Rejection sampling để tránh modulo bias khi map byte -> index
function getRandomIndexes(len: number, alphabetSize: number): number[] {
  if (alphabetSize <= 0) return [];
  const result: number[] = [];
  const threshold = 256 - (256 % alphabetSize); // nhận byte < threshold
  while (result.length < len) {
    const buf = new Uint8Array(Math.ceil((len - result.length) * 1.3)); // buffer dư để giảm vòng lặp
    crypto.getRandomValues(buf);
    for (let i = 0; i < buf.length && result.length < len; i++) {
      const v = buf[i];
      if (v < threshold) result.push(v % alphabetSize);
    }
  }
  return result;
}

function getRandomInt(maxExclusive: number): number {
  // Random int [0, maxExclusive)
  if (maxExclusive <= 0) return 0;
  const threshold = 0x100000000 - (0x100000000 % maxExclusive);
  while (true) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const v = buf[0];
    if (v < threshold) return v % maxExclusive;
  }
}

function shuffleInPlace<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const GenerateSecretKeyPage = () => {
  const [type, setType] = useState('sha-256');
  const [input, setInput] = useState('');
  const [secret, setSecret] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Tùy chỉnh cho Random (Base64/Hex)
  const [byteLen, setByteLen] = useState<number>(32);

  // Tùy chỉnh cho Random (Custom)
  const [len, setLen] = useState<number>(32);
  const [useLower, setUseLower] = useState(true);
  const [useUpper, setUseUpper] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(false);
  const [excludeAmb, setExcludeAmb] = useState(true);
  const [requireEachGroup, setRequireEachGroup] = useState(true);
  const [customChars, setCustomChars] = useState('');

  const computedAlphabet = useMemo(() => {
    let alpha = '';
    if (useLower) alpha += LOWER;
    if (useUpper) alpha += UPPER;
    if (useDigits) alpha += DIGITS;
    if (useSymbols) alpha += SYMBOLS;
    if (customChars) alpha += customChars;
    alpha = uniqueChars(alpha);
    alpha = filterAmbiguous(alpha, excludeAmb);
    return alpha;
  }, [useLower, useUpper, useDigits, useSymbols, customChars, excludeAmb]);

  const selectedGroups = useMemo(() => {
    const groups: string[] = [];
    if (useLower) groups.push(filterAmbiguous(LOWER, excludeAmb));
    if (useUpper) groups.push(filterAmbiguous(UPPER, excludeAmb));
    if (useDigits) groups.push(filterAmbiguous(DIGITS, excludeAmb));
    if (useSymbols) groups.push(filterAmbiguous(SYMBOLS, excludeAmb));
    return groups.filter(g => g.length > 0);
  }, [useLower, useUpper, useDigits, useSymbols, excludeAmb]);

  const entropyBits = useMemo(() => {
    return calcEntropyBits(len, computedAlphabet.length);
  }, [len, computedAlphabet]);

  function generateCustomRandom(): string {
    // Kiểm tra ràng buộc
    if (computedAlphabet.length === 0) {
      throw new Error('Vui lòng chọn ít nhất một nhóm ký tự hoặc nhập ký tự tùy chỉnh.');
    }
    if (len <= 0) {
      throw new Error('Độ dài phải lớn hơn 0.');
    }
    if (requireEachGroup && selectedGroups.length > len) {
      throw new Error(`Độ dài quá ngắn. Cần ít nhất ${selectedGroups.length} để chứa mỗi nhóm một ký tự.`);
    }

    // Đảm bảo ít nhất 1 ký tự từ mỗi nhóm đã chọn (không tính custom chars như một nhóm bắt buộc)
    const requiredChars: string[] = [];
    if (requireEachGroup) {
      for (const group of selectedGroups) {
        const idx = getRandomIndexes(1, group.length)[0];
        requiredChars.push(group[idx]);
      }
    }

    const remaining = len - requiredChars.length;
    const alpha = computedAlphabet;
    const indexes = getRandomIndexes(remaining, alpha.length);
    const chars = indexes.map(i => alpha[i]);
    const all = requiredChars.concat(chars);

    // Trộn vị trí để các ký tự bắt buộc không dồn đầu chuỗi
    shuffleInPlace(all);
    return all.join('');
  }

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
        const size = Math.max(1, Math.min(4096, byteLen | 0));
        const arr = new Uint8Array(size);
        window.crypto.getRandomValues(arr);
        setResult(toBase64FromBytes(arr));
      } else if (type === 'random-hex') {
        const size = Math.max(1, Math.min(4096, byteLen | 0));
        const arr = new Uint8Array(size);
        window.crypto.getRandomValues(arr);
        setResult(Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join(''));
      } else if (type === 'random-custom') {
        const out = generateCustomRandom();
        setResult(out);
      }
    } catch (e: any) {
      setError(e?.message || 'Có lỗi xảy ra!');
    }
  }

  function handleCopy() {
    if (!result) return;
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

      {(type.startsWith('sha-') || type === 'md5' || type === 'hmac-sha256') ? (
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

      {(type === 'random-base64' || type === 'random-hex') && (
        <div className='mb-4'>
          <label className='block mb-1 font-semibold'>Độ dài (bytes)</label>
          <div className='flex items-center gap-3'>
            <input
              className='border border-black px-3 py-2 w-24'
              type='number'
              min={1}
              max={4096}
              value={byteLen}
              onChange={e => setByteLen(Number(e.target.value))}
            />
            <span className='text-xs text-gray-600'>
              Giá trị mặc định: 32 bytes
            </span>
          </div>
        </div>
      )}

      {type === 'random-custom' && (
        <div className='mb-4 space-y-4'>
          <div>
            <label className='block mb-1 font-semibold'>Độ dài</label>
            <div className='flex items-center gap-3'>
              <input
                type='range'
                min={4}
                max={256}
                value={len}
                onChange={e => setLen(Number(e.target.value))}
                className='w-full'
              />
              <input
                className='border border-black px-2 py-1 w-20'
                type='number'
                min={1}
                max={1024}
                value={len}
                onChange={e => setLen(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className='block mb-1 font-semibold'>Nhóm ký tự</label>
            <div className='grid grid-cols-2 gap-2'>
              <label className='flex items-center gap-2'>
                <input type='checkbox' checked={useLower} onChange={e => setUseLower(e.target.checked)} />
                <span>chữ thường (a-z)</span>
              </label>
              <label className='flex items-center gap-2'>
                <input type='checkbox' checked={useUpper} onChange={e => setUseUpper(e.target.checked)} />
                <span>chữ hoa (A-Z)</span>
              </label>
              <label className='flex items-center gap-2'>
                <input type='checkbox' checked={useDigits} onChange={e => setUseDigits(e.target.checked)} />
                <span>số (0-9)</span>
              </label>
              <label className='flex items-center gap-2'>
                <input type='checkbox' checked={useSymbols} onChange={e => setUseSymbols(e.target.checked)} />
                <span>ký tự đặc biệt</span>
              </label>
            </div>
          </div>

          <div>
            <label className='block mb-1 font-semibold'>Ký tự tùy chỉnh (tuỳ chọn)</label>
            <input
              className='border border-black px-3 py-2 w-full'
              value={customChars}
              onChange={e => setCustomChars(e.target.value)}
              placeholder='Nhập thêm ký tự muốn cho phép...'
            />
          </div>

          <div className='grid grid-cols-1 gap-2'>
            <label className='flex items-center gap-2'>
              <input type='checkbox' checked={excludeAmb} onChange={e => setExcludeAmb(e.target.checked)} />
              <span>Loại trừ ký tự dễ nhầm lẫn (0/O, 1/l/I, S/5, B/8, G/6, Z/2, ...)</span>
            </label>
            <label className='flex items-center gap-2'>
              <input
                type='checkbox'
                checked={requireEachGroup}
                onChange={e => setRequireEachGroup(e.target.checked)}
              />
              <span>Bắt buộc chứa ít nhất một ký tự từ mỗi nhóm đã chọn</span>
            </label>
          </div>

          <div className='text-xs text-gray-600'>
            <div>Bảng chữ: {computedAlphabet.length} ký tự</div>
            <div>
              Entropy ước tính: {entropyBits.toFixed(1)} bits ({entropyLabel(entropyBits)}).
              Khuyến nghị ≥ 80 bits cho secret quan trọng, ≥ 128 bits cho khoá dài hạn.
            </div>
          </div>
        </div>
      )}

      <button
        className='px-4 py-2 bg-black text-white rounded hover:bg-gray-800 mb-4'
        onClick={handleGenerate}
        disabled={(type === 'hmac-sha256' && !secret)}
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

      <div className='mt-6 text-xs text-gray-500 space-y-1'>
        <div>Hỗ trợ: SHA-256, SHA-512, MD5, HMAC-SHA256, random key (Base64, Hex), Random (Custom) với độ dài và tập ký tự tuỳ chỉnh.</div>
        <div>Random (Base64/Hex) cho phép chọn số byte. Random (Custom) sử dụng Web Crypto và rejection sampling để tránh bias.</div>
      </div>
    </div>
  );
};

export default GenerateSecretKeyPage;
