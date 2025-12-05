import { query } from './cloudflare-client.js'

const response = await query(
  `
  WITH client_stats AS (
    SELECT
      cs.payer_address,
      COUNT(rl.id) AS total_requests,
      SUM(CASE WHEN rl.cache_miss THEN 1 ELSE 0 END) AS cache_miss_requests,
      SUM(rl.egress_bytes) AS total_egress_bytes,
      SUM(CASE WHEN rl.cache_miss AND rl.cache_miss_response_valid != 0 THEN rl.egress_bytes ELSE 0 END) AS cache_miss_egress_bytes,
      SUM(CASE WHEN rl.cache_miss AND rl.cache_miss_response_valid = 0 THEN rl.egress_bytes ELSE 0 END) AS cache_miss_egress_invalid_bytes
    FROM
      retrieval_logs rl
    JOIN
      data_sets cs ON cs.id = rl.data_set_id
    GROUP BY
      cs.payer_address
  ),
  client_quotas AS (
    SELECT
      cs.payer_address,
      SUM(cseqs.cdn_egress_quota) AS remaining_cdn_egress_bytes,
      SUM(cseqs.cache_miss_egress_quota) AS remaining_cache_miss_egress_bytes
    FROM
      data_sets cs
    JOIN
      data_set_egress_quotas cseqs ON cs.id = cseqs.data_set_id
    GROUP BY
      cs.payer_address
  )
  SELECT
    cs.*,
    cq.remaining_cdn_egress_bytes,
    cq.remaining_cache_miss_egress_bytes
  FROM
    client_stats cs
  LEFT JOIN
    client_quotas cq ON cs.payer_address = cq.payer_address
  ORDER BY
    cs.total_requests DESC;
`,
  [],
)

process.stdout.write(JSON.stringify(response.result[0].results))
