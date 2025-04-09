'use client'

import { useRef, useEffect, useState } from 'react'
import { Person } from '@/types/Person'
import { Arrow, RelationType, ArrowPosition } from '@/types/Arrow'

interface ArrowCreatorProps {
  arrows: Arrow[]
  people: Person[]
  onDeleteArrow: (arrowId: string) => void
  onUpdateArrow: (arrow: Arrow) => void
  isDeletingArrow: boolean
}

export default function ArrowCreator({
  arrows,
  people,
  onDeleteArrow,
  onUpdateArrow,
  isDeletingArrow
}: ArrowCreatorProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedArrow, setSelectedArrow] = useState<string | null>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const CARD_WIDTH = 192
    const CARD_HEIGHT = 220
    const VERTICAL_GAP = 40
    const HORIZONTAL_GAP = 20

    // Clear existing arrows
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild)
    }

    const getPersonTopCenter = (person: Person) => ({
      x: person.x + CARD_WIDTH / 2,
      y: person.y
    })

    const isPointInsideCard = (x: number, y: number, person: Person) => {
      return x >= person.x && x <= person.x + CARD_WIDTH &&
             y >= person.y && y <= person.y + CARD_HEIGHT
    }

    const findPathAroundCards = (startX: number, startY: number, endX: number, endY: number) => {
      const path: [number, number][] = [[startX, startY]]
      let currentX = startX
      let currentY = startY

      const moveVertically = (targetY: number) => {
        const step = Math.sign(targetY - currentY) * VERTICAL_GAP
        while (Math.abs(targetY - currentY) > VERTICAL_GAP) {
          currentY += step
          if (people.some(p => isPointInsideCard(currentX, currentY, p))) {
            currentY -= step
            moveHorizontally(currentX < endX ? HORIZONTAL_GAP : -HORIZONTAL_GAP)
          } else {
            path.push([currentX, currentY])
          }
        }
        currentY = targetY
        path.push([currentX, currentY])
      }

      const moveHorizontally = (step: number) => {
        while (Math.abs(endX - currentX) > Math.abs(step)) {
          currentX += step
          if (people.some(p => isPointInsideCard(currentX, currentY, p))) {
            currentX -= step
            moveVertically(currentY < endY ? currentY + VERTICAL_GAP : currentY - VERTICAL_GAP)
            break
          } else {
            path.push([currentX, currentY])
          }
        }
        currentX = endX
        path.push([currentX, currentY])
      }

      moveVertically(endY)
      moveHorizontally(endX > startX ? HORIZONTAL_GAP : -HORIZONTAL_GAP)

      return path
    }

    const createArrowLine = (
      path: string,
      arrowId: string,
      isHighlighted: boolean = false
    ) => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const color = '#000000'
      const strokeWidth = isHighlighted ? '3' : '2'

      line.setAttribute('d', path)
      line.setAttribute('stroke', color)
      line.setAttribute('stroke-width', strokeWidth)
      line.setAttribute('fill', 'none')
      
      if (isDeletingArrow) {
        line.style.cursor = 'pointer'
        line.addEventListener('click', () => onDeleteArrow(arrowId))
      } else {
        line.style.cursor = 'pointer'
        line.addEventListener('click', () => setSelectedArrow(arrowId))
      }

      group.appendChild(line)

      line.addEventListener('mouseenter', () => {
        line.setAttribute('stroke-width', '3')
      })
      line.addEventListener('mouseleave', () => {
        line.setAttribute('stroke-width', strokeWidth)
      })

      return group
    }

    const spouseArrows = arrows.filter(arrow => arrow.type === 'spouse')
    const parentArrows = arrows.filter(arrow => arrow.type === 'parent')

    // Draw spouse arrows
    spouseArrows.forEach(arrow => {
      const startPerson = people.find(p => p.id === arrow.start)
      const endPerson = people.find(p => p.id === arrow.end)
      
      if (startPerson && endPerson) {
        const start = getPersonTopCenter(startPerson)
        const end = getPersonTopCenter(endPerson)
        
        const path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`

        const arrowLine = createArrowLine(
          path,
          arrow.id,
          selectedArrow === arrow.id
        )
        svg.appendChild(arrowLine)
      }
    })

    // Group children by their parent (spouse) arrow
    const childrenByParents = parentArrows.reduce((acc, arrow) => {
      if (!acc[arrow.start]) {
        acc[arrow.start] = []
      }
      acc[arrow.start].push(arrow.end)
      return acc
    }, {} as Record<string, string[]>)

    // Draw parent-child arrows
    Object.entries(childrenByParents).forEach(([spouseArrowId, childrenIds]) => {
      const spouseArrow = spouseArrows.find(sa => sa.id === spouseArrowId)
      if (!spouseArrow) return

      const startPerson = people.find(p => p.id === spouseArrow.start)
      const endPerson = people.find(p => p.id === spouseArrow.end)
      
      if (startPerson && endPerson) {
        const start = getPersonTopCenter(startPerson)
        const end = getPersonTopCenter(endPerson)
        
        const midpointX = (start.x + end.x) / 2
        const midpointY = start.y

        // Sort children by their x position
        const sortedChildren = childrenIds
          .map(id => people.find(p => p.id === id))
          .filter((p): p is Person => p !== undefined)
          .sort((a, b) => a.x - b.x)

        // Calculate the vertical line length
        const maxChildY = Math.min(...sortedChildren.map(c => c.y)) - VERTICAL_GAP

        // Draw the main vertical line
        let path = `M ${midpointX} ${midpointY} L ${midpointX} ${maxChildY}`

        // Draw lines for each child
        sortedChildren.forEach((child) => {
          const childTop = getPersonTopCenter(child)
          const pathPoints = findPathAroundCards(midpointX, maxChildY, childTop.x, childTop.y)
          path += ' ' + pathPoints.map((point, index) => 
            `${index === 0 ? 'M' : 'L'} ${point[0]} ${point[1]}`
          ).join(' ')
        })

        const arrowLine = createArrowLine(
          path,
          spouseArrowId,
          selectedArrow === spouseArrowId
        )
        svg.appendChild(arrowLine)
      }
    })

  }, [arrows, people, onDeleteArrow, onUpdateArrow, isDeletingArrow, selectedArrow])

  return (
    <svg 
      ref={svgRef} 
      className="absolute top-0 left-0 w-full h-full" 
      style={{ pointerEvents: isDeletingArrow ? 'auto' : 'none' }}
    />
  )
}
