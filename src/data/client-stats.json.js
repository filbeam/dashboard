import { query } from './cloudflare-client.js'

const response = await query(
  `
  SELECT
    ds.payer_address AS client_address,
    COUNT(*) AS total_requests,
    SUM(CASE WHEN rl.cache_miss THEN 1 ELSE 0 END) AS cache_miss_requests,
    SUM(rl.egress_bytes) AS total_egress_bytes,
    SUM(CASE WHEN rl.cache_miss THEN egress_bytes ELSE 0 END) AS cache_miss_egress_bytes
  FROM
    retrieval_logs rl
  JOIN
    data_sets ds ON ds.id = rl.data_set_id
  GROUP BY
    client_address
  ORDER BY
    total_requests DESC;
`,
  [],
)

process.stdout.write(JSON.stringify(response.result[0].results))
