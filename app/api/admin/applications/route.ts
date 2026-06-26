import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const includeDocuments = url.searchParams.get('includeDocuments') === 'true';
    
    // Get all applications with student details
    const applications = await query(`
      SELECT 
        a.application_id,
        a.application_date,
        a.status,
        a.cover_letter,
        p.position_title,
        d.department_name,
        r.id as user_id,
        r.first_name,
        r.middle_name,
        r.surname,
        r.email as student_email,
        r.phone_number as student_phone,
        r.education_level,
        r.field_of_study,
        r.id_number,
        CASE WHEN al.letter_id IS NOT NULL THEN 1 ELSE 0 END as has_attachment_letter
      FROM applications a
      JOIN positions p ON a.position_id = p.position_id
      JOIN departments d ON p.department_id = d.department_id
      JOIN Registration r ON a.user_id = r.id
      LEFT JOIN attachment_letters al ON a.application_id = al.application_id AND al.is_active = 1
      ORDER BY a.application_date DESC
    `);
    
    // Format applications
    let formattedApplications = applications.map((app: any) => ({
      application_id: app.application_id,
      user_id: app.user_id,
      position_title: app.position_title,
      department_name: app.department_name,
      student_name: `${app.first_name} ${app.surname}`,
      student_email: app.student_email,
      student_phone: app.student_phone,
      education_level: app.education_level,
      field_of_study: app.field_of_study,
      application_date: app.application_date,
      status: app.status,
      cover_letter: app.cover_letter,
      has_attachment_letter: app.has_attachment_letter || 0,
      documents_count: 0
    }));
    
    // Get document counts for each user if needed
    if (includeDocuments) {
      for (let i = 0; i < formattedApplications.length; i++) {
        const docCount = await query(`
          SELECT COUNT(*) as count FROM user_documents WHERE user_id = @userId
        `, [{ name: 'userId', value: formattedApplications[i].user_id }]);
        formattedApplications[i].documents_count = docCount[0]?.count || 0;
      }
    }
    
    return NextResponse.json({
      success: true,
      applications: formattedApplications
    });
    
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}