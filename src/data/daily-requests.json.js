import { query } from './cloudflare-client.js'

const response = await query(
  `
  SELECT
    DATE(timestamp) AS day,
    COUNT(id) AS total_requests
  FROM
    retrieval_logs
  WHERE
    day < DATE('now')
  GROUP BY
    day
  ORDER BY
    day;
`,
  [],
)

process.stdout.write(JSON.stringify(response.result[0].results))
