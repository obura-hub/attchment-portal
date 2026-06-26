# Create the types folder
New-Item -ItemType Directory -Force -Path "types"

# Create the declaration file
@'
declare module 'mssql' {
  export function connect(config: any): Promise<any>;
  export class ConnectionPool {
    connected: boolean;
    request(): any;
    close(): Promise<void>;
    on(event: string, handler: Function): void;
  }
  export const VarChar: any;
  export const Int: any;
  export const Date: any;
  export const BIT: any;
  export const BigInt: any;
  export const NVarchar: any;
}
'@ | Out-File -FilePath "types/mssql.d.ts" -Encoding UTF8