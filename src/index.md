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
const { NETWORK } = await FileAttachment('./data/network.json').json()

document.body.dataset.network = NETWORK
```

<div class="hero">
  <body><a href="https://filbeam.com" target="_blank" rel="noopener noreferrer"><img src="media/filbeam-logo.png" alt="FilBeam Logo" width="300" /></a><body>
    <h2>FilBeam Dashboard</h2>
    <div>
      <a href="https://dashboard.filbeam.com" data-network='mainnet'><code>mainnet</code></a>
      -
      <a href="https://calibration.dashboard.filbeam.com" data-network="calibration"><code>calibration</code></a>
    </div>
</div>

```js
const cacheHitRate = PlatformStats.total_requests
  ? (
      (PlatformStats.cache_hit_requests / PlatformStats.total_requests) *
      100
    ).toFixed(2)
  : 0
```

<h2>All time Stats</h2>

```js
const workerLatency = Inputs.table(
  [5, 50, 95, 99].map((percentile) => ({
    percentile: `p${percentile}`,
    ttfb: PlatformStats[`worker_ttfb_p${percentile}`],
  })),
  {
    layout: 'auto',
    format: {
      ttfb: (v) => v.toFixed(2) ?? 'N/A',
    },
    header: {
      percentile: 'Percentile',
      ttfb: 'TTFB (ms)',
    },
  },
)
```

<div class="grid grid-cols-3">
  <div class="flex flex-col items-center">
    <h4 class="font-normal">Requests Served</h4>
    <div class="card card-figure">${PlatformStats.total_requests}</div>
  </div>
  <div class="flex flex-col items-center">
    <h4 class="font-normal">Bytes Served</h4>
    <div class="card card-figure">${formatBytesIEC(PlatformStats.total_egress_bytes || 0)}</div>
  </div>
  <div class="flex flex-col items-center">
    <h4 class="font-normal">Cache Hit Rate</h4>
    <div class="card card-figure">${cacheHitRate}%</div>
  </div>
</div>

<div class="grid grid-cols-3">
  <div class="flex flex-col items-center">
    <h4 class="font-normal">Worker Response Time</h4>
    <div class="card" style="padding: 0;">${workerLatency}</div>
  </div>
</div>

<div class="divider"></div>

<h2>Daily Stats</h2>

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
<h2>Storage Provider Stats</h2>
<div class="card" style="padding: 0;">
  ${spStats}
</div>

```js
const clientStats = Inputs.table(ClientStats, {
  rows: 16,
  format: {
    payer_address: (v) => htl.html`<a href=./client/${v}>${v}</a>`,
    total_egress_bytes: (v) => formatBytesIEC(v),
    cache_miss_egress_bytes: (v) => formatBytesIEC(v),
    remaining_cdn_egress_bytes: (v) => formatBytesIEC(v),
    remaining_cache_miss_egress_bytes: (v) => formatBytesIEC(v),
  },
  sort: {
    total_egress_bytes: 'desc',
  },
  header: {
    payer_address: 'address',
    total_egress_bytes: 'total_egress_used',
    cache_miss_egress_bytes: 'cache_miss_egress_used',
    remaining_cdn_egress_bytes: 'remaining_cdn_egress',
    remaining_cache_miss_egress_bytes: 'remaining_cache_miss_egress',
  },
})
```

<div class="divider"></div>
<h2>Client Stats</h2>
<div class="card" style="padding: 0;">
  ${clientStats}
</div>

<style>
.card-figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
  font-size: 3vw;
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

body[data-network=mainnet] [data-network=mainnet],
body[data-network=calibration] [data-network=calibration] {
  font-weight: bold;
}

</style>
