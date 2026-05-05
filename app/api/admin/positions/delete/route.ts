import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const positionId = url.searchParams.get('positionId');
    
    if (!positionId) {
      return NextResponse.json(
        { success: false, error: 'Position ID is required' },
        { status: 400 }
      );
    }
    
    // Check if position has applications
    const applications = await query(
      `SELECT COUNT(*) as count FROM applications WHERE position_id = @positionId`,
      [{ name: 'positionId', value: parseInt(positionId) }]
    );
    
    if (applications[0]?.count > 0) {
      // Just close the position instead of deleting
      await query(
        `UPDATE positions SET is_open = 0 WHERE position_id = @positionId`,
        [{ name: 'positionId', value: parseInt(positionId) }]
      );
      
      return NextResponse.json({
        success: true,
        message: 'Position has existing applications. It has been closed instead of deleted.'
      });
    }
    
    // Delete position if no applications
    await query(
      `DELETE FROM positions WHERE position_id = @positionId`,
      [{ name: 'positionId', value: parseInt(positionId) }]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Position deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting position:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete position' },
      { status: 500 }
    );
  }
}