const bcrypt = require('bcryptjs');
const sql = require('mssql');

const config = {
  server: '172.16.25.240',
  port: 1433,
  user: 'attachment_sys',
  password: 'Jiji@TTach26',
  database: 'Attachment',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function createAdmin() {
  try {
    const password = 'Admin@2025';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Generated hash for Admin@2025:');
    console.log(hashedPassword);
    
    const pool = await sql.connect(config);
    
    // Check if admin already exists
    const existing = await pool.request()
      .query("SELECT * FROM admin_users WHERE email = 'admin@nairobi.go.ke'");
    
    if (existing.recordset.length > 0) {
      // Update password
      await pool.request()
        .input('password', sql.VarChar, hashedPassword)
        .query("UPDATE admin_users SET password = @password WHERE email = 'admin@nairobi.go.ke'");
      console.log('Admin password updated!');
    } else {
      // Insert new admin
      await pool.request()
        .input('username', sql.VarChar, 'admin')
        .input('email', sql.VarChar, 'admin@nairobi.go.ke')
        .input('password', sql.VarChar, hashedPassword)
        .input('full_name', sql.VarChar, 'System Administrator')
        .input('role', sql.VarChar, 'super_admin')
        .query(`
          INSERT INTO admin_users (username, email, password, full_name, role)
          VALUES (@username, @email, @password, @full_name, @role)
        `);
      console.log('Admin user created!');
    }
    
    console.log('\nLogin credentials:');
    console.log('Email: admin@nairobi.go.ke');
    console.log('Password: Admin@2025');
    
    await pool.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdmin();