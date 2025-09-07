import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
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

    // Get the content from the database and convert to Uint8Array
    const buffer = file.content as Buffer
    const uint8Array = new Uint8Array(buffer)

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Disposition': `attachment; filename="${file.name}"`,
        'Content-Type': file.type,
      },
    })
  } catch (err) {
    console.error('Error downloading file:', err)
    return NextResponse.json(
      { message: 'Error downloading file' },
      { status: 500 }
    )
  }
}
