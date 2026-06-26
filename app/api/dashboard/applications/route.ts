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
    
    const applications = await query(`
      SELECT 
        a.application_id,
        a.position_id,
        a.application_date,
        a.status,
        a.cover_letter,
        a.status_updated_date,
        p.position_title,
        p.department_id,
        p.attachment_duration_weeks,
        p.application_deadline,
        d.department_name,
        CASE WHEN al.letter_id IS NOT NULL THEN 1 ELSE 0 END as has_attachment,
        al.file_path as attachment_file_path,
        al.file_name as attachment_file_name
      FROM applications a
      JOIN positions p ON a.position_id = p.position_id
      JOIN departments d ON p.department_id = d.department_id
      LEFT JOIN attachment_letters al ON a.application_id = al.application_id AND al.is_active = 1
      WHERE a.user_id = @userId
      ORDER BY a.application_date DESC
    `, [
      { name: 'userId', value: parseInt(userId) }
    ]);
    
    return NextResponse.json({
      success: true,
      applications: applications || []
    });
    
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}