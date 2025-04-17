import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PGHOST || process.env.DB_HOST,
  port: parseInt(process.env.PGPORT || process.env.DB_PORT, 10),
  username: process.env.PGUSER || process.env.DB_USERNAME,
  password: String(process.env.PGPASSWORD || process.env.DB_PASSWORD),
  database: process.env.PGDATABASE || process.env.DB_NAME,
  schema: 'online_bar_schema',
  entities: ['src/entities/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
