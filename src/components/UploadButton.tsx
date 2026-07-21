import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { saveFile } from '../lib/fileStore'
import { upsertScore } from '../lib/scoreStore'

interface Props {
  onUploaded: () => void
}

export default function UploadButton({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.type !== 'application/pdf') {
      alert('PDF 파일만 업로드할 수 있어요.')
      return
    }
    setSaving(true)
    try {
      const id = crypto.randomUUID()
      await saveFile(id, file)
      upsertScore({
        id,
        title: file.name.replace(/\.pdf$/i, ''),
        tags: [],
        addedAt: Date.now(),
        mimeType: file.type,
        size: String(file.size),
        fileName: file.name,
        difficulty: 3,
        tuning: 'Standard',
        capo: 0,
        status: 'new',
        favorite: false,
      })
      onUploaded()
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장에 실패했어요.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleChange} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={saving}
        className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-white/25 disabled:opacity-60"
      >
        {!saving && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
        )}
        {saving ? '저장 중...' : 'PDF 업로드'}
      </button>
    </>
  )
}
