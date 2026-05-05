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
    
    console.log(`Fetching documents for user ID: ${userId}`);
    
    // First, check if user exists
    const userCheck = await query(
      `SELECT id, first_name, surname FROM Registration WHERE id = @userId`,
      [{ name: 'userId', value: parseInt(userId) }]
    );
    
    if (!userCheck || userCheck.length === 0) {
      return NextResponse.json({
        success: true,
        documents: [],
        message: 'User not found'
      });
    }
    
    console.log(`User found: ${userCheck[0].first_name} ${userCheck[0].surname}`);
    
    // Fetch documents for this user
    const documents = await query(`
      SELECT 
        document_id,
        document_type,
        document_name,
        file_path,
        file_size,
        file_type,
        uploaded_at
      FROM user_documents
      WHERE user_id = @userId
      ORDER BY uploaded_at DESC
    `, [{ name: 'userId', value: parseInt(userId) }]);
    
    console.log(`Found ${documents?.length || 0} documents for user ${userId}`);
    
    return NextResponse.json({
      success: true,
      documents: documents || [],
      user: userCheck[0]
    });
    
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}