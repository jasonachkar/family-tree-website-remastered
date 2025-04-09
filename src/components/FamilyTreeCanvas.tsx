'use client'

import { useState } from 'react'
import PersonCard from './PersonCard'
import AddPersonForm from './AddPersonForm'
import { Person } from '@/types/Person'

export default function FamilyTreeCanvas() {
  const [people, setPeople] = useState<Person[]>([])

  const addPerson = (person: Person) => {
    setPeople([...people, person])
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <AddPersonForm onAddPerson={addPerson} />
      </div>
      <div className="relative w-full h-[600px] border-2 border-dashed border-gray-300 rounded-lg">
        {people.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>
    </div>
  )
}
