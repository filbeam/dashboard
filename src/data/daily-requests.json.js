import { query } from './cloudflare-client.js'

const response = await query(
  `SELECT
  DATE(timestamp) AS day,
  COUNT(id) AS total_requests
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

