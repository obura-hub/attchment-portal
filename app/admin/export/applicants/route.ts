import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const applicants = await query(`
      SELECT 
        CONCAT(r.first_name, ' ', r.surname) as student_name,
        r.email,
        r.phone_number,
        p.position_title,
        d.department_name,
        a.status,
        FORMAT(a.application_date, 'yyyy-MM-dd HH:mm:ss') as application_date,
        r.education_level,
        r.field_of_study,
        r.id_number
      FROM applications a
      JOIN Registration r ON a.user_id = r.id
      JOIN positions p ON a.position_id = p.position_id
      JOIN departments d ON p.department_id = d.department_id
      ORDER BY a.application_date DESC
    `);
    
    return NextResponse.json({
      success: true,
      applicants: applicants || []
    });
  } catch (error) {
    console.error('Error exporting applicants:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export applicants' },
      { status: 500 }
    );
  }
}