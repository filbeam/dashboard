import { query } from './cloudflare-client.js'

const response = await query(
  `
SELECT
  request_country_code country,
  COUNT(*) AS count
FROM
  retrieval_logs
WHERE
 timestamp >= DATE('now', '-30 days')
 AND request_country_code IS NOT NULL
 AND request_country_code != "XX"
 AND request_country_code != "T1"
GROUP BY
  request_country_code
ORDER BY
  count;
`,
  [],
)

process.stdout.write(JSON.stringify(response.result[0].results))
