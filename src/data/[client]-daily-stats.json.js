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
      DATE(rl.timestamp) AS day,
      ds.payer_address AS client_address,
      COUNT(rl.id) AS total_requests,
      ROUND(SUM(rl.egress_bytes) / 1073741824.0, 2) AS total_egress_gib,
      SUM(CASE WHEN rl.cache_miss = 1 THEN 1 ELSE 0 END) AS cache_miss_requests,
      SUM(CASE WHEN rl.cache_miss = 0 THEN 1 ELSE 0 END) AS cache_hit_requests
  FROM
      retrieval_logs rl
  JOIN
      data_sets ds ON rl.data_set_id = ds.id
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
