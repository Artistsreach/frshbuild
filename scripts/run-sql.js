#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Usage: node scripts/run-sql.js <path-to-sql-file>');
    process.exit(1);
  }
  const sqlPath = path.resolve(process.cwd(), fileArg);
  if (!fs.existsSync(sqlPath)) {
    console.error('SQL file not found:', sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const connStr = process.env.DATABASE_URL;
  if (!connStr) {
    console.error('DATABASE_URL is not set in environment');
    process.exit(1);
  }
  const client = new Client({ connectionString: connStr });
  try {
    await client.connect();
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Executed SQL file successfully:', sqlPath);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Error executing SQL:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
