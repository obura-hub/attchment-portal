import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      position_id,
      position_title,
      department_id,
      number_of_slots,
      qualification_requirements,
      responsibilities,
      application_deadline,
      attachment_duration_weeks,
      is_open
    } = body;
    
    if (!position_id) {
      return NextResponse.json(
        { success: false, error: 'Position ID is required' },
        { status: 400 }
      );
    }
    
    await query(`
      UPDATE positions 
      SET 
        position_title = @title,
        department_id = @deptId,
        number_of_slots = @slots,
        qualification_requirements = @qualifications,
        responsibilities = @responsibilities,
        application_deadline = @deadline,
        attachment_duration_weeks = @duration,
        is_open = @isOpen,
        updated_at = GETDATE()
      WHERE position_id = @positionId
    `, [
      { name: 'title', value: position_title },
      { name: 'deptId', value: department_id },
      { name: 'slots', value: number_of_slots },
      { name: 'qualifications', value: qualification_requirements || null },
      { name: 'responsibilities', value: responsibilities || null },
      { name: 'deadline', value: application_deadline || null },
      { name: 'duration', value: attachment_duration_weeks },
      { name: 'isOpen', value: is_open ? 1 : 0 },
      { name: 'positionId', value: position_id }
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Position updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating position:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update position' },
      { status: 500 }
    );
  }
}