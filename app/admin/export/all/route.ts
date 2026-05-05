import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Get all applicants
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
        r.field_of_study
      FROM applications a
      JOIN Registration r ON a.user_id = r.id
      JOIN positions p ON a.position_id = p.position_id
      JOIN departments d ON p.department_id = d.department_id
      ORDER BY a.application_date DESC
    `);
    
    // Get all positions
    const positions = await query(`
      SELECT 
        p.position_title,
        d.department_name,
        p.number_of_slots,
        p.attachment_duration_weeks,
        FORMAT(p.application_deadline, 'yyyy-MM-dd') as application_deadline,
        CASE WHEN p.is_open = 1 THEN 'Open' ELSE 'Closed' END as status
      FROM positions p
      JOIN departments d ON p.department_id = d.department_id
      ORDER BY p.posted_date DESC
    `);
    
    // Get summary statistics
    const summary = await query(`
      SELECT 
        (SELECT COUNT(*) FROM Registration) as total_students,
        (SELECT COUNT(*) FROM applications) as total_applications,
        (SELECT COUNT(*) FROM applications WHERE status = 'Pending') as pending,
        (SELECT COUNT(*) FROM applications WHERE status = 'Shortlisted') as shortlisted,
        (SELECT COUNT(*) FROM applications WHERE status = 'Accepted') as accepted,
        (SELECT COUNT(*) FROM applications WHERE status = 'Rejected') as rejected,
        (SELECT COUNT(*) FROM positions) as total_positions,
        (SELECT COUNT(*) FROM positions WHERE is_open = 1) as open_positions
    `);
    
    return NextResponse.json({
      success: true,
      applicants: applicants || [],
      positions: positions || [],
      summary: summary[0] || {}
    });
  } catch (error) {
    console.error('Error exporting all data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}