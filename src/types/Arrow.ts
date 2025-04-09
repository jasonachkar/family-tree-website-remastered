export type RelationType = 'parent' | 'spouse'
export type ConnectionPoint = 'top' | 'right' | 'bottom' | 'left'

export interface Arrow {
  id: string
  type: RelationType
  start: string
  end: string
  connectionPoint?: ConnectionPoint
}

export interface ArrowPosition {
  x1: number
  y1: number
  x2: number
  y2: number
}
