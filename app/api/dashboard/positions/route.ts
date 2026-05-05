import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const departmentId = url.searchParams.get('departmentId');
    
    let positionsQuery = `
      SELECT 
        p.position_id,
        p.position_title,
        p.department_id,
        d.department_name,
        p.number_of_slots,
        p.qualification_requirements,
        p.responsibilities,
        p.application_deadline,
        p.attachment_duration_weeks,
        p.is_open,
        (SELECT COUNT(*) FROM applications WHERE position_id = p.position_id) as applied_count
      FROM positions p
      JOIN departments d ON p.department_id = d.department_id
      WHERE p.is_open = 1
    `;
    
    const params = [];
    
    if (departmentId && departmentId !== 'all') {
      positionsQuery += ` AND p.department_id = @departmentId`;
      params.push({ name: 'departmentId', value: parseInt(departmentId) });
    }
    
    positionsQuery += ` ORDER BY d.department_name, p.position_title`;
    
    const positions = await query(positionsQuery, params);
    
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