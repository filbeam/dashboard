import { query } from './cloudflare-client.js'

const response = await query(
  `
WITH service_provider_retrievals AS (
    SELECT
        rl.*,
        ds.service_provider_id,
        sp.service_url
    FROM retrieval_logs rl
    LEFT JOIN data_sets ds ON ds.id = rl.data_set_id
    LEFT JOIN service_providers sp ON sp.id = ds.service_provider_id
),
retrieval_speeds AS (
    SELECT
        service_provider_id,
        (egress_bytes * 8.0) / (fetch_ttlb / 1000.0) / 1_000_000 AS retrieval_speed_mbps
    FROM service_provider_retrievals
    WHERE
        cache_miss = 1 AND
        fetch_ttlb > 0
),
percentile_buckets AS (
  SELECT
    service_provider_id,
    retrieval_speed_mbps,
    NTILE(100) OVER (ORDER BY retrieval_speed_mbps) as percentile_bucket -- Create 100 buckets for percentiles
  FROM retrieval_speeds
)
SELECT
    spr.service_provider_id,
    spr.service_url,
    COUNT(*) AS total_requests,
    SUM(CASE WHEN spr.cache_miss THEN 1 ELSE 0 END) AS cache_miss_requests,
    SUM(spr.egress_bytes) AS total_egress_bytes,
    SUM(CASE WHEN spr.cache_miss AND spr.cache_miss_response_valid THEN spr.egress_bytes ELSE 0 END) AS cache_miss_egress_bytes,
    AVG(CASE WHEN spr.cache_miss THEN spr.fetch_ttfb ELSE NULL END) AS avg_ttfb,
    ROUND(AVG(CASE WHEN spr.cache_miss THEN (spr.egress_bytes * 8.0) / (spr.fetch_ttlb / 1000.0) / 1_000_000 ELSE NULL END), 2) AS avg_cache_miss_retrieval_speed_mbps,
    (
        SELECT
            MIN(pb.retrieval_speed_mbps)
        FROM
            percentile_buckets pb
        WHERE
            pb.service_provider_id = spr.service_provider_id
            AND pb.percentile_bucket = 96 -- 96th bucket represents the 95th percentile
    ) AS p95_cache_miss_retrieval_speed_mbps,
    ROUND(
        100.0 * SUM(CASE WHEN spr.cache_miss AND spr.response_status = 200 THEN 1 ELSE 0 END)
        / NULLIF(SUM(CASE WHEN spr.cache_miss THEN 1 ELSE 0 END), 0), 2
    ) AS cache_miss_rsr
FROM
    service_provider_retrievals spr
GROUP BY
    spr.service_provider_id
ORDER BY
    total_requests DESC;
`,
  [],
)

process.stdout.write(JSON.stringify(response.result[0].results))
