import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if email already exists
    const existingUser = await query(
      'SELECT email FROM Registration WHERE email = @email',
      [{ name: 'email', value: body.email }]
    );
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    // Insert new user
    await query(`
      INSERT INTO Registration (
        first_name, middle_name, surname, phone_number, email, 
        gender, date_of_birth, id_number, postal_address, 
        country_of_birth, county_of_birth, country_of_residence, 
        county_of_residence, citizenship, ethnicity, education_level, 
        graduation_date, field_of_study, is_pwd, pwd_number, 
        captcha_answer, accepted_terms, password
      ) VALUES (
        @firstName, @middleName, @surname, @phoneNumber, @email,
        @gender, @dateOfBirth, @idNumber, @postalAddress,
        @countryOfBirth, @countyOfBirth, @countryOfResidence,
        @countyOfResidence, @citizenship, @ethnicity, @educationLevel,
        @graduationDate, @fieldOfStudy, @isPwd, @pwdNumber,
        @captchaAnswer, @acceptedTerms, @password
      )
    `, [
      { name: 'firstName', value: body.firstName },
      { name: 'middleName', value: body.middleName || null },
      { name: 'surname', value: body.surname },
      { name: 'phoneNumber', value: body.phoneNumber },
      { name: 'email', value: body.email },
      { name: 'gender', value: body.gender },
      { name: 'dateOfBirth', value: body.dateOfBirth },
      { name: 'idNumber', value: body.idNumber },
      { name: 'postalAddress', value: body.postalAddress },
      { name: 'countryOfBirth', value: body.countryOfBirth || 'Kenya' },
      { name: 'countyOfBirth', value: body.countyOfBirth },
      { name: 'countryOfResidence', value: body.countryOfResidence || 'Kenya' },
      { name: 'countyOfResidence', value: body.countyOfResidence },
      { name: 'citizenship', value: body.citizenship || 'Kenyan' },
      { name: 'ethnicity', value: body.ethnicity },
      { name: 'educationLevel', value: body.educationLevel },
      { name: 'graduationDate', value: body.graduationDate || null },
      { name: 'fieldOfStudy', value: body.fieldOfStudy },
      { name: 'isPwd', value: body.isPwd ? 1 : 0 },
      { name: 'pwdNumber', value: body.pwdNumber || null },
      { name: 'captchaAnswer', value: parseInt(body.captchaAnswer) },
      { name: 'acceptedTerms', value: body.acceptedTerms ? 1 : 0 },
      { name: 'password', value: hashedPassword }
    ]);
    
    // Return success with user info
    return NextResponse.json({
      success: true,
      message: 'Registration successful!',
      user: {
        email: body.email,
        name: `${body.firstName} ${body.surname}`
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}