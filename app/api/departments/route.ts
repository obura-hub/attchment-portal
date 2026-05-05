import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const departments = await query(`
      SELECT 
        d.department_id,
        d.department_name,
        d.slug,
        d.icon,
        d.description,
        COALESCE(SUM(p.number_of_slots), 0) as total_positions,
        (
          SELECT STRING_AGG(s.specialization_name, ',')
          FROM specializations s
          WHERE s.department_id = d.department_id AND s.is_active = 1
        ) as categories
      FROM departments d
      LEFT JOIN positions p ON d.department_id = p.department_id AND p.is_open = 1
      WHERE d.is_active = 1
      GROUP BY d.department_id, d.department_name, d.slug, d.icon, d.description
      ORDER BY d.department_name
    `);
    
    // Parse categories string to array
    const processedDepartments = departments.map(dept => ({
      ...dept,
      total_positions: parseInt(dept.total_positions) || 0,
      categories: dept.categories ? dept.categories.split(',') : []
    }));
    
    return NextResponse.json({
      success: true,
      data: processedDepartments
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}