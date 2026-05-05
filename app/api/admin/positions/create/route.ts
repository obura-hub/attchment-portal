import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      position_title,
      department_id,
      number_of_slots,
      qualification_requirements,
      responsibilities,
      application_deadline,
      attachment_duration_weeks,
      is_open
    } = body;
    
    // Validate required fields
    if (!position_title || !department_id) {
      return NextResponse.json(
        { success: false, error: 'Position title and department are required' },
        { status: 400 }
      );
    }
    
    // Generate position code
    const deptCode = await query(
      `SELECT LEFT(UPPER(department_name), 3) as code FROM departments WHERE department_id = @deptId`,
      [{ name: 'deptId', value: department_id }]
    );
    
    const year = new Date().getFullYear();
    const positionCount = await query(`SELECT COUNT(*) as count FROM positions`);
    const positionNumber = (positionCount[0]?.count || 0) + 1;
    const positionCode = `${deptCode[0]?.code || 'DEP'}/${year}/${String(positionNumber).padStart(3, '0')}`;
    
    // Insert new position
    await query(`
      INSERT INTO positions (
        position_title, position_code, department_id, number_of_slots,
        qualification_requirements, responsibilities, application_deadline,
        attachment_duration_weeks, is_open, posted_date, created_at
      ) VALUES (
        @title, @code, @deptId, @slots,
        @qualifications, @responsibilities, @deadline,
        @duration, @isOpen, GETDATE(), GETDATE()
      )
    `, [
      { name: 'title', value: position_title },
      { name: 'code', value: positionCode },
      { name: 'deptId', value: department_id },
      { name: 'slots', value: number_of_slots || 1 },
      { name: 'qualifications', value: qualification_requirements || null },
      { name: 'responsibilities', value: responsibilities || null },
      { name: 'deadline', value: application_deadline || null },
      { name: 'duration', value: attachment_duration_weeks || 8 },
      { name: 'isOpen', value: is_open !== undefined ? (is_open ? 1 : 0) : 1 }
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Position created successfully',
      positionCode: positionCode
    });
    
  } catch (error) {
    console.error('Error creating position:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create position' },
      { status: 500 }
    );
  }
}