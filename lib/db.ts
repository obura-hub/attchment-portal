import sql from 'mssql';

const dbConfig = {
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

let pool: any = null;

export async function getConnection() {
  try {
    if (pool && pool.connected) {
      return pool;
    }

    console.log('Connecting to SQL Server...');
    pool = await sql.connect(dbConfig);
    console.log('✅ Database connected successfully');
    return pool;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

// Define the parameter type
interface QueryParam {
  name: string;
  value: any;
}

export async function query(queryString: string, params: QueryParam[] = []): Promise<any[]> {
  const connection = await getConnection();
  const request = connection.request();
  
  if (params && params.length > 0) {
    params.forEach(param => {
      request.input(param.name, param.value);
    });
  }
  
  try {
    const result = await request.query(queryString);
    return result.recordset;
  } catch (error) {
    console.error('Query failed:', error);
    throw error;
  }
}

export default { getConnection, query };