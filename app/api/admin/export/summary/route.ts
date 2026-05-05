import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const statusCounts = await query(`
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Shortlisted' THEN 1 ELSE 0 END) as shortlisted,
        SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
      FROM applications
    `);
    
    const departmentBreakdown = await query(`
      SELECT 
        d.department_name,
        COUNT(DISTINCT a.application_id) as applications_count,
        COUNT(DISTINCT p.position_id) as positions_count
      FROM departments d
      LEFT JOIN positions p ON d.department_id = p.department_id
      LEFT JOIN applications a ON p.position_id = a.position_id
      GROUP BY d.department_name
    `);
    
    return NextResponse.json({
      success: true,
      summary: {
        total_applications: statusCounts[0]?.total_applications || 0,
        pending: statusCounts[0]?.pending || 0,
        shortlisted: statusCounts[0]?.shortlisted || 0,
        accepted: statusCounts[0]?.accepted || 0,
        rejected: statusCounts[0]?.rejected || 0
      },
      departmentBreakdown: departmentBreakdown || []
    });
  } catch (error) {
    console.error("Export summary error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export summary" },
      { status: 500 }
    );
  }
}