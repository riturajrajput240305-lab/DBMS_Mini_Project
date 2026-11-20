import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseSqlDatabase, generateSqlDatabase } from './src/sqlSyncHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SQL_FILE_PATH = path.resolve(__dirname, '../database.sql');

function sqlDatabasePlugin() {
  return {
    name: 'sql-database-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/sql-data' && req.method === 'GET') {
          try {
            if (!fs.existsSync(SQL_FILE_PATH)) {
              res.statusCode = 404;
              return res.end(JSON.stringify({ error: 'database.sql file not found' }));
            }
            const sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf8');
            const data = parseSqlDatabase(sqlContent);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, data, rawSql: sqlContent }));
          } catch (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: err.message }));
          }
        }

        if (req.url === '/api/sql-data' && req.method === 'POST') {
          try {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const parsedBody = JSON.parse(body);
                const generatedSql = generateSqlDatabase(parsedBody);
                fs.writeFileSync(SQL_FILE_PATH, generatedSql, 'utf8');
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: true, timestamp: Date.now() }));
              } catch (err) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Failed to process SQL save: ' + err.message }));
              }
            });
            return;
          } catch (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: err.message }));
          }
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sqlDatabasePlugin()],
});
