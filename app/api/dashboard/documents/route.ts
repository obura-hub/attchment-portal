import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }
    
    const documents = await query(`
      SELECT 
        document_id, 
        document_type, 
        document_name, 
        file_path, 
        file_size, 
        file_type, 
        uploaded_at,
        is_verified
      FROM user_documents
      WHERE user_id = @userId
      ORDER BY 
        CASE document_type
          WHEN 'introduction_letter' THEN 1
          WHEN 'application_letter' THEN 2
          WHEN 'cv' THEN 3
          WHEN 'insurance' THEN 4
          WHEN 'id_card' THEN 5
          WHEN 'police_clearance' THEN 6
          WHEN 'transcripts' THEN 7
          ELSE 8
        END
    `, [{ name: 'userId', value: parseInt(userId) }]);
    
    return NextResponse.json({
      success: true,
      documents: documents || []
    });
    
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}