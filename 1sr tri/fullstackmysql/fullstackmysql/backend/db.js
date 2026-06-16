require('dotenv').config();

const mysql = require('mysql2/promise');

function buildConfig() {
  // Support DATABASE_URL (e.g. mysql://user:pass@host:port/db?ssl=true)
  const url = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;

  const cfg = {
    host: url?.hostname || process.env.DB_HOST || process.env.MYSQLHOST || '127.0.0.1',
    user: url?.username || process.env.DB_USER || process.env.MYSQLUSER,
    password: url?.password || process.env.DB_PASS || process.env.MYSQLPASSWORD,
    database:
      (url?.pathname ? url.pathname.replace(/^\//, '') : null) ||
      process.env.DB_NAME ||
      process.env.MYSQLDATABASE,
    port: url?.port ? Number(url.port) : Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
    queueLimit: 0,
    enableKeepAlive: true,
  };

  // Optional SSL (PlanetScale and some providers require it)
  const sslParam = url?.searchParams.get('ssl');
  const wantSSL =
    (sslParam && sslParam !== 'false' && sslParam !== '0') ||
    /^(1|true|require)$/i.test(process.env.DB_SSL || '') ||
    /^(1|true)$/i.test(process.env.MYSQL_SSL || '');
  if (wantSSL) {
    // If you need to skip CA verification, set DB_SSL_REJECT_UNAUTHORIZED=false
    const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';
    cfg.ssl = { rejectUnauthorized };
  }

  return cfg;
}

const pool = mysql.createPool(buildConfig());

// Quick startup check to surface host/port issues clearly
(async () => {
  try {
    const conf = buildConfig();
    await pool.query('SELECT 1');
    console.log(
      `MySQL pool is ready (host=${conf.host}, port=${conf.port}, db=${conf.database}, ssl=${conf.ssl ? 'on' : 'off'})`
    );
  } catch (err) {
    console.error('Error connecting to MySQL:', err);
  }
})();

module.exports = pool;
