import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { applicationId, status, comments } = body;
    
    if (!applicationId || !status) {
      return NextResponse.json(
        { success: false, error: 'Application ID and status are required' },
        { status: 400 }
      );
    }
    
    // Get current status for audit log
    const currentApp = await query(
      `SELECT status FROM applications WHERE application_id = @appId`,
      [{ name: 'appId', value: applicationId }]
    );
    
    const oldStatus = currentApp[0]?.status || 'Unknown';
    
    // Update application status
    await query(
      `UPDATE applications 
       SET status = @status, status_updated_date = GETDATE(), updated_at = GETDATE()
       WHERE application_id = @appId`,
      [
        { name: 'status', value: status },
        { name: 'appId', value: applicationId }
      ]
    );
    
    // Add to audit log (using a default admin ID - you can pass the actual admin ID from session)
    await query(
      `INSERT INTO application_audit_log (application_id, old_status, new_status, changed_by, comments)
       VALUES (@appId, @oldStatus, @newStatus, 1, @comments)`,
      [
        { name: 'appId', value: applicationId },
        { name: 'oldStatus', value: oldStatus },
        { name: 'newStatus', value: status },
        { name: 'comments', value: comments || null }
      ]
    );
    
    return NextResponse.json({
      success: true,
      message: `Application ${status.toLowerCase()} successfully`
    });
    
  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update status' },
      { status: 500 }
    );
  }
}