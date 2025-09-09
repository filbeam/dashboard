import { query } from './src/data/cloudflare-client.js'

const {
  result: [{ results: clients }],
} = await query(`
  SELECT
    DISTINCT payer_address
  FROM 
    data_sets
  WHERE
    with_cdn = true
  ORDER BY
    payer_address;
`)

const clientPaths = clients.map((c) => `/client/${c.payer}`)

// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: 'FilCDN Dashboard',

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  // pages: [
  //   {
  //     name: "Examples",
  //     pages: [
  //       {name: "Dashboard", path: "/example-dashboard"},
  //       {name: "Report", path: "/example-report"}
  //     ]
  //   }
  // ],

  // Content to add to the head of the page, e.g. for a favicon:
  head: '<link rel="icon" href="media/filcdn-logo.png" type="image/png" sizes="32x32"><script defer data-domain="dashboard.filcdn.com" src="https://plausible.io/js/script.js"></script>',

  // The path to the source root.
  root: 'src',

  // Some additional configuration options and their defaults:
  theme: 'light', // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  footer: `
    Built on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} |
    <a href="https://github.com/filcdn/dashboard" target="_blank" rel="noopener noreferrer">View Source on GitHub</a>
  `, // what to show in the footer (HTML)
  sidebar: false, // whether to show the sidebar
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  // preserveExtension: false, // drop .html from URLs
  // preserveIndex: false, // drop /index from URLs
  dynamicPaths: [...clientPaths],
}
