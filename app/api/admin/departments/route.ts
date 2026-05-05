import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Get all departments from the departments table
    const departments = await query(`
      SELECT 
        department_id,
        department_name,
        slug,
        description,
        is_active
      FROM departments 
      WHERE is_active = 1
      ORDER BY department_name
    `);
    
    console.log(`Found ${departments?.length || 0} departments`);
    
    return NextResponse.json({
      success: true,
      departments: departments || []
    });
    
  } catch (error) {
    console.error('Error fetching departments for admin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}