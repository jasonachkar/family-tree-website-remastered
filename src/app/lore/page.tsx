'use client'

import { useState } from 'react'
import { Person } from '@/types/Person'
import PersonCard from '@/components/PersonCard'
import AddPersonModal from '@/components/AddPersonModal'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function LorePage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [loreText, setLoreText] = useState('')
  const [people, setPeople] = useState<Person[]>([])

  const addPerson = (person: Person) => {
    setPeople([...people, { ...person, familyId: 'lore' }])
    setIsAddModalOpen(false)
  }

  const handleEditPerson = (editedPerson: Person) => {
    setPeople(prevPeople => prevPeople.map(person =>
      person.id === editedPerson.id ? editedPerson : person
    ))
  }

  const handleDeletePerson = (id: string) => {
    setPeople(prevPeople => prevPeople.filter(person => person.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">Family Lore</h1>
        
        {/* Lore Text Editor */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Write Your Family's Story</h2>
          <Textarea
            value={loreText}
            onChange={(e) => setLoreText(e.target.value)}
            placeholder="Start writing your family's history, stories, and traditions..."
            className="min-h-[200px] mb-4"
          />
        </div>

        {/* Related People Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Related People</h2>
            <Button onClick={() => setIsAddModalOpen(true)}>
              Add Person
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {people.map((person) => (
              <div key={person.id} className="relative">
                <PersonCard
                  person={person}
                  onPositionChange={() => {}}
                  onClick={() => {}}
                  isSelected={false}
                  selectedPoint={null}
                  isCreatingArrow={false}
                  onEdit={handleEditPerson}
                  onDelete={handleDeletePerson}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <AddPersonModal
          onAddPerson={addPerson}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  )
}
