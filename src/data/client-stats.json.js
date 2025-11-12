import { query } from './cloudflare-client.js'

const response = await query(
  `
  SELECT
    ds.payer_address,
    COUNT(*) AS total_requests,
    SUM(CASE WHEN rl.cache_miss THEN 1 ELSE 0 END) AS cache_miss_requests,
    SUM(rl.egress_bytes) AS total_egress_bytes,
    SUM(CASE WHEN rl.cache_miss THEN egress_bytes ELSE 0 END) AS cache_miss_egress_bytes,
    SUM(dseqs.cdn_egress_quota) AS remaining_cdn_egress_bytes,
    SUM(dseqs.cache_miss_egress_quota) AS remaining_cache_miss_egress_bytes
  FROM
    retrieval_logs rl
  JOIN
    data_sets ds ON ds.id = rl.data_set_id
  JOIN
    data_set_egress_quotas dseqs ON ds.id = dseqs.data_set_id
  GROUP BY
    ds.payer_address
  ORDER BY
    total_requests DESC;
`,
  [],
)

process.stdout.write(JSON.stringify(response.result[0].results))
