'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from "@/components/ui/use-toast"
import { Download, Upload } from 'lucide-react'
import { downloadJSON, readJSONFile, ExportedData } from '@/utils/jsonOperations'

interface DataManagementProps {
  onImport: (data: ExportedData) => void
  getData: () => ExportedData
  familyName: string
}

export default function DataManagement({ onImport, getData, familyName }: DataManagementProps) {
  const [isImporting, setIsImporting] = useState(false)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    try {
      const data = await getData()
      const filename = `${familyName.toLowerCase().replace(/\s+/g, '-')}-family-data-${new Date().toISOString().split('T')[0]}.json`
      downloadJSON(data, filename)
      toast({
        title: "Export Successful",
        description: "Your family data has been exported successfully.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your family data.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const data = await readJSONFile(file)
      await onImport(data)
    } catch (error) {
      console.error('Error importing data:', error)
      toast({
        title: "Import Failed",
        description: "There was an error importing your family data. Please make sure the file is valid.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
        ref={fileInputRef}
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700"
      >
        <Upload className="w-4 h-4 mr-2" />
        Import Data
      </Button>
      <Button
        variant="outline"
        onClick={handleExport}
        className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700"
      >
        <Download className="w-4 h-4 mr-2" />
        Export Data
      </Button>
    </div>
  )
}
