import { OcclusionData, OcclusionTemplate, Mask } from '../types/occlusion'

const TEMPLATE_VERSION = '1.0.0'

/**
 * Export occlusion data as a template JSON file
 */
export function exportOcclusionTemplate(occlusionData: OcclusionData): string {
  const template: OcclusionTemplate = {
    version: TEMPLATE_VERSION,
    createdAt: occlusionData.createdAt,
    imageDimensions: {
      width: occlusionData.imageWidth,
      height: occlusionData.imageHeight,
    },
    masks: occlusionData.masks.map((mask) => ({
      x: mask.x,
      y: mask.y,
      width: mask.width,
      height: mask.height,
      label: mask.label,
    })),
  }

  return JSON.stringify(template, null, 2)
}

/**
 * Download occlusion template as JSON file
 */
export function downloadOcclusionTemplate(
  occlusionData: OcclusionData,
  filename?: string
): void {
  const json = exportOcclusionTemplate(occlusionData)
  const element = document.createElement('a')
  element.setAttribute(
    'href',
    'data:text/json;charset=utf-8,' + encodeURIComponent(json)
  )
  element.setAttribute(
    'download',
    filename || `occlusion_${occlusionData.imageId}.json`
  )
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

/**
 * Import occlusion template from JSON string
 */
export function importOcclusionTemplate(jsonString: string): OcclusionTemplate {
  try {
    const template = JSON.parse(jsonString) as OcclusionTemplate

    // Validate template structure
    if (!template.version || !template.imageDimensions || !Array.isArray(template.masks)) {
      throw new Error('Invalid template format')
    }

    return template
  } catch (error) {
    throw new Error(`Failed to parse occlusion template: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Convert template to OcclusionData
 */
export function templateToOcclusionData(
  template: OcclusionTemplate,
  imagePath: string
): OcclusionData {
  const now = new Date().toISOString()

  const masks: Mask[] = template.masks.map((maskTemplate, index) => ({
    id: `mask_${now}_${index}`,
    x: maskTemplate.x,
    y: maskTemplate.y,
    width: maskTemplate.width,
    height: maskTemplate.height,
    label: maskTemplate.label,
    isVisible: true,
  }))

  return {
    imageId: `img_${Date.now()}`,
    imagePath,
    imageWidth: template.imageDimensions.width,
    imageHeight: template.imageDimensions.height,
    masks,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Validate occlusion data
 */
export function validateOcclusionData(data: OcclusionData): boolean {
  if (!data.imagePath || !data.imageWidth || !data.imageHeight) {
    return false
  }

  if (!Array.isArray(data.masks)) {
    return false
  }

  return data.masks.every((mask) => {
    return (
      typeof mask.x === 'number' &&
      typeof mask.y === 'number' &&
      typeof mask.width === 'number' &&
      typeof mask.height === 'number' &&
      typeof mask.label === 'string' &&
      typeof mask.isVisible === 'boolean'
    )
  })
}

/**
 * Clone occlusion data
 */
export function cloneOcclusionData(data: OcclusionData): OcclusionData {
  return JSON.parse(JSON.stringify(data))
}
