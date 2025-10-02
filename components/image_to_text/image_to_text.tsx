'use client'
import { TitlePage } from '@/components'
import React, { useState } from 'react'
import Tesseract from 'tesseract.js'

const LANGS = [
  { code: 'vie', label: 'Tiếng Việt' },
  { code: 'eng', label: 'English' },
]

const ImageToTextPage = () => {
  const [file, setFile] = useState<File | null>(null)
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [text, setText] = useState<string>("")
  const [progress, setProgress] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState('vie')
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(""); setText(""); setProgress(0); setCopied(false)
    const f = e.target.files?.[0] || null
    setFile(f)
    setImgUrl(f ? URL.createObjectURL(f) : null)
  }

  const handleOCR = async () => {
    if (!file) return
    setLoading(true)
    setText("")
    setProgress(0)
    setError("")
    try {
      const { data } = await Tesseract.recognize(file, lang, {
        logger: m => {
          if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100))
        }
      })
      setText(data.text)
    } catch (e) {
      setError("Recognition error. Please try again or choose another image.")
    }
    setLoading(false)
  }

  const handleCopy = () => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  const handleDownload = () => {
    if (!text) return
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'image-to-text.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen text-center">
      <TitlePage>Image to Text Converter (OCR)</TitlePage>
      <div className="my-4">
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      <div className="mb-4">
        <label className="mr-2 font-semibold">Recognition language:</label>
        <select value={lang} onChange={e => setLang(e.target.value)} className="border px-2 py-1 rounded">
          {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </div>
      {imgUrl && (
        <div className="mb-4 flex flex-col items-center">
          <img src={imgUrl} alt="preview" className="max-h-64 rounded shadow mb-2" />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleOCR}
            disabled={loading}
          >
            {loading ? "Recognizing..." : "Recognize Text"}
          </button>
        </div>
      )}
      {loading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="text-sm mt-1">{progress}%</div>
        </div>
      )}
      {error && <div className="text-red-600 mb-3">{error}</div>}
      {text && (
        <div className="mt-6 text-left">
          <div className="flex items-center mb-2 gap-2">
            <span className="font-semibold">Result:</span>
            <button
              onClick={handleCopy}
              className="text-mono py-2 px-4 border border-black bg-white hover:bg-indigo-500 hover:text-white text-black rounded transition"
            >
              Copy
            </button>
            <button
              onClick={handleDownload}
              className="text-mono py-2 px-4 border border-black bg-white hover:bg-indigo-500 hover:text-white text-black rounded transition"
            >
              Download TXT
            </button>
            {copied && <span className="ml-2 text-green-500 text-xs">Copied!</span>}
          </div>
          <textarea
            className="w-full border rounded p-2 text-mono min-h-40"
            value={text}
            readOnly
            rows={8}
          />
        </div>
      )}
      <div className="mt-8 text-gray-500 text-sm">
        <b>Note:</b> Images are processed entirely in the browser, safe and secure.<br />
        Supports &quot;Tiếng Việt&quot; and English.
      </div>
    </div>
  )
}

export default ImageToTextPage