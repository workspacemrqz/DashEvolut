import { Pool } from "pg";

async function createTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    
    console.log("Creating replit_units table...");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS replit_units (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        valor REAL NOT NULL,
        email TEXT NOT NULL,
        nome TEXT NOT NULL CHECK (nome IN ('Camargo', 'Marquez')),
        data_horario TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    console.log("Table replit_units created successfully!");
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error("Error creating table:", error);
    process.exit(1);
  }
}

createTable();
