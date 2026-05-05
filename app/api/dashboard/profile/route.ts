import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }
    
    const users = await query(
      `SELECT 
        id, first_name, middle_name, surname, phone_number, email, id_number,
        postal_address, county_of_residence, education_level, field_of_study,
        CAST(graduation_date AS DATE) as graduation_date, skills, is_pwd, pwd_number
       FROM Registration 
       WHERE id = @userId`,
      [{ name: 'userId', value: parseInt(userId) }]
    );
    
    if (users && users.length > 0) {
      const user = users[0];
      return NextResponse.json({
        success: true,
        profile: {
          id: user.id,
          firstName: user.first_name || '',
          middleName: user.middle_name || '',
          surname: user.surname || '',
          phoneNumber: user.phone_number || '',
          email: user.email || '',
          idNumber: user.id_number || '',
          postalAddress: user.postal_address || '',
          countyOfResidence: user.county_of_residence || '',
          educationLevel: user.education_level || '',
          fieldOfStudy: user.field_of_study || '',
          graduationDate: user.graduation_date ? new Date(user.graduation_date).toISOString().slice(0, 7) : '',
          skills: user.skills || '',
          isPwd: user.is_pwd === 1,
          pwdNumber: user.pwd_number || ''
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { 
      userId, firstName, middleName, surname, phoneNumber, 
      postalAddress, countyOfResidence, educationLevel, fieldOfStudy,
      graduationDate, skills, isPwd, pwdNumber
    } = body;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }
    
    // Handle graduation date - convert to proper SQL format or NULL
    let formattedGraduationDate = null;
    if (graduationDate && graduationDate.trim() !== '') {
      // Convert from YYYY-MM to YYYY-MM-DD format
      formattedGraduationDate = graduationDate + '-01';
    }
    
    await query(`
      UPDATE Registration 
      SET 
        phone_number = @phoneNumber,
        postal_address = @postalAddress,
        county_of_residence = @countyOfResidence,
        education_level = @educationLevel,
        field_of_study = @fieldOfStudy,
        graduation_date = @graduationDate,
        skills = @skills,
        is_pwd = @isPwd,
        pwd_number = @pwdNumber,
        updated_at = GETDATE()
      WHERE id = @userId
    `, [
      { name: 'phoneNumber', value: phoneNumber },
      { name: 'postalAddress', value: postalAddress },
      { name: 'countyOfResidence', value: countyOfResidence },
      { name: 'educationLevel', value: educationLevel },
      { name: 'fieldOfStudy', value: fieldOfStudy },
      { name: 'graduationDate', value: formattedGraduationDate },
      { name: 'skills', value: skills || null },
      { name: 'isPwd', value: isPwd ? 1 : 0 },
      { name: 'pwdNumber', value: pwdNumber || null },
      { name: 'userId', value: parseInt(userId) }
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile: ' + (error as Error).message },
      { status: 500 }
    );
  }
}