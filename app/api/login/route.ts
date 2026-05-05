import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    try {
      // Query user from database
      const users = await query(
        `SELECT id, first_name, surname, email, phone_number, password 
         FROM Registration 
         WHERE email = @email`,
        [{ name: 'email', value: email }]
      );
      
      if (users && users.length > 0) {
        const user = users[0];
        
        // Check if password exists
        if (user.password) {
          const isValidPassword = await bcrypt.compare(password, user.password);
          
          if (isValidPassword) {
            console.log(`✅ User logged in: ${email}`);
            
            return NextResponse.json({
              success: true,
              message: 'Login successful',
              user: {
                id: user.id,
                name: `${user.first_name} ${user.surname}`,
                firstName: user.first_name,
                surname: user.surname,
                email: user.email,
                phoneNumber: user.phone_number
              }
            });
          }
        }
      }
      
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Database error. Please try again.' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}