"use client"

import { TitlePage } from '@/components'
import { Container } from '@/components/container'
import React, { useState, useEffect, useRef } from 'react'

const blockInfo = [
  { icon: '🎯', tooltip: 'Nhập phần trăm và giá trị, kết quả sẽ tự động hiển thị.', formula: 'Kết quả = Giá trị × Phần trăm / 100' },
  { icon: '📊', tooltip: 'Nhập hai số, kết quả là tỷ lệ phần trăm số 1 trên số 2.', formula: 'Kết quả = Số 1 / Số 2 × 100' },
  { icon: '📈', tooltip: 'Nhập giá trị cũ và mới, kết quả là phần trăm thay đổi.', formula: 'Kết quả = (Giá trị mới - Giá trị cũ) / Giá trị cũ × 100' },
  { icon: '🔄', tooltip: 'Nhập tỷ lệ phần trăm và giá trị, chọn tăng hoặc giảm.', formula: 'Tăng: Giá trị × (1 + %/100), Giảm: Giá trị × (1 - %/100)' },
  { icon: '❓', tooltip: 'Nhập X và Y%, kết quả là số Z sao cho X là Y% của Z.', formula: 'Z = X / (Y / 100)' },
  { icon: '🧮', tooltip: 'Nhập kết quả và phần trăm, tính ra giá trị gốc.', formula: 'Giá trị gốc = Kết quả / (% / 100)' },
]

const BlockTitle = ({ children, icon, tooltip, formula, onShowFormula }: { children: React.ReactNode, icon: string, tooltip: string, formula: string, onShowFormula: () => void }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="text-base md:text-lg font-semibold text-left text-white text-mono bg-black">{icon} {children}</span>
    <span className="ml-1 text-gray-400 cursor-pointer" title={tooltip} onClick={onShowFormula}>ⓘ</span>
  </div>
)

const InputBlock = React.forwardRef(({ label, onKeyDown, ...props }: { label: string, onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void } & React.InputHTMLAttributes<HTMLInputElement>, ref: React.Ref<HTMLInputElement>) => (
  <div className="flex flex-col items-start min-w-[90px]">
    <label className="text-xs text-gray-600 mb-1 pl-1">{label}</label>
    <input ref={ref} {...props} className="border border-gray-800 px-3 py-2 w-24 md:w-32 text-right focus:outline-blue-400 text-base transition" onKeyDown={onKeyDown} />
  </div>
))
InputBlock.displayName = 'InputBlock'

const ResultBlock = ({ value, onCopy }: { value: string | null, onCopy: () => void }) => (
  <span className={`relative font-bold text-lg bg-yellow-100 px-4 py-2 rounded min-w-[70px] text-center transition-all duration-300 ${value === '?' ? 'opacity-50' : 'opacity-100'}`}>{value ?? '?'}
    <button onClick={onCopy} className="ml-2 text-xs text-blue-600 hover:underline" title="Copy">Copy</button>
  </span>
)

const ClearButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="ml-2 text-gray-500 hover:text-red-600 text-lg" title="Xóa"><span role="img" aria-label="clear">🗑️</span></button>
)


const FormulaPopup = ({ formula, onClose }: { formula: string, onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
    <div className="bg-white rounded-lg shadow-lg p-6 min-w-[250px] max-w-xs text-center relative">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-black">✕</button>
      <div className="text-base font-semibold mb-2">Công thức</div>
      <div className="text-sm text-gray-700 whitespace-pre-line">{formula}</div>
    </div>
  </div>
)

const DecimalSelect = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => (
  <select value={value} onChange={e => onChange(Number(e.target.value))} className="border border-gray-400 rounded px-2 py-1 ml-2 text-sm">
    {[0,1,2,3,4].map(n => <option key={n} value={n}>{n} số thập phân</option>)}
  </select>
)

const useCopy = () => {
  const [copied, setCopied] = useState(false)
  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }
  return { copied, copy }
}

