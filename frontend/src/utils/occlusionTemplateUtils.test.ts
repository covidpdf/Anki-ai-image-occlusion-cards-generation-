import { describe, it, expect } from 'vitest'
import {
  exportOcclusionTemplate,
  importOcclusionTemplate,
  templateToOcclusionData,
  validateOcclusionData,
  cloneOcclusionData,
} from './occlusionTemplateUtils'
import { OcclusionData, OcclusionTemplate } from '../types/occlusion'

describe('occlusionTemplateUtils', () => {
  const mockOcclusionData: OcclusionData = {
    imageId: 'img1',
    imagePath: '/test.jpg',
    imageWidth: 800,
    imageHeight: 600,
    masks: [
      {
        id: 'mask1',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        label: 'Mask 1',
        isVisible: true,
      },
      {
        id: 'mask2',
        x: 200,
        y: 200,
        width: 150,
        height: 100,
        label: 'Mask 2',
        isVisible: false,
      },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }

  describe('exportOcclusionTemplate', () => {
    it('should export occlusion data as JSON string', () => {
      const json = exportOcclusionTemplate(mockOcclusionData)
      const template = JSON.parse(json) as OcclusionTemplate

      expect(template.version).toBe('1.0.0')
      expect(template.imageDimensions).toEqual({
        width: 800,
        height: 600,
      })
      expect(template.masks).toHaveLength(2)
    })

    it('should include mask coordinates and labels', () => {
      const json = exportOcclusionTemplate(mockOcclusionData)
      const template = JSON.parse(json) as OcclusionTemplate

      expect(template.masks[0]).toEqual({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        label: 'Mask 1',
      })
    })

    it('should not include mask id and isVisible in export', () => {
      const json = exportOcclusionTemplate(mockOcclusionData)
      const template = JSON.parse(json) as OcclusionTemplate

      expect(template.masks[0]).not.toHaveProperty('id')
      expect(template.masks[0]).not.toHaveProperty('isVisible')
    })

    it('should format JSON with proper indentation', () => {
      const json = exportOcclusionTemplate(mockOcclusionData)

      expect(json).toContain('\n')
      expect(json).toContain('  ')
    })
  })

  describe('importOcclusionTemplate', () => {
    it('should parse valid template JSON', () => {
      const json = exportOcclusionTemplate(mockOcclusionData)
      const template = importOcclusionTemplate(json)

      expect(template.version).toBe('1.0.0')
      expect(template.imageDimensions).toEqual({ width: 800, height: 600 })
      expect(template.masks).toHaveLength(2)
    })

    it('should throw error for invalid JSON', () => {
      expect(() => {
        importOcclusionTemplate('invalid json')
      }).toThrow()
    })

    it('should throw error for missing required fields', () => {
      expect(() => {
        importOcclusionTemplate('{"version": "1.0.0"}')
      }).toThrow('Invalid template format')
    })

    it('should throw error for invalid masks array', () => {
      expect(() => {
        importOcclusionTemplate(
          '{"version": "1.0.0", "imageDimensions": {"width": 800, "height": 600}, "masks": "not-an-array"}'
        )
      }).toThrow('Invalid template format')
    })
  })

  describe('templateToOcclusionData', () => {
    it('should convert template to occlusion data', () => {
      const json = exportOcclusionTemplate(mockOcclusionData)
      const template = importOcclusionTemplate(json)

      const occlusionData = templateToOcclusionData(template, '/new.jpg')

      expect(occlusionData.imagePath).toBe('/new.jpg')
      expect(occlusionData.imageWidth).toBe(800)
      expect(occlusionData.imageHeight).toBe(600)
      expect(occlusionData.masks).toHaveLength(2)
    })

    it('should generate new mask IDs', () => {
      const json = exportOcclusionTemplate(mockOcclusionData)
      const template = importOcclusionTemplate(json)

      const occlusionData = templateToOcclusionData(template, '/new.jpg')

      expect(occlusionData.masks[0].id).toBeTruthy()
      expect(occlusionData.masks[0].id).toMatch(/^mask_/)
    })

    it('should set all masks to visible', () => {
      const json = exportOcclusionTemplate(mockOcclusionData)
      const template = importOcclusionTemplate(json)

      const occlusionData = templateToOcclusionData(template, '/new.jpg')

      expect(occlusionData.masks[0].isVisible).toBe(true)
      expect(occlusionData.masks[1].isVisible).toBe(true)
    })

    it('should generate new imageId and timestamps', () => {
      const json = exportOcclusionTemplate(mockOcclusionData)
      const template = importOcclusionTemplate(json)

      const occlusionData = templateToOcclusionData(template, '/new.jpg')

      expect(occlusionData.imageId).toBeTruthy()
      expect(occlusionData.imageId).toMatch(/^img_/)
      expect(occlusionData.createdAt).toBeTruthy()
      expect(occlusionData.updatedAt).toBeTruthy()
    })

    it('should preserve mask coordinates and labels', () => {
      const json = exportOcclusionTemplate(mockOcclusionData)
      const template = importOcclusionTemplate(json)

      const occlusionData = templateToOcclusionData(template, '/new.jpg')

      expect(occlusionData.masks[0]).toMatchObject({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        label: 'Mask 1',
      })

      expect(occlusionData.masks[1]).toMatchObject({
        x: 200,
        y: 200,
        width: 150,
        height: 100,
        label: 'Mask 2',
      })
    })
  })

  describe('validateOcclusionData', () => {
    it('should validate correct occlusion data', () => {
      expect(validateOcclusionData(mockOcclusionData)).toBe(true)
    })

    it('should reject data without imagePath', () => {
      const invalid = { ...mockOcclusionData, imagePath: '' }
      expect(validateOcclusionData(invalid)).toBe(false)
    })

    it('should reject data without imageWidth', () => {
      const invalid = { ...mockOcclusionData, imageWidth: 0 }
      expect(validateOcclusionData(invalid)).toBe(false)
    })

    it('should reject data without imageHeight', () => {
      const invalid = { ...mockOcclusionData, imageHeight: 0 }
      expect(validateOcclusionData(invalid)).toBe(false)
    })

    it('should reject data with invalid masks array', () => {
      const invalid = { ...mockOcclusionData, masks: null }
      expect(validateOcclusionData(invalid as unknown as OcclusionData)).toBe(false)
    })

    it('should reject data with invalid mask properties', () => {
      const invalid = {
        ...mockOcclusionData,
        masks: [
          {
            id: 'mask1',
            x: 'invalid',
            y: 20,
            width: 100,
            height: 50,
            label: 'Mask 1',
            isVisible: true,
          },
        ],
      }
      expect(validateOcclusionData(invalid as unknown as OcclusionData)).toBe(false)
    })

    it('should reject masks with missing properties', () => {
      const invalid = {
        ...mockOcclusionData,
        masks: [
          {
            id: 'mask1',
            x: 10,
            y: 20,
            // missing width
            height: 50,
            label: 'Mask 1',
            isVisible: true,
          },
        ],
      }
      expect(validateOcclusionData(invalid as unknown as OcclusionData)).toBe(false)
    })
  })

  describe('cloneOcclusionData', () => {
    it('should create a deep clone of occlusion data', () => {
      const clone = cloneOcclusionData(mockOcclusionData)

      expect(clone).toEqual(mockOcclusionData)
      expect(clone).not.toBe(mockOcclusionData)
    })

    it('should create independent copy of masks array', () => {
      const clone = cloneOcclusionData(mockOcclusionData)

      clone.masks.push({
        id: 'mask3',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        label: 'New',
        isVisible: true,
      })

      expect(mockOcclusionData.masks).toHaveLength(2)
      expect(clone.masks).toHaveLength(3)
    })

    it('should create independent copy of mask objects', () => {
      const clone = cloneOcclusionData(mockOcclusionData)

      clone.masks[0].label = 'Modified'

      expect(mockOcclusionData.masks[0].label).toBe('Mask 1')
      expect(clone.masks[0].label).toBe('Modified')
    })
  })

  describe('Export/Import roundtrip', () => {
    it('should preserve data through export/import cycle', () => {
      const exported = exportOcclusionTemplate(mockOcclusionData)
      const imported = importOcclusionTemplate(exported)
      const converted = templateToOcclusionData(imported, mockOcclusionData.imagePath)

      expect(converted.imageWidth).toBe(mockOcclusionData.imageWidth)
      expect(converted.imageHeight).toBe(mockOcclusionData.imageHeight)
      expect(converted.masks).toHaveLength(mockOcclusionData.masks.length)

      converted.masks.forEach((mask, index) => {
        const original = mockOcclusionData.masks[index]
        expect(mask.x).toBe(original.x)
        expect(mask.y).toBe(original.y)
        expect(mask.width).toBe(original.width)
        expect(mask.height).toBe(original.height)
        expect(mask.label).toBe(original.label)
      })
    })
  })
})
