'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from "@/components/ui/use-toast"
import { Download, Upload, Lock } from 'lucide-react'
import { downloadJSON, readJSONFile, ExportedData } from '@/utils/jsonOperations'
import { useAuth } from '@/contexts/AuthContext'
import { hasFeatureAccess, getLimitMessage } from '@/utils/subscriptionLimits'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DataManagementProps {
  onImport: (data: ExportedData) => void
  getData: () => ExportedData
  familyName: string
}

export default function DataManagement({ onImport, getData, familyName }: DataManagementProps) {
  const [isImporting, setIsImporting] = useState(false)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  // Check if user has export feature access
  const canExport = user ? hasFeatureAccess(user.subscriptionTier, 'dataExport') : false

  const handleExport = async () => {
    // If user doesn't have export access, show upgrade toast
    if (!canExport) {
      toast({
        title: "Feature Restricted",
        description: getLimitMessage(user?.subscriptionTier || 'free', 'export')
      })

      setTimeout(() => {
        toast({
          title: "Upgrade Required",
          description: "Visit our pricing page to upgrade your subscription."
        })
      }, 1000)
      return
    }

    try {
      const data = await getData()
      const filename = `${familyName.toLowerCase().replace(/\s+/g, '-')}-family-data-${new Date().toISOString().split('T')[0]}.json`
      downloadJSON(data, filename)
      toast({
        title: "Export Successful",
        description: "Your family data has been exported successfully."
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your family data."
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
        description: "There was an error importing your family data. Please make sure the file is valid."
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

      {canExport ? (
        <Button
          variant="outline"
          onClick={handleExport}
          className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={handleExport}
                className="border-gray-200 text-gray-400 hover:bg-gray-50"
              >
                <Lock className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upgrade to Premium or Family plan to access data export</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
