import { saveFamilyTreeToKV } from '@/contexts/FamilyContext'
import { updateStory } from '@/contexts/LoreContext'
import { Story } from '@/types/Story'
import { FamilyMember } from '@/components/FamilyTree'

export async function autoSaveChanges() {
  try {
    const currentFamilyId = localStorage.getItem('currentFamilyId')

    if (currentFamilyId) {
      // Auto-save family tree with validation
      const treeData = localStorage.getItem(`familyTree_${currentFamilyId}`)
      if (treeData) {
        const parsedTreeData: FamilyMember = JSON.parse(treeData)
        if (Object.keys(parsedTreeData).length > 0) {
          await saveFamilyTreeToKV(currentFamilyId, parsedTreeData)
        }
      }

      // Auto-save lore stories with validation
      const stories = localStorage.getItem(`stories_${currentFamilyId}`)
      if (stories) {
        const parsedStories: Story[] = JSON.parse(stories)
        if (parsedStories.length > 0) {
          for (const story of parsedStories) {
            await updateStory(story.id, story)
          }
        }
      }
    }

    console.log('Auto-save completed successfully')
  } catch (error) {
    console.error('Error during auto-save:', error)
  }
}
