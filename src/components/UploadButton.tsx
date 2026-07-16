import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { uploadPdf } from '../lib/googleDrive'
import { upsertScore } from '../lib/scoreStore'

interface Props {
  onUploaded: () => void
}

export default function UploadButton({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.type !== 'application/pdf') {
      alert('PDF 파일만 업로드할 수 있어요.')
      return
    }
    setProgress(0)
    try {
      const uploaded = await uploadPdf(file, setProgress)
      upsertScore({
        id: uploaded.id,
        title: file.name.replace(/\.pdf$/i, ''),
        tags: [],
        addedAt: Date.now(),
        mimeType: uploaded.mimeType,
        size: uploaded.size,
        fileName: file.name,
        difficulty: 3,
        tuning: 'Standard',
        capo: 0,
        status: 'new',
        favorite: false,
      })
      onUploaded()
    } catch (err) {
      alert(err instanceof Error ? err.message : '업로드에 실패했어요.')
    } finally {
      setProgress(null)
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleChange} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={progress !== null}
        className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-white/25 disabled:opacity-60"
      >
        {progress === null && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
        )}
        {progress !== null ? `업로드 중... ${progress}%` : 'PDF 업로드'}
      </button>
    </>
  )
}
