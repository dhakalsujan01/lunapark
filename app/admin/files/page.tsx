"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileImage, Upload, Trash2, Search, Download, Eye } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface FileItem {
  _id: string
  filename: string
  originalName: string
  url: string
  size: number
  mimeType: string
  uploadedBy: string
  createdAt: string
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchFiles()
  }, [])

  async function fetchFiles() {
    try {
      const response = await fetch("/api/admin/files")
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files)
      }
    } catch (error) {
      console.error("Failed to fetch files:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/admin/files/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setFiles(prev => [data.file, ...prev])
        toast({
          title: "Success",
          description: "File uploaded successfully",
        })
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("Upload failed:", error)
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      event.target.value = "" // Reset input
    }
  }

  async function deleteFile(fileId: string) {
    if (!confirm("Are you sure you want to delete this file?")) return

    try {
      const response = await fetch(`/api/admin/files/${fileId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFiles(files.filter(f => f._id !== fileId))
        toast({
          title: "Success",
          description: "File deleted successfully",
        })
      }
    } catch (error) {
      console.error("Failed to delete file:", error)
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      })
    }
  }

  const filteredFiles = files.filter(file =>
    file.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) || false
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if ((mimeType || '').startsWith("image/")) {
      return <FileImage className="h-6 w-6 text-blue-600" />
    }
    return <FileImage className="h-6 w-6 text-gray-600" />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">File Management</h1>
          <p className="text-muted-foreground">Upload and manage your park media files</p>
        </div>
        <div className="flex space-x-2">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,video/*,.pdf,.doc,.docx"
          />
          <Button
            onClick={() => document.getElementById("file-upload")?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileImage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Images</CardTitle>
            <FileImage className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {files.filter(f => (f.mimeType || '').startsWith("image/")).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <FileImage className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatFileSize(files.reduce((total, file) => total + (file.size || 0), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading files...</div>
        ) : filteredFiles.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            {searchTerm ? "No files found matching your search." : "No files uploaded yet."}
          </div>
        ) : (
          filteredFiles.map((file) => (
            <Card key={file._id} className="overflow-hidden">
              <CardContent className="p-0">
                {(file.mimeType || '').startsWith("image/") ? (
                  <div className="aspect-video relative">
                    <img
                      src={file.url || '#'}
                      alt={file.originalName || file.filename || 'File'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    {getFileIcon(file.mimeType || 'application/octet-stream')}
                  </div>
                )}
                
                <div className="p-4 space-y-2">
                  <div>
                    <h3 className="font-medium text-sm truncate" title={file.originalName || file.filename || 'File'}>
                      {file.originalName || file.filename || 'File'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size || 0)} • {new Date(file.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(file.url || '#', "_blank")}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const a = document.createElement("a")
                          a.href = file.url || '#'
                          a.download = file.originalName || file.filename || 'file'
                          a.click()
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteFile(file._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}