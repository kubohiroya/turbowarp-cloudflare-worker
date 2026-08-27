export interface JwtKeygenOptions {
    outDir: string;
    kid?: string;
}
export interface JwtIssueOptions {
    keyPath: string;
    subject: string;
    role: string;
    scopes: string[];
    workerName?: string;
    issuer?: string;
    audience?: string;
    ttlSeconds?: number;
}
export interface JwtKeygenResult {
    kid: string;
    privateKeyPath: string;
    publicJwkPath: string;
    jwksPath: string;
}
export declare function generateEs256JwtKey(options: JwtKeygenOptions): Promise<JwtKeygenResult>;
export declare function issueEs256Jwt(options: JwtIssueOptions): Promise<string>;
export declare function parseTtl(value: string | undefined): number;
