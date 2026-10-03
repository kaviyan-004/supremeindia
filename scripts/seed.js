/* eslint-disable no-console */
const dns = require('dns');
const mongoose = require('mongoose');
const products = require('../lib/sampleProducts.json');

// Ensure reliable DNS resolution for MongoDB Atlas SRV on all networks
dns.setServers(['8.8.8.8', '1.1.1.1']);

// NOTE: this script deliberately does NOT read .env.local. MONGODB_URI must be set in the terminal
// window for this one command, so it can never silently fall back to your live database string.

// SAFETY: this script overwrites the 11 sample products (prices, stock, live/paused status).
// It refuses to run against any database except this one.
const REQUIRED_DB = 'supreme_india_test';

// Reads the database name from the connection string (the part after the host). Never prints the string.
function dbNameFromUri(uri) {
  const m = /^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]*)/.exec(uri || '');
  if (!m) return '';
  try {
    return decodeURIComponent(m[1]);
  } catch (e) {
    return '';
  }
}

function refuse(found) {
  console.error(
    `Refusing to run: the target database must be named "${REQUIRED_DB}" but it is ${
      found ? `"${found}"` : 'missing from the connection string (MongoDB would use its default "test" database)'
    }.`
  );
  console.error('Nothing was changed. Set MONGODB_URI for this one command to your TEST connection string and try again.');
  process.exit(1);
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Set it in this terminal window to your TEST connection string, then run again.');
    console.error('Nothing was changed. (This script never reads .env.local.)');
    process.exit(1);
  }

  // Check the name BEFORE connecting
  const requestedDb = dbNameFromUri(uri);
  if (requestedDb !== REQUIRED_DB) refuse(requestedDb);

  await mongoose.connect(uri);

  // Check again against the database we are really connected to
  if (mongoose.connection.name !== REQUIRED_DB) {
    const actual = mongoose.connection.name;
    await mongoose.disconnect();
    refuse(actual);
  }
  console.log(`Connected to MongoDB database "${mongoose.connection.name}".`);

  const ProductSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
  const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema, 'products');

  for (const p of products) {
    const { _id, ...rest } = p; // let Mongo assign real ObjectIds
    await Product.updateOne({ slug: p.slug }, { $set: rest }, { upsert: true });
    console.log(`Upserted: ${p.name}`);
  }

  console.log(`Seeded ${products.length} products.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
