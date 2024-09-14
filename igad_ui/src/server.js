// server.js
const express = require('express');
const { Client } = require('pg');

const app = express();
const port = 5000;

const client = new Client({
  user: 'postgres',
  host: '10.10.1.13',
  database: 'mukau_mapserver',
  password: 'Nt5KJFKNiQDv',
  port: 5432,
});

client.connect();

app.get('/data', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT row_to_json(fc)
      FROM (
        SELECT 'FeatureCollection' AS type, array_to_json(array_agg(f)) AS features
        FROM (
          SELECT 'Feature' AS type,
          ST_AsGeoJSON(lg.cell)::json AS geometry,
          row_to_json((id, spi, date)) AS properties
          FROM your_table_name AS lg
        ) AS f
      ) AS fc;
    `);
    res.json(result.rows[0].row_to_json);
  } catch (error) {
    console.error('Error fetching data', error);
    res.status(500).send('Error fetching data');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