const PercentBlocks = () => {
  // Tab state (mobile)
  const [tab, setTab] = useState(0)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // Decimal state
  const [decimal, setDecimal] = useState(2)

  // Formula popup
  const [showFormula, setShowFormula] = useState<{ idx: number, open: boolean }>({ idx: -1, open: false })

  // Block 1
  const [percent1, setPercent1] = useState('')
  const [value1, setValue1] = useState('')
  const [result1, setResult1] = useState<string | null>(null)
  const { copied: copied1, copy: copy1 } = useCopy()
  const ref1a = useRef<HTMLInputElement>(null)
  const ref1b = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const p = parseFloat(percent1)
    const v = parseFloat(value1)
    if (!isNaN(p) && !isNaN(v)) setResult1(((p * v) / 100).toFixed(decimal))
    else setResult1('?')
  }, [percent1, value1, decimal])
  const clear1 = () => { setPercent1(''); setValue1(''); setTimeout(() => ref1a.current?.focus(), 100) }

  // Block 2
  const [x2, setX2] = useState('')
  const [y2, setY2] = useState('')
  const [result2, setResult2] = useState<string | null>(null)
  const { copied: copied2, copy: copy2 } = useCopy()
  const ref2a = useRef<HTMLInputElement>(null)
  const ref2b = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const x = parseFloat(x2)
    const y = parseFloat(y2)
    if (!isNaN(x) && !isNaN(y) && y !== 0) setResult2(((x / y) * 100).toFixed(decimal))
    else setResult2('?')
  }, [x2, y2, decimal])
  const clear2 = () => { setX2(''); setY2(''); setTimeout(() => ref2a.current?.focus(), 100) }

  // Block 3
  const [old3, setOld3] = useState('')
  const [new3, setNew3] = useState('')
  const [result3, setResult3] = useState<string | null>(null)
  const { copied: copied3, copy: copy3 } = useCopy()
  const ref3a = useRef<HTMLInputElement>(null)
  const ref3b = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const o = parseFloat(old3)
    const n = parseFloat(new3)
    if (!isNaN(o) && !isNaN(n) && o !== 0) setResult3((((n - o) / o) * 100).toFixed(decimal))
    else setResult3('?')
  }, [old3, new3, decimal])
  const clear3 = () => { setOld3(''); setNew3(''); setTimeout(() => ref3a.current?.focus(), 100) }

  // Block 4
  const [percent4, setPercent4] = useState('')
  const [value4, setValue4] = useState('')
  const [mode4, setMode4] = useState<'tăng' | 'giảm'>('tăng')
  const [result4, setResult4] = useState<string | null>(null)
  const { copied: copied4, copy: copy4 } = useCopy()
  const ref4a = useRef<HTMLInputElement>(null)
  const ref4b = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const p = parseFloat(percent4)
    const v = parseFloat(value4)
    if (!isNaN(p) && !isNaN(v)) {
      const res = mode4 === 'tăng' ? v * (1 + p / 100) : v * (1 - p / 100)
      setResult4(res.toFixed(decimal))
    } else setResult4('?')
  }, [percent4, value4, mode4, decimal])
  const clear4 = () => { setPercent4(''); setValue4(''); setTimeout(() => ref4a.current?.focus(), 100) }

  // Block 5
  const [x5, setX5] = useState('')
  const [percent5, setPercent5] = useState('')
  const [result5, setResult5] = useState<string | null>(null)
  const { copied: copied5, copy: copy5 } = useCopy()
  const ref5a = useRef<HTMLInputElement>(null)
  const ref5b = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const x = parseFloat(x5)
    const p = parseFloat(percent5)
    if (!isNaN(x) && !isNaN(p) && p !== 0) setResult5((x / (p / 100)).toFixed(decimal))
    else setResult5('?')
  }, [x5, percent5, decimal])
  const clear5 = () => { setX5(''); setPercent5(''); setTimeout(() => ref5a.current?.focus(), 100) }

  // Block 6: Tính toán ngược (phụ)
  const [result6, setResult6] = useState('')
  const [percent6, setPercent6] = useState('')
  const [origin6, setOrigin6] = useState<string | null>(null)
  const { copied: copied6, copy: copy6 } = useCopy()
  const ref6a = useRef<HTMLInputElement>(null)
  const ref6b = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const r = parseFloat(result6)
    const p = parseFloat(percent6)
    if (!isNaN(r) && !isNaN(p) && p !== 0) setOrigin6((r / (p / 100)).toFixed(decimal))
    else setOrigin6('?')
  }, [result6, percent6, decimal])
  const clear6 = () => { setResult6(''); setPercent6(''); setTimeout(() => ref6a.current?.focus(), 100) }


  // Enter key logic
  const handleEnter = (clearFn: () => void) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') clearFn()
  }

  // Tab bar (mobile)
  const tabBlocks = [
    {
      label: 'Phần trăm của giá trị',
      block: (
        <Container width="w-full" className="p-5 mb-2 border border-black bg-gradient-to-br from-white to-blue-50">
          <BlockTitle icon={blockInfo[0].icon} tooltip={blockInfo[0].tooltip} formula={blockInfo[0].formula} onShowFormula={() => setShowFormula({ idx: 0, open: true })}>
            Tính phần trăm của một giá trị
          </BlockTitle>
          <div className="flex flex-wrap items-end gap-4">
            <InputBlock ref={ref1a} label="Phần trăm (%)" type="number" value={percent1} onChange={e => setPercent1(e.target.value)} placeholder="%" min="0" max="100" onKeyDown={handleEnter(clear1)} />
            <span className="mb-4">% của</span>
            <InputBlock ref={ref1b} label="Giá trị" type="number" value={value1} onChange={e => setValue1(e.target.value)} placeholder="Giá trị" onKeyDown={handleEnter(clear1)} />
            <span className="mb-4">=</span>
            <ResultBlock value={result1} onCopy={() => copy1(result1 ?? '')} />
            <ClearButton onClick={clear1} />
            {copied1 && <span className="text-green-600 text-xs ml-1">Đã copy!</span>}
          </div>
        </Container>
      )
    },
    {
      label: 'Tỷ lệ phần trăm',
      block: (
        <Container width="w-full" className="p-5 mb-2 border border-black bg-gradient-to-br from-white to-green-50">
          <BlockTitle icon={blockInfo[1].icon} tooltip={blockInfo[1].tooltip} formula={blockInfo[1].formula} onShowFormula={() => setShowFormula({ idx: 1, open: true })}>
            Tính tỷ lệ phần trăm một số là của số khác
          </BlockTitle>
          <div className="flex flex-wrap items-end gap-4">
            <InputBlock ref={ref2a} label="Số 1" type="number" value={x2} onChange={e => setX2(e.target.value)} placeholder="Số 1" onKeyDown={handleEnter(clear2)} />
            <span className="mb-4">là bao nhiêu % của</span>
            <InputBlock ref={ref2b} label="Số 2" type="number" value={y2} onChange={e => setY2(e.target.value)} placeholder="Số 2" onKeyDown={handleEnter(clear2)} />
            <span className="mb-4">=</span>
            <ResultBlock value={result2} onCopy={() => copy2(result2 ?? '')} />
            <span className="mb-4">%</span>
            <ClearButton onClick={clear2} />
            {copied2 && <span className="text-green-600 text-xs ml-1">Đã copy!</span>}
          </div>
        </Container>
      )
    },
    {
      label: 'Tăng/Giảm',
      block: (
        <Container width="w-full" className="p-5 mb-2 border border-black bg-gradient-to-br from-white to-pink-50">
          <BlockTitle icon={blockInfo[2].icon} tooltip={blockInfo[2].tooltip} formula={blockInfo[2].formula} onShowFormula={() => setShowFormula({ idx: 2, open: true })}>
            Tính phần trăm của giá trị thay đổi
          </BlockTitle>
          <div className="flex flex-wrap items-end gap-4">
            <span className="mb-4">Tỷ lệ tăng / giảm</span>
            <InputBlock ref={ref3a} label="Giá trị mới" type="number" value={new3} onChange={e => setNew3(e.target.value)} placeholder="Giá trị mới" onKeyDown={handleEnter(clear3)} />
            <span className="mb-4">-</span>
            <InputBlock ref={ref3b} label="Giá trị cũ" type="number" value={old3} onChange={e => setOld3(e.target.value)} placeholder="Giá trị cũ" onKeyDown={handleEnter(clear3)} />
            <span className="mb-4">=</span>
            <ResultBlock value={result3} onCopy={() => copy3(result3 ?? '')} />
            <span className="mb-4">%</span>
            <ClearButton onClick={clear3} />
            {copied3 && <span className="text-green-600 text-xs ml-1">Đã copy!</span>}
          </div>
        </Container>
      )
    },
    {
      label: 'Tăng/Giảm cụ thể',
      block: (
        <Container width="w-full" className="p-5 mb-2 border border-black bg-gradient-to-br from-white to-yellow-50">
          <BlockTitle icon={blockInfo[3].icon} tooltip={blockInfo[3].tooltip} formula={blockInfo[3].formula} onShowFormula={() => setShowFormula({ idx: 3, open: true })}>
            Tăng hoặc giảm một tỷ lệ cụ thể
          </BlockTitle>
          <div className="flex flex-wrap items-end gap-4">
            <InputBlock ref={ref4a} label="Tỷ lệ (%)" type="number" value={percent4} onChange={e => setPercent4(e.target.value)} placeholder="%" onKeyDown={handleEnter(clear4)} />
            <div className="flex flex-col items-start min-w-[90px]">
              <label className="text-xs text-gray-600 mb-1 pl-1">Chọn</label>
              <select value={mode4} onChange={e => setMode4(e.target.value as 'tăng' | 'giảm')} className="border px-3 py-2 border-gray-800 rounded text-base">
                <option value="tăng">tăng</option>
                <option value="giảm">giảm</option>
              </select>
            </div>
            <span className="mb-4">của</span>
            <InputBlock ref={ref4b} label="Giá trị" type="number" value={value4} onChange={e => setValue4(e.target.value)} placeholder="Giá trị" onKeyDown={handleEnter(clear4)} />
            <span className="mb-4">=</span>
            <ResultBlock value={result4} onCopy={() => copy4(result4 ?? '')} />
            <ClearButton onClick={clear4} />
            {copied4 && <span className="text-green-600 text-xs ml-1">Đã copy!</span>}
          </div>
        </Container>
      )
    },
    {
      label: 'X là Y% của Z',
      block: (
        <Container width="w-full" className="p-5 mb-2 border border-black bg-gradient-to-br from-white to-indigo-50">
          <BlockTitle icon={blockInfo[4].icon} tooltip={blockInfo[4].tooltip} formula={blockInfo[4].formula} onShowFormula={() => setShowFormula({ idx: 4, open: true })}>
            Số X là Y% của số Z. Z là?
          </BlockTitle>
          <div className="flex flex-wrap items-end gap-4">
            <span className="mb-4">Số</span>
            <InputBlock ref={ref5a} label="X" type="number" value={x5} onChange={e => setX5(e.target.value)} placeholder="X" onKeyDown={handleEnter(clear5)} />
            <span className="mb-4">là</span>
            <InputBlock ref={ref5b} label="Y%" type="number" value={percent5} onChange={e => setPercent5(e.target.value)} placeholder="%" onKeyDown={handleEnter(clear5)} />
            <span className="mb-4">% của số</span>
            <ResultBlock value={result5} onCopy={() => copy5(result5 ?? '')} />
            <ClearButton onClick={clear5} />
            {copied5 && <span className="text-green-600 text-xs ml-1">Đã copy!</span>}
          </div>
        </Container>
      )
    },
    {
      label: 'Tính ngược',
      block: (
        <Container width="w-full" className="p-5 mb-2 border border-black bg-gradient-to-br from-white to-gray-100">
          <BlockTitle icon={blockInfo[5].icon} tooltip={blockInfo[5].tooltip} formula={blockInfo[5].formula} onShowFormula={() => setShowFormula({ idx: 5, open: true })}>
            Tính toán ngược: Biết kết quả và %, tìm giá trị gốc
          </BlockTitle>
          <div className="flex flex-wrap items-end gap-4">
            <InputBlock ref={ref6a} label="Kết quả" type="number" value={result6} onChange={e => setResult6(e.target.value)} placeholder="Kết quả" onKeyDown={handleEnter(clear6)} />
            <span className="mb-4">là</span>
            <InputBlock ref={ref6b} label="%" type="number" value={percent6} onChange={e => setPercent6(e.target.value)} placeholder="%" onKeyDown={handleEnter(clear6)} />
            <span className="mb-4">của số</span>
            <ResultBlock value={origin6} onCopy={() => copy6(origin6 ?? '')} />
            <ClearButton onClick={clear6} />
            {copied6 && <span className="text-green-600 text-xs ml-1">Đã copy!</span>}
          </div>
        </Container>
      )
    },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-700">Làm tròn:</span>
          <DecimalSelect value={decimal} onChange={setDecimal} />
        </div>
        <div className="block md:hidden">
          <div className="flex gap-1 overflow-x-auto">
            {tabBlocks.map((t, i) => (
              <button key={i} className={`px-3 py-1 rounded-t-lg border-b-2 ${tab === i ? 'border-blue-600 bg-blue-50 font-bold' : 'border-transparent bg-gray-100'} text-xs`} onClick={() => setTab(i)}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>
      {/* Tab content on mobile, all blocks on desktop */}
      <div>
        <div className="block md:hidden">
          {tabBlocks[tab].block}
        </div>
        <div className="hidden md:block space-y-7">
          {tabBlocks.map((t, i) => <div key={i}>{t.block}</div>)}
        </div>
      </div>
      {showFormula.open && <FormulaPopup formula={blockInfo[showFormula.idx].formula} onClose={() => setShowFormula({ idx: -1, open: false })} />}
    </div>
  )
}

const page = () => {
  return (
    <div className="min-h-screen py-8 px-2">
      <TitlePage>Máy tính phần trăm</TitlePage>
      <PercentBlocks />
    </div>
  )
}

export default page