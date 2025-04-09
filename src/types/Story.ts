import { Person } from './Person'

export interface Story {
  id: string
  familyId: string
  title: string
  content: string
  relatedPeople: string[] // Always an array, never undefined
  createdAt: string
  updatedAt: string
}
