/**
 * General
 */
export const PORT: string = process.env.PORT || '3000';
export const REQUEST_TIMEOUT: number = 6000;
export const TIMEOUT: number = process.env.TIMEOUT !== undefined ? Number.parseInt(process.env.TIMEOUT!) : 10000;
export const AUTHORIZATION_HEADER: string = 'Authorization';

/**
 * Database
 */
export const DATABASE_URL: string = process.env.DATABASE_URL || '';
export const DATABASE_MASTER_KEY: string = process.env.DATABASE_MASTER_KEY || '';
export const DATABASE_ID: string = process.env.DATABASE_ID || 'test-' + Math.round(Math.random() * 1000);
export const MAX_DATABASE_QUERY_RETRIES: number = 3;
export const DATABASE_COLLECTION_THROUGHPUT: number = 400;

/**
 * Damage backend
 */
export const DAMAGE_ENDPOINT: string = process.env.NODE_ENV === 'test' ? 'http://localhost:8080/damage' : 'https://damage.example.com';
export const BASIC_AUTH: string = process.env.DAMAGE_BACKEND_BASIC_AUTH || 'AUTH';
