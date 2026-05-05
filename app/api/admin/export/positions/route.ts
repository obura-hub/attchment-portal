import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const positions = await query(`
      SELECT 
        p.position_title,
        d.department_name,
        p.number_of_slots,
        p.attachment_duration_weeks,
        p.application_deadline,
        CASE WHEN p.is_open = 1 THEN 'Open' ELSE 'Closed' END as status
      FROM positions p
      JOIN departments d ON p.department_id = d.department_id
      ORDER BY p.posted_date DESC
    `);
    
    return NextResponse.json({
      success: true,
      positions: positions || []
    });
  } catch (error) {
    console.error("Export positions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export positions" },
      { status: 500 }
    );
  }
}