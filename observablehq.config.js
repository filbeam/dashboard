let clientPaths = [];

try {
  const {
    result: [{ results: clients }],
  } = await query(`
    SELECT DISTINCT payer
    FROM indexer_proof_set_rails
    WHERE with_cdn = true
    ORDER BY payer
  `);

  clientPaths = clients.map((c) => `/client/${c.payer}`);
} catch (error) {
  console.error("Error fetching clients:", error.message);
  clientPaths = []; // fallback so preview doesn’t crash
}

export default {
  root: "src",
  clientPaths,
};

