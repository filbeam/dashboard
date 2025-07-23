---
toc: false
---

```js
import { LineGraph } from './components/line-graph.js'
import { formatBytesIEC } from './utils/bytes.js'
import { WorldMap } from './components/maps.js'

const PlatformStats = FileAttachment('./data/platform-stats.json').json()
const DailyRequests = FileAttachment('./data/daily-requests.json').json()
const DailyEgress = FileAttachment('./data/daily-egress.json').json()
const StorageProviderStats = FileAttachment(
  './data/storage-provider-stats.json',
).json()
const ClientStats = FileAttachment('./data/client-stats.json').json()
const RequestGeodistribution = FileAttachment(
  './data/request-geodistribution.json',
).json()
const Countries = FileAttachment('./data/countries.geojson').json()
const ResponseCodeBreakdown = FileAttachment(
  './data/response-code-breakdown.json',
).json()
const DailyRetrievalSpeed = FileAttachment(
  './data/daily-retrieval-speed.json',
).json()
```

<div class="hero">
  <body><a href="https://filcdn.com" target="_blank" rel="noopener noreferrer"><img src="media/filcdn-logo.png" alt="FilCDN Logo" width="300" /></a><body>
    <h2>FilCDN Dashboard</h2>
</div>

```js
const cacheHitRate = PlatformStats.total_requests
  ? (
      (PlatformStats.cache_hit_requests / PlatformStats.total_requests) *
      100
    ).toFixed(2)
  : 0
```

<h4>All time Stats</h4>

<div class="grid grid-cols-4">
  <h4 class="font-normal">Requests Served: ${PlatformStats.total_requests}</h4>
  <h4 class="font-normal">Bytes Served: ${formatBytesIEC(PlatformStats.total_egress_bytes)}</h4>
  <h4 class="font-normal">Cache Hit Rate: ${cacheHitRate}%</h4>
  <div class="flex flex-col items-center">
    <h4 class="font-normal">Worker TTFB (ms)</h4>
    <div class="text-sm text-center">
      <div>P10: ${PlatformStats.worker_ttfb_p10?.toFixed(2) ?? 'N/A'}</div>
      <div>P50: ${PlatformStats.worker_ttfb_p50?.toFixed(2) ?? 'N/A'}</div>
      <div>P90: ${PlatformStats.worker_ttfb_p90?.toFixed(2) ?? 'N/A'}</div>
      <div>P99: ${PlatformStats.worker_ttfb_p99?.toFixed(2) ?? 'N/A'}</div>
    </div>
  </div>
</div>

<div class="divider"></div>

<h4>Daily Stats</h4>

<div class="grid grid-cols-2" style="grid-auto-rows: 500px;">
  <div class="card">${
    resize((width) => LineGraph(DailyRequests, {width, title: "Requests Served", xKey: "day", yKey: "total_requests", label: "Requests Served" }))
  }</div>
  <div class="card">${
        resize((width) => LineGraph(DailyEgress, {width, title: "Daily Egress (GiB)", xKey: "day", yKey: "total_egress_gib", label: "Bytes Served (GiB)" }))
  }</div>
</div>

<div class="divider"></div>

```js
const tidyDailyRetrievalSpeed = DailyRetrievalSpeed.map((d) => ({
  ...d,
  day: new Date(d.day),
}))
```

<div class="grid grid-cols-2" style="grid-auto-rows: 500px;">
  <div>
    <h4>Daily Retrieval Speeds (Cache-Miss)</h4>
    <body>This section shows the retrieval speeds for all storage providers on cache-miss.</body>
    <div class="card">
      ${Plot.plot({
      x: { label: null },
      y: { grid: true, label: 'Mpbs' },
      marks: [
        Plot.ruleY([0]),
        Plot.lineY(tidyDailyRetrievalSpeed, {
          x: 'day',
          y: 'avg_retrieval_speed_mbps',
          stroke: '#4FF8C9',
          tip: {
            format: {
              x: d => new Date(d).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }),
              y: v => v ? `AVG: ${v.toFixed(2)} Mbps` : 'N/A',
              type: true
            }
          }
        }),
        Plot.lineY(tidyDailyRetrievalSpeed, {
          x: 'day',
          y: 'p95_retrieval_speed_mbps',
          stroke: '#FFA500',
          tip: {
            format: {
              x: d => new Date(d).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }),
              y: v => v ? `P95: ${v.toFixed(2)} Mbps` : 'N/A',
              type: true
            }
          }
        }),
      ]
    })}
    </div>
    </div>
  <div>
    <h4>Response Codes</h4>
    <body>This section shows the response codes breakdown.</body>
    <div class="card">
      ${Plot.plot({
        x: {label: null, type: "band", ticks: "week" },
        y: {
        percent: true
        },
        color: {
        scheme: "Accent",
        legend: "swatches",
        label: "code"
        },
        marks: [
        Plot.rectY(ResponseCodeBreakdown.map((d) => ({
            ...d,
            day: new Date(d.day),
        })),
        {
            x: "day",
            y: "rate",
            fill: "code",
            offset: "normalize",
            sort: {color: null, x: "-y" },
            interval: 'day',
            tip: {
            format: {
                x: d => new Date(d).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
                }),
                y: v => v.toFixed(2),
                code: true
          }
        }
        })
    ]
    })}
    </div>
  </div>
</div>

<div class="divider"></div>
<div style="margin-top: 60px;">
  ${
    resize((width) => WorldMap(Countries, RequestGeodistribution, { width, label: "Requests by Country" }))
  }
</div>

```js
const spStats = Inputs.table(StorageProviderStats, {
  rows: 16,
  format: {
    total_egress_bytes: (v) => formatBytesIEC(v),
    cache_miss_egress_bytes: (v) => formatBytesIEC(v),
  },
  sort: {
    total_egress_bytes: 'desc',
  },
  header: {
    owner_address: 'address',
    total_egress_bytes: 'total_egress',
    cache_miss_egress_bytes: 'cache_miss_egress',
  },
})
```

<div class="divider"></div>
<h4>Storage Provider Stats</h4>
<div class="card" style="padding: 0;">
  ${spStats}
</div>

```js
const clientStats = Inputs.table(ClientStats, {
  rows: 16,
  format: {
    client_address: (v) => htl.html`<a href=./client/${v}>${v}</a>`,
    total_egress_bytes: (v) => formatBytesIEC(v),
    cache_miss_egress_bytes: (v) => formatBytesIEC(v),
  },
  sort: {
    total_egress_bytes: 'desc',
  },
  header: {
    client_address: 'address',
    total_egress_bytes: 'total_egress',
    cache_miss_egress_bytes: 'cache_miss_egress',
  },
})
```

<div class="divider"></div>
<h4>Client Stats</h4>
<div class="card" style="padding: 0;">
  ${clientStats}
</div>

<style>
.card-figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
  font-size: 4vw;
  color: #E30ADA;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 4rem 0 8rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

.hero img {
  max-width: 20%;
}

.divider {
  margin: 50px;
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

</style>
