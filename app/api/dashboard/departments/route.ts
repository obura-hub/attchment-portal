import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Get only departments that have active positions
    const departments = await query(`
      SELECT DISTINCT 
        d.department_id,
        d.department_name,
        d.slug,
        d.icon,
        d.description,
        COUNT(p.position_id) as total_positions
      FROM departments d
      INNER JOIN positions p ON d.department_id = p.department_id
      WHERE p.is_open = 1
      GROUP BY d.department_id, d.department_name, d.slug, d.icon, d.description
      ORDER BY d.department_name
    `);
    
    return NextResponse.json({
      success: true,
      departments: departments || []
    });
    
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}