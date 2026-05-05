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
    
    const admins = await query(
      `SELECT admin_id, username, email, password, full_name, role 
       FROM admin_users 
       WHERE email = @email`,
      [{ name: 'email', value: email }]
    );
    
    if (admins && admins.length > 0) {
      const admin = admins[0];
      const isValidPassword = await bcrypt.compare(password, admin.password);
      
      if (isValidPassword) {
        // Update last login
        await query(
          `UPDATE admin_users SET last_login = GETDATE() WHERE admin_id = @adminId`,
          [{ name: 'adminId', value: admin.admin_id }]
        );
        
        return NextResponse.json({
          success: true,
          message: 'Login successful',
          admin: {
            id: admin.admin_id,
            username: admin.username,
            email: admin.email,
            full_name: admin.full_name,
            role: admin.role
          }
        });
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid email or password' },
      { status: 401 }
    );
    
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}