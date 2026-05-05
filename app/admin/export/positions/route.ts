import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const positions = await query(`
      SELECT 
        p.position_title,
        d.department_name,
        p.number_of_slots,
        p.attachment_duration_weeks,
        FORMAT(p.application_deadline, 'yyyy-MM-dd') as application_deadline,
        FORMAT(p.posted_date, 'yyyy-MM-dd') as posted_date,
        CASE WHEN p.is_open = 1 THEN 'Open' ELSE 'Closed' END as status,
        COUNT(a.application_id) as applications_received
      FROM positions p
      JOIN departments d ON p.department_id = d.department_id
      LEFT JOIN applications a ON p.position_id = a.position_id
      GROUP BY 
        p.position_id, 
        p.position_title, 
        d.department_name, 
        p.number_of_slots, 
        p.attachment_duration_weeks, 
        p.application_deadline, 
        p.posted_date, 
        p.is_open
      ORDER BY p.posted_date DESC
    `);
    
    return NextResponse.json({
      success: true,
      positions: positions || []
    });
  } catch (error) {
    console.error('Error exporting positions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export positions' },
      { status: 500 }
    );
  }
}