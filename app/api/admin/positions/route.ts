import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const positions = await query(`
      SELECT 
        p.position_id,
        p.position_title,
        p.number_of_slots,
        p.qualification_requirements,
        p.responsibilities,
        p.application_deadline,
        p.attachment_duration_weeks,
        p.is_open,
        d.department_id,
        d.department_name
      FROM positions p
      JOIN departments d ON p.department_id = d.department_id
      ORDER BY p.posted_date DESC
    `);
    
    return NextResponse.json({
      success: true,
      positions: positions || []
    });
    
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}