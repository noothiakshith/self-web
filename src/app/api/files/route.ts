import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const files = await prisma.file.findMany({
      orderBy: { uploadDate: 'desc' },
      select: {
        id: true,
        name: true,
        size: true,
        type: true,
        uploadDate: true,
        downloads: true
      }
    })
    return NextResponse.json(files)
  } catch (err) {
    console.error('Error fetching files:', err);
    return NextResponse.json(
      { message: 'Error fetching files' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.UPLOAD_PASSWORD) {
      console.error('UPLOAD_PASSWORD environment variable is not set');
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const uploadedFile = formData.get('file');
    const password = formData.get('password');

    // Validate inputs
    if (!uploadedFile) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { message: 'Password is required' },
        { status: 400 }
      );
    }

    // Type assertions after validation
    const file = uploadedFile as File;
    
    // Verify password
    const isValid = password === process.env.UPLOAD_PASSWORD;

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid password' },
        { status: 401 }
      );
    }

    // Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate file size (optional, adjust limit as needed)
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (buffer.length > MAX_SIZE) {
      return NextResponse.json(
        { message: 'File size exceeds limit (100MB)' },
        { status: 400 }
      );
    }

    // Save file to database
    try {
      const savedFile = await prisma.file.create({
        data: {
          name: file.name,
          size: buffer.length,
          type: file.type || 'application/octet-stream',
          content: buffer // Store file content in the database
        }
      });

      // Don't send the content field back in the response
      const { content, ...fileWithoutContent } = savedFile;
      return NextResponse.json(fileWithoutContent);
    } catch (err) {
      console.error('Error saving to database:', err);
      return NextResponse.json(
        { message: 'Error saving file to database' },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('Error processing upload:', err);
    return NextResponse.json(
      { message: 'Error processing file upload' },
      { status: 500 }
    )
  }
}
