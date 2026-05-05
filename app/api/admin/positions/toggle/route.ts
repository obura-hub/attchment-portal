import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { positionId, is_open } = body;
    
    if (!positionId) {
      return NextResponse.json(
        { success: false, error: 'Position ID is required' },
        { status: 400 }
      );
    }
    
    await query(
      `UPDATE positions SET is_open = @isOpen, updated_at = GETDATE() WHERE position_id = @positionId`,
      [
        { name: 'isOpen', value: is_open ? 1 : 0 },
        { name: 'positionId', value: positionId }
      ]
    );
    
    return NextResponse.json({
      success: true,
      message: `Position ${is_open ? 'opened' : 'closed'} successfully`
    });
    
  } catch (error) {
    console.error('Error toggling position status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update position status' },
      { status: 500 }
    );
  }
}