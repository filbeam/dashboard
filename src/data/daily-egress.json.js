import { query } from './cloudflare-client.js'

const response = await query(
  `SELECT
  DATE(timestamp) AS day,
  ROUND(SUM(egress_bytes) / 1073741824.0, 2) AS total_egress_gib
FROM
  retrieval_logs
WHERE
  DATE(timestamp) < DATE('now')
GROUP BY
  day
ORDER BY
  day;
`,
  [],
)

const results = response?.result?.[0]?.results || [];
process.stdout.write(JSON.stringify(results));

