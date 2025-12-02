"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Camera, 
  File, 
  Check, 
  AlertCircle,
  Loader2 
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onError?: (error: string) => void
  accept?: string
  maxSize?: number // in MB
  className?: string
  disabled?: boolean
  multiple?: boolean
  showPreview?: boolean
  placeholder?: string
}

interface UploadedFile {
  file: File
  url: string
  uploading: boolean
  progress: number
  error?: string
  uploaded: boolean
}

export function ImageUpload({
  value,
  onChange,
  onError,
  accept = "image/*",
  maxSize = 10,
  className,
  disabled = false,
  multiple = false,
  showPreview = true,
  placeholder = "Upload images"
}: ImageUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Upload failed")
    }

    const data = await response.json()
    return data.url
  }

  const handleFiles = useCallback(async (fileList: FileList) => {
    if (disabled) return

    const newFiles: UploadedFile[] = []
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        onError?.(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`)
        continue
      }

      // Validate file type
      if (!file.type.match(accept.replace("*", ".*"))) {
        onError?.(`File ${file.name} is not a valid file type.`)
        continue
      }

      const uploadedFile: UploadedFile = {
        file,
        url: URL.createObjectURL(file),
        uploading: true,
        progress: 0,
        uploaded: false,
      }

      newFiles.push(uploadedFile)
    }

    if (!multiple) {
      setFiles(newFiles.slice(0, 1))
    } else {
      setFiles(prev => [...prev, ...newFiles])
    }

    // Upload files
    for (const uploadedFile of newFiles) {
      try {
        const fileIndex = files.length + newFiles.indexOf(uploadedFile)
        
        // Simulate progress
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map((f, i) => 
            i === fileIndex ? { ...f, progress: Math.min(f.progress + 10, 90) } : f
          ))
        }, 200)

        const url = await uploadFile(uploadedFile.file)
        
        clearInterval(progressInterval)
        
        setFiles(prev => prev.map((f, i) => 
          i === fileIndex ? { 
            ...f, 
            url, 
            uploading: false, 
            progress: 100, 
            uploaded: true 
          } : f
        ))

        if (!multiple) {
          onChange(url)
        } else {
          // For multiple files, you might want to handle this differently
          onChange(url)
        }

      } catch (error) {
        const fileIndex = files.length + newFiles.indexOf(uploadedFile)
        setFiles(prev => prev.map((f, i) => 
          i === fileIndex ? { 
            ...f, 
            uploading: false, 
            error: error instanceof Error ? error.message : "Upload failed" 
          } : f
        ))
        onError?.(error instanceof Error ? error.message : "Upload failed")
      }
    }
  }, [disabled, maxSize, accept, multiple, onChange, onError, files.length])

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const openFileDialog = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <motion.div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
          dragActive 
            ? "border-primary bg-primary/5 scale-105" 
            : "border-gray-300 hover:border-primary hover:bg-gray-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center space-y-4"
        >
          <motion.div
            animate={{ 
              scale: dragActive ? 1.1 : 1,
              rotate: dragActive ? 5 : 0 
            }}
            transition={{ duration: 0.2 }}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              dragActive ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
            )}
          >
            {dragActive ? <Camera className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
          </motion.div>

          <div className="space-y-2">
            <p className="text-lg font-medium">
              {dragActive ? "Drop your files here" : placeholder}
            </p>
            <p className="text-sm text-gray-500">
              Drag and drop or click to select files
            </p>
            <p className="text-xs text-gray-400">
              Max file size: {maxSize}MB • Uploaded to Cloudinary • {accept}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className="pointer-events-none"
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose Files
          </Button>
        </motion.div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border"
              >
                {/* File Preview */}
                <div className="flex-shrink-0">
                  {showPreview && file.file.type.startsWith('image/') ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                      <img 
                        src={file.url} 
                        alt={file.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                      <File className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  
                  {/* Progress Bar */}
                  {file.uploading && (
                    <div className="mt-2">
                      <Progress value={file.progress} className="h-1" />
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {file.error && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {file.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="flex items-center space-x-2">
                  {file.uploading && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  )}
                  
                  {file.uploaded && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Check className="w-3 h-3 mr-1" />
                      Uploaded
                    </Badge>
                  )}
                  
                  {file.error && (
                    <Badge variant="destructive">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Failed
                    </Badge>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
                    }}
                    disabled={file.uploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
