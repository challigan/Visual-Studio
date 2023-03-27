const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event, context) => {
  // Authenticate the user's request
  const { user } = context.clientContext;
  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' })
    };
  }

  // Retrieve the user's conversion history
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      'SELECT * FROM history WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 10',
      [user.sub]
    );
    return {
      statusCode: 200,
      body: JSON.stringify(rows)
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  } finally {
    client.release();
  }
};
