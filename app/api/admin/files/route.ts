import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth-middleware"
import fs from "fs/promises"
import path from "path"

interface FileInfo {
  name: string
  path: string
  size: number
  type: string
  lastModified: Date
  isDirectory: boolean
}

// GET /api/admin/files - Get files in public/uploads directory
async function getFiles(req: NextRequest, context: any, { session }: any) {
  try {
    const { searchParams } = new URL(req.url)
    const directory = searchParams.get("directory") || ""
    
    // Security: Only allow access to uploads directory
    const uploadsPath = path.join(process.cwd(), "public", "uploads")
    const targetPath = path.join(uploadsPath, directory)
    
    // Ensure we're still within uploads directory
    if (!targetPath.startsWith(uploadsPath)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    try {
      await fs.access(targetPath)
    } catch {
      // Create uploads directory if it doesn't exist
      await fs.mkdir(uploadsPath, { recursive: true })
    }

    const files: FileInfo[] = []
    
    try {
      const entries = await fs.readdir(targetPath, { withFileTypes: true })
      
      for (const entry of entries) {
        const filePath = path.join(targetPath, entry.name)
        const stats = await fs.stat(filePath)
        const relativePath = path.relative(uploadsPath, filePath).replace(/\\/g, "/")
        
        files.push({
          name: entry.name,
          path: relativePath,
          size: stats.size,
          type: entry.isDirectory() ? "directory" : getFileType(entry.name),
          lastModified: stats.mtime,
          isDirectory: entry.isDirectory()
        })
      }
    } catch (error) {
      console.error("Error reading directory:", error)
    }

    // Sort: directories first, then files by name
    files.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json({
      files,
      currentPath: directory,
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + (file.isDirectory ? 0 : file.size), 0)
    })

  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
  }
}

// POST /api/admin/files - Upload file
async function uploadFile(req: NextRequest, context: any, { session }: any) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const directory = formData.get("directory") as string || ""
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Security: Validate file type and size
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "application/pdf", "text/plain", "application/json"
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 })
    }

    // Security: Sanitize filename
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const uploadsPath = path.join(process.cwd(), "public", "uploads", directory)
    const filePath = path.join(uploadsPath, sanitizedName)

    // Ensure directory exists
    await fs.mkdir(uploadsPath, { recursive: true })

    // Write file
    const bytes = await file.arrayBuffer()
    await fs.writeFile(filePath, Buffer.from(bytes))

    const stats = await fs.stat(filePath)
    const relativePath = path.relative(path.join(process.cwd(), "public", "uploads"), filePath).replace(/\\/g, "/")

    return NextResponse.json({
      message: "File uploaded successfully",
      file: {
        name: sanitizedName,
        path: relativePath,
        size: stats.size,
        type: getFileType(sanitizedName),
        lastModified: stats.mtime,
        isDirectory: false
      }
    })

  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

// DELETE /api/admin/files - Delete file
async function deleteFile(req: NextRequest, context: any, { session }: any) {
  try {
    const { searchParams } = new URL(req.url)
    const filePath = searchParams.get("path")
    
    if (!filePath) {
      return NextResponse.json({ error: "File path required" }, { status: 400 })
    }

    const uploadsPath = path.join(process.cwd(), "public", "uploads")
    const targetPath = path.join(uploadsPath, filePath)
    
    // Security: Ensure we're still within uploads directory
    if (!targetPath.startsWith(uploadsPath)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    try {
      const stats = await fs.stat(targetPath)
      
      if (stats.isDirectory()) {
        // Check if directory is empty
        const entries = await fs.readdir(targetPath)
        if (entries.length > 0) {
          return NextResponse.json({ error: "Directory not empty" }, { status: 400 })
        }
        await fs.rmdir(targetPath)
      } else {
        await fs.unlink(targetPath)
      }

      return NextResponse.json({ message: "File deleted successfully" })
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        return NextResponse.json({ error: "File not found" }, { status: 404 })
      }
      throw error
    }

  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
  }
}

function getFileType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  
  switch (ext) {
    case ".jpg":
    case ".jpeg":
    case ".png":
    case ".gif":
    case ".webp":
      return "image"
    case ".pdf":
      return "pdf"
    case ".txt":
      return "text"
    case ".json":
      return "json"
    case ".zip":
    case ".rar":
      return "archive"
    default:
      return "file"
  }
}

export const GET = withAuth(getFiles, "admin")
export const POST = withAuth(uploadFile, "admin")
export const DELETE = withAuth(deleteFile, "admin")
