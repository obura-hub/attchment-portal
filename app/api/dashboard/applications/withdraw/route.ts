import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { applicationId, userId, reason } = body;
    
    if (!applicationId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Application ID and User ID are required' },
        { status: 400 }
      );
    }
    
    // Verify the application belongs to the user
    const application = await query(
      `SELECT application_id, status, position_id 
       FROM applications 
       WHERE application_id = @appId AND user_id = @userId`,
      [
        { name: 'appId', value: parseInt(applicationId) },
        { name: 'userId', value: parseInt(userId) }
      ]
    );
    
    if (!application || application.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }
    
    const app = application[0];
    
    // Check if application is already withdrawn or processed
    if (app.status === 'Withdrawn') {
      return NextResponse.json(
        { success: false, error: 'Application is already withdrawn' },
        { status: 400 }
      );
    }
    
    if (app.status !== 'Pending') {
      return NextResponse.json(
        { success: false, error: `Cannot withdraw application that is ${app.status.toLowerCase()}` },
        { status: 400 }
      );
    }
    
    // Update application status to Withdrawn
    await query(
      `UPDATE applications 
       SET status = 'Withdrawn', 
           status_updated_date = GETDATE(), 
           updated_at = GETDATE(),
           withdrawal_reason = @reason,
           withdrawal_date = GETDATE()
       WHERE application_id = @appId`,
      [
        { name: 'appId', value: parseInt(applicationId) },
        { name: 'reason', value: reason || null }
      ]
    );
    
    // Log the withdrawal in audit log
    await query(`
      INSERT INTO application_status_history (application_id, status, comments, changed_date)
      VALUES (@appId, 'Withdrawn', @comments, GETDATE())
    `, [
      { name: 'appId', value: parseInt(applicationId) },
      { name: 'comments', value: reason || 'Application withdrawn by student' }
    ]);
    
    console.log(`Application ${applicationId} withdrawn by user ${userId}`);
    
    return NextResponse.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
    
  } catch (error) {
    console.error('Error withdrawing application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to withdraw application' },
      { status: 500 }
    );
  }
}