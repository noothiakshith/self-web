import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createReadStream } from 'fs'
import { join } from 'path'

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

    const filePath = join(process.cwd(), file.path)

    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const chunks: Buffer[] = []
      const stream = createReadStream(filePath)

      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
      stream.on('error', (error) => reject(error))
      stream.on('end', () => {
        const buffer = Buffer.concat(chunks)
        resolve(
          buffer.buffer.slice(
            buffer.byteOffset,
            buffer.byteOffset + buffer.byteLength
          )
        )
      })
    })

    return new NextResponse(arrayBuffer, {
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
