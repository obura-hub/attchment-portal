import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Get total students (registered users)
    const studentsResult = await query(`SELECT COUNT(*) as total FROM Registration`);
    const totalStudents = studentsResult[0]?.total || 0;
    
    // Get application stats
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Shortlisted' THEN 1 ELSE 0 END) as shortlisted,
        SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
      FROM applications
    `);
    
    const stats = statsResult[0] || {};
    
    // Get position stats
    const positionStats = await query(`
      SELECT 
        COUNT(*) as total_positions,
        SUM(CASE WHEN is_open = 1 THEN 1 ELSE 0 END) as open_positions
      FROM positions
    `);
    
    const posStats = positionStats[0] || {};
    
    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        totalApplications: stats.total_applications || 0,
        pendingApplications: stats.pending || 0,
        shortlistedApplications: stats.shortlisted || 0,
        acceptedApplications: stats.accepted || 0,
        rejectedApplications: stats.rejected || 0,
        totalPositions: posStats.total_positions || 0,
        openPositions: posStats.open_positions || 0
      }
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}