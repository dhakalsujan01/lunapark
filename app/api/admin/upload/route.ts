import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { withAuth } from "@/lib/auth-middleware"

// POST /api/admin/upload - Upload image files
async function uploadFile(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Only JPEG, PNG, WebP and GIF are allowed" 
      }, { status: 400 })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "File size too large. Maximum 5MB allowed" 
      }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-')
    const fileName = `${timestamp}-${originalName}`
    
    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = join(uploadDir, fileName)
    
    await writeFile(filePath, buffer)

    // Return the public URL
    const publicUrl = `/uploads/${fileName}`
    
    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      filename: fileName,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ 
      error: "Failed to upload file" 
    }, { status: 500 })
  }
}

// GET /api/admin/upload - List uploaded files
async function getUploadedFiles() {
  try {
    const { readdir, stat } = await import('fs/promises')
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    
    try {
      const files = await readdir(uploadDir)
      const fileDetails = await Promise.all(
        files
          .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
          .map(async (file) => {
            const filePath = join(uploadDir, file)
            const stats = await stat(filePath)
            return {
              name: file,
              url: `/uploads/${file}`,
              size: stats.size,
              created: stats.birthtime,
              modified: stats.mtime
            }
          })
      )
      
      // Sort by creation date (newest first)
      fileDetails.sort((a, b) => b.created.getTime() - a.created.getTime())
      
      return NextResponse.json({ files: fileDetails })
    } catch (error) {
      // Directory doesn't exist or is empty
      return NextResponse.json({ files: [] })
    }
  } catch (error) {
    console.error("Error listing files:", error)
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 })
  }
}

export const POST = withAuth(uploadFile, "admin")
export const GET = withAuth(getUploadedFiles, "admin")
