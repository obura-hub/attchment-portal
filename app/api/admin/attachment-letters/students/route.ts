import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Fetch all students who have been issued attachment letters
    const students = await query(`
      SELECT 
        a.application_id,
        a.user_id,
        a.status,
        a.application_date,
        CONCAT(r.first_name, ' ', r.surname) as student_name,
        r.email as student_email,
        r.phone_number as student_phone,
        r.education_level,
        r.field_of_study,
        p.position_title,
        p.attachment_duration_weeks,
        d.department_name,
        al.letter_id,
        al.file_path,
        al.file_name,
        al.file_size,
        al.uploaded_at,
        al.is_active
      FROM attachment_letters al
      JOIN applications a ON al.application_id = a.application_id
      JOIN Registration r ON al.user_id = r.id
      JOIN positions p ON a.position_id = p.position_id
      JOIN departments d ON p.department_id = d.department_id
      WHERE al.is_active = 1
      ORDER BY al.uploaded_at DESC
    `);
    
    return NextResponse.json({
      success: true,
      students: students || []
    });
    
  } catch (error) {
    console.error('Error fetching students with attachment letters:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attachment letters' },
      { status: 500 }
    );
  }
}