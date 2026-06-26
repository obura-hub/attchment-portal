import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const applicationId = url.searchParams.get('applicationId');
    
    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'Application ID required' },
        { status: 400 }
      );
    }
    
    // Fetch attachment letter for this application
    const letters = await query(`
      SELECT file_path, file_name, uploaded_at
      FROM attachment_letters
      WHERE application_id = @applicationId AND is_active = 1
      ORDER BY uploaded_at DESC
    `, [{ name: 'applicationId', value: parseInt(applicationId) }]);
    
    if (!letters || letters.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No attachment letter found' },
        { status: 404 }
      );
    }
    
    const letter = letters[0];
    
    return NextResponse.json({
      success: true,
      filePath: letter.file_path,
      fileName: letter.file_name,
      uploadedAt: letter.uploaded_at
    });
    
  } catch (error) {
    console.error('Error fetching attachment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attachment' },
      { status: 500 }
    );
  }
}