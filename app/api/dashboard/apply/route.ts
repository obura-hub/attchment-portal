import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { positionId, userId, coverLetter } = body;
    
    if (!positionId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Position ID and User ID are required' },
        { status: 400 }
      );
    }
    
    // Check if user has already applied for this position
    const existingApplication = await query(
      `SELECT application_id, status FROM applications 
       WHERE user_id = @userId AND position_id = @positionId`,
      [
        { name: 'userId', value: parseInt(userId) },
        { name: 'positionId', value: parseInt(positionId) }
      ]
    );
    
    if (existingApplication.length > 0) {
      return NextResponse.json(
        { success: false, error: 'You have already applied for this position. Duplicate applications are not allowed.' },
        { status: 400 }
      );
    }
    
    // Check if position is still open
    const position = await query(
      `SELECT is_open, number_of_slots, 
        (SELECT COUNT(*) FROM applications WHERE position_id = @positionId) as current_applications
       FROM positions WHERE position_id = @positionId`,
      [{ name: 'positionId', value: parseInt(positionId) }]
    );
    
    if (position.length === 0 || !position[0].is_open) {
      return NextResponse.json(
        { success: false, error: 'This position is no longer open for applications' },
        { status: 400 }
      );
    }
    
    // Insert new application
    await query(`
      INSERT INTO applications (user_id, position_id, cover_letter, status, application_date, status_updated_date)
      VALUES (@userId, @positionId, @coverLetter, 'Pending', GETDATE(), GETDATE())
    `, [
      { name: 'userId', value: parseInt(userId) },
      { name: 'positionId', value: parseInt(positionId) },
      { name: 'coverLetter', value: coverLetter || '' }
    ]);
    
    // Log application history
    await query(`
      INSERT INTO application_status_history (application_id, status, comments, changed_date)
      VALUES ((SELECT MAX(application_id) FROM applications WHERE user_id = @userId), 'Pending', 'Application submitted', GETDATE())
    `, [
      { name: 'userId', value: parseInt(userId) }
    ]);
    
    console.log(`User ${userId} applied for position ${positionId}`);
    
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully'
    });
    
  } catch (error) {
    console.error('Apply error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}