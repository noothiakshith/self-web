import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import * as bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const files = await prisma.file.findMany({
      orderBy: { uploadDate: 'desc' }
    })
    return NextResponse.json(files)
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching files' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const password = formData.get('password') as string

    // Verify password
    const isValid = password === process.env.UPLOAD_PASSWORD

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid password' },
        { status: 401 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads')
    await writeFile(join(uploadsDir, file.name), Buffer.from(await file.arrayBuffer()))

    // Save file metadata to database
    const savedFile = await prisma.file.create({
      data: {
        name: file.name,
        size: file.size,
        type: file.type,
        path: join('uploads', file.name)
      }
    })

    return NextResponse.json(savedFile)
  } catch (error) {
    return NextResponse.json(
      { message: 'Error uploading file' },
      { status: 500 }
    )
  }
}
