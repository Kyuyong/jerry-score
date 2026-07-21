import { pdfjsLib } from './pdf'
import { getFile } from './fileStore'

export async function renderFirstPageThumbnail(scoreId: string, maxWidth = 160): Promise<string> {
  const blob = await getFile(scoreId)
  if (!blob) throw new Error('저장된 파일을 찾을 수 없어요.')
  const buffer = await blob.arrayBuffer()
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise
  try {
    const page = await doc.getPage(1)
    const baseViewport = page.getViewport({ scale: 1 })
    const scale = maxWidth / baseViewport.width
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvas, viewport }).promise
    return canvas.toDataURL()
  } finally {
    void doc.destroy()
  }
}
