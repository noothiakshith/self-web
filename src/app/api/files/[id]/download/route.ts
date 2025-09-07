import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createReadStream } from 'fs'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    
    const file = await prisma.file.findUnique({
      where: { id }
    })

    if (!file) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      )
    }

    // Increment download count
    await prisma.file.update({
      where: { id: file.id },
      data: { downloads: { increment: 1 } }
    })

    const filePath = join(process.cwd(), file.path)
    const stream = createReadStream(filePath)

    return new NextResponse(stream as any, {
      headers: {
        'Content-Disposition': `attachment; filename="${file.name}"`,
        'Content-Type': file.type
      }
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error downloading file' },
      { status: 500 }
    )
  }
}
