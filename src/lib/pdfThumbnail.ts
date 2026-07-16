import { pdfjsLib } from './pdf'
import { downloadFileBlob } from './googleDrive'

export async function renderFirstPageThumbnail(scoreId: string, maxWidth = 160): Promise<string> {
  const blob = await downloadFileBlob(scoreId)
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
