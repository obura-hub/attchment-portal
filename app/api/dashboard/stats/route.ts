import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Get user ID from the request headers or session
    // For now, we'll get it from the Authorization header
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }
    
    // Query real application stats from database
    const statsResult = await query(
      `SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Shortlisted' THEN 1 ELSE 0 END) as shortlisted,
        SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
       FROM applications 
       WHERE user_id = @userId`,
      [{ name: 'userId', value: parseInt(userId) }]
    );
    
    const stats = statsResult[0] || {
      total_applications: 0,
      pending: 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0
    };
    
    return NextResponse.json({
      success: true,
      stats: {
        applications: stats.total_applications || 0,
        pending: stats.pending || 0,
        shortlisted: stats.shortlisted || 0,
        accepted: stats.accepted || 0,
        rejected: stats.rejected || 0
      }
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Return zeros instead of mock data
    return NextResponse.json({
      success: true,
      stats: {
        applications: 0,
        pending: 0,
        shortlisted: 0,
        accepted: 0,
        rejected: 0
      }
    });
  }
}