import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const applicationId = formData.get('applicationId');
    const userId = formData.get('userId');
    const file = formData.get('file') as File;
    
    // Validate required fields
    if (!applicationId || !userId || !file) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: applicationId, userId, and file are required' },
        { status: 400 }
      );
    }
    
    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are allowed. Please upload a PDF document.' },
        { status: 400 }
      );
    }
    
    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        { 
          success: false, 
          error: `File size (${fileSizeMB}MB) exceeds the maximum allowed size of 5MB.` 
        },
        { status: 400 }
      );
    }
    
    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'attachment-letters');
    await mkdir(uploadDir, { recursive: true });
    
    // Generate unique filename
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const safeFileName = `attachment_letter_${userId}_${timestamp}${extension}`;
    const filePath = path.join(uploadDir, safeFileName);
    const relativePath = `/uploads/attachment-letters/${safeFileName}`;
    
    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    
    // Check if attachment already exists for this application
    const existing = await query(
      `SELECT letter_id FROM attachment_letters WHERE application_id = @applicationId AND is_active = 1`,
      [{ name: 'applicationId', value: parseInt(applicationId.toString()) }]
    );
    
    if (existing && existing.length > 0) {
      // Update existing attachment
      await query(`
        UPDATE attachment_letters 
        SET file_path = @filePath, 
            file_name = @fileName, 
            file_size = @fileSize,
            uploaded_at = GETDATE()
        WHERE application_id = @applicationId AND is_active = 1
      `, [
        { name: 'applicationId', value: parseInt(applicationId.toString()) },
        { name: 'filePath', value: relativePath },
        { name: 'fileName', value: file.name },
        { name: 'fileSize', value: file.size }
      ]);
    } else {
      // Insert new attachment
      await query(`
        INSERT INTO attachment_letters (application_id, user_id, file_path, file_name, file_size, uploaded_by, uploaded_at)
        VALUES (@applicationId, @userId, @filePath, @fileName, @fileSize, 1, GETDATE())
      `, [
        { name: 'applicationId', value: parseInt(applicationId.toString()) },
        { name: 'userId', value: parseInt(userId.toString()) },
        { name: 'filePath', value: relativePath },
        { name: 'fileName', value: file.name },
        { name: 'fileSize', value: file.size }
      ]);
    }
    
    console.log(`Attachment letter uploaded for application ${applicationId}, user ${userId}`);
    
    return NextResponse.json({
      success: true,
      message: 'Attachment letter uploaded successfully',
      filePath: relativePath,
      fileName: file.name,
      fileSize: file.size
    });
    
  } catch (error) {
    console.error('Error uploading attachment letter:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload attachment letter. Please try again.' },
      { status: 500 }
    );
  }
}