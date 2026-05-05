import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const applicants = await query(`
      SELECT 
        CONCAT(r.first_name, ' ', r.surname) as student_name,
        r.email,
        p.position_title,
        d.department_name,
        a.status,
        a.application_date
      FROM applications a
      JOIN Registration r ON a.user_id = r.id
      JOIN positions p ON a.position_id = p.position_id
      JOIN departments d ON p.department_id = d.department_id
      ORDER BY a.application_date DESC
    `);
    
    const positions = await query(`
      SELECT 
        p.position_title,
        d.department_name,
        p.number_of_slots,
        CASE WHEN p.is_open = 1 THEN 'Open' ELSE 'Closed' END as status
      FROM positions p
      JOIN departments d ON p.department_id = d.department_id
      ORDER BY p.posted_date DESC
    `);
    
    return NextResponse.json({
      success: true,
      applicants: applicants || [],
      positions: positions || []
    });
  } catch (error) {
    console.error("Export all error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export data" },
      { status: 500 }
    );
  }
}