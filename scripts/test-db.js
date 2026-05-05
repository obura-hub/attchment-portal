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
    connectTimeout: 30000
  }
};

async function testConnection() {
  console.log('Testing SQL Server connection...');
  console.log(`Server: ${config.server}:${config.port}`);
  console.log(`Database: ${config.database}`);
  console.log(`User: ${config.user}`);
  
  try {
    const pool = await sql.connect(config);
    console.log('✅ Connected successfully!');
    
    // Test a simple query
    const result = await pool.request().query('SELECT @@VERSION as version, GETDATE() as serverTime');
    console.log('Server time:', result.recordset[0].serverTime);
    console.log('SQL Version:', result.recordset[0].version.substring(0, 100));
    
    await pool.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure SQL Server is running on 172.16.25.250');
    console.log('2. Check if you can ping the server: ping 172.16.25.250');
    console.log('3. Verify TCP/IP is enabled in SQL Server Configuration Manager');
    console.log('4. Check if port 1433 is open in Windows Firewall');
    console.log('5. Ensure SQL Server Authentication is enabled (Mixed Mode)');
    console.log('6. Verify the password "Jiji@TTach26" is correct');
  }
}

testConnection();