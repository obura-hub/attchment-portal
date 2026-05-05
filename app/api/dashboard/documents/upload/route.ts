import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// File size limit: 5MB (5 * 1024 * 1024 bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
const ALLOWED_FILE_TYPES = ['application/pdf'];
const ALLOWED_EXTENSIONS = ['.pdf'];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const userId = formData.get('userId');
    const documentType = formData.get('documentType');
    const file = formData.get('file') as File;
    
    // Validate required fields (no applicationId needed)
    if (!userId || !documentType || !file) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, documentType, and file are required' },
        { status: 400 }
      );
    }
    
    // Validate file size
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
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid file type. Only PDF documents are allowed.` 
        },
        { status: 400 }
      );
    }
    
    // Validate file extension
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid file extension. Only .pdf files are allowed.` 
        },
        { status: 400 }
      );
    }
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents', userId.toString());
    await mkdir(uploadDir, { recursive: true });
    
    // Generate unique filename
    const timestamp = Date.now();
    const safeFileName = `${documentType}_${timestamp}.pdf`;
    const fullFilePath = path.join(uploadDir, safeFileName);
    const relativePath = `/uploads/documents/${userId}/${safeFileName}`;
    
    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(fullFilePath, buffer);
    
    // Validate document type is allowed
    const allowedDocumentTypes = [
      'introduction_letter', 'application_letter', 'cv', 'insurance', 'id_card'
    ];
    if (!allowedDocumentTypes.includes(documentType.toString())) {
      return NextResponse.json(
        { success: false, error: 'Invalid document type' },
        { status: 400 }
      );
    }
    
    // Convert userId to number (BIGINT)
    const userIdNum = parseInt(userId.toString());
    
    // Check if document already exists for this user
    const existingDoc = await query(
      `SELECT document_id FROM user_documents 
       WHERE user_id = @userId AND document_type = @documentType`,
      [
        { name: 'userId', value: userIdNum },
        { name: 'documentType', value: documentType.toString() }
      ]
    );
    
    if (existingDoc && existingDoc.length > 0) {
      // Update existing document (no application_id)
      await query(`
        UPDATE user_documents 
        SET document_name = @fileName, 
            file_path = @filePath, 
            file_size = @fileSize, 
            file_type = @fileType, 
            uploaded_at = GETDATE()
        WHERE user_id = @userId AND document_type = @documentType
      `, [
        { name: 'userId', value: userIdNum },
        { name: 'documentType', value: documentType.toString() },
        { name: 'fileName', value: file.name },
        { name: 'filePath', value: relativePath },
        { name: 'fileSize', value: file.size },
        { name: 'fileType', value: file.type }
      ]);
    } else {
      // Insert new document (no application_id column)
      await query(`
        INSERT INTO user_documents (user_id, document_type, document_name, file_path, file_size, file_type)
        VALUES (@userId, @documentType, @fileName, @filePath, @fileSize, @fileType)
      `, [
        { name: 'userId', value: userIdNum },
        { name: 'documentType', value: documentType.toString() },
        { name: 'fileName', value: file.name },
        { name: 'filePath', value: relativePath },
        { name: 'fileSize', value: file.size },
        { name: 'fileType', value: file.type }
      ]);
    }
    
    console.log(`Document uploaded: ${documentType} for user ${userId}`);
    
    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      filePath: relativePath,
      fileSize: file.size,
      fileName: file.name
    });
    
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload document. Please try again.' },
      { status: 500 }
    );
  }
}