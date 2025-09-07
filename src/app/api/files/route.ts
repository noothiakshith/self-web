import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'


export async function GET() {
  try {
    const files = await prisma.file.findMany({
      orderBy: { uploadDate: 'desc' }
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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename to prevent overwrites
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${file.name}`;
    const filePath = join(uploadsDir, uniqueFilename);

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

    // Write file to disk
    try {
      await writeFile(filePath, buffer);
    } catch (err) {
      console.error('Error writing file:', err);
      return NextResponse.json(
        { message: 'Error saving file to disk' },
        { status: 500 }
      );
    }

    // Save file metadata to database
    try {
      const savedFile = await prisma.file.create({
        data: {
          name: file.name,
          size: buffer.length,
          type: file.type || 'application/octet-stream',
          path: join('uploads', uniqueFilename)
        }
      });

      return NextResponse.json(savedFile);
    } catch (err) {
      // If database save fails, try to clean up the uploaded file
      try {
        await unlink(filePath);
      } catch (cleanupErr) {
        console.error('Failed to cleanup file after database error:', cleanupErr);
      }

      console.error('Error saving to database:', err);
      return NextResponse.json(
        { message: 'Error saving file metadata to database' },
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
