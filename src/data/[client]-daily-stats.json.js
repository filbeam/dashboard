import { parseArgs } from 'node:util'
import { query } from './cloudflare-client.js'

const {
  values: { client },
} = parseArgs({
  options: { client: { type: 'string' } },
})

const response = await query(
  `
  SELECT
    DATE(timestamp) AS day,
    client_address,
    COUNT(*) AS total_requests,
    ROUND(SUM(egress_bytes) / 1073741824.0, 2) AS total_egress_gib,
    SUM(CASE WHEN cache_miss THEN 1 ELSE 0 END) AS cache_miss_requests,
    SUM(CASE WHEN NOT cache_miss THEN 1 ELSE 0 END) AS cache_hit_requests
  FROM
    retrieval_logs
  WHERE
    client_address = $1
  GROUP BY
    day, client_address
  ORDER BY
    day DESC;
`,
  [client],
)

process.stdout.write(JSON.stringify(response.result[0].results))
