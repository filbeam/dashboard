import { query } from './cloudflare-client.js'

const response = await query(
  `
WITH daily_totals AS (
  SELECT
    DATE(timestamp) AS day,
    COUNT(*) AS total_requests
  FROM
    retrieval_logs
  WHERE
    DATE(timestamp) < DATE('now')
  GROUP BY
    day
)
SELECT
  DATE(r.timestamp) AS day,
  r.response_status AS code,
  (COUNT(*) * 1.0) / dt.total_requests AS rate
FROM
  retrieval_logs r
  JOIN daily_totals dt ON DATE(r.timestamp) = dt.day
WHERE
  DATE(r.timestamp) < DATE('now')
GROUP BY
  day,
  code
ORDER BY
  day,
  code;
`,
  [],
)

const results = response?.result?.[0]?.results || [];
process.stdout.write(JSON.stringify(results));

