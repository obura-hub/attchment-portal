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
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000
  }
};

async function testConnection() {
  console.log('========================================');
  console.log('Testing SQL Server Connection');
  console.log('========================================');
  console.log(`Server: ${config.server}:${config.port}`);
  console.log(`Database: ${config.database}`);
  console.log(`User: ${config.user}`);
  console.log('========================================\n');
  
  try {
    console.log('Attempting to connect...');
    const pool = await sql.connect(config);
    console.log('✅ CONNECTION SUCCESSFUL!\n');
    
    // Simple query without any syntax issues
    const result = await pool.request().query('SELECT @@VERSION as version, GETDATE() as currentTime, DB_NAME() as dbName');
    
    console.log('Server Information:');
    console.log(`  - Database: ${result.recordset[0].dbName}`);
    console.log(`  - Server Time: ${result.recordset[0].currentTime}`);
    console.log(`  - SQL Version: ${result.recordset[0].version.substring(0, 100)}...`);
    
    // Check if Registration table exists
    const tables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    console.log('\n📋 Tables in database:');
    if (tables.recordset.length > 0) {
      tables.recordset.forEach(table => {
        console.log(`  - ${table.TABLE_NAME}`);
      });
    } else {
      console.log('  No tables found');
    }
    
    // Check Registration table structure specifically
    const registrationCheck = await pool.request().query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'Registration' AND TABLE_TYPE = 'BASE TABLE'
    `);
    
    if (registrationCheck.recordset[0].count > 0) {
      console.log('\n✅ Registration table exists');
      
      const columns = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'Registration'
        ORDER BY ORDINAL_POSITION
      `);
      
      console.log('\nRegistration Table Columns:');
      columns.recordset.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}`);
      });
    } else {
      console.log('\n⚠️ Registration table does not exist - need to create it');
    }
    
    await pool.close();
    console.log('\n✅ Database is ready to use!');
    console.log('========================================');
    
  } catch (error) {
    console.error('\n❌ QUERY ERROR!');
    console.error(`Error: ${error.message}`);
    console.log('The connection was successful but there was an error with the query.');
    console.log('This might be due to SQL syntax or permission issues.');
  }
}

testConnection();