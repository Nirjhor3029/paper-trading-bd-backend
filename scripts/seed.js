require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const StockMetadata = require('../src/models/StockMetadata');
const StockPrice = require('../src/models/StockPrice');
const config = require('../src/config');

const STOCKS = [
  { code: 'GP', name: 'Grameenphone', sector: 'Telecom' },
  { code: 'BRACBANK', name: 'BRAC Bank', sector: 'Banking' },
  { code: 'DUTCHBANGL', name: 'Dutch-Bangla Bank', sector: 'Banking' },
  { code: 'SQUAREPH', name: 'Square Pharma', sector: 'Pharma' },
  { code: 'RENATA', name: 'Renata Limited', sector: 'Pharma' },
  { code: 'BEXIMCO', name: 'Beximco Ltd', sector: 'Textile' },
  { code: 'WALTONHIL', name: 'Walton Hi-Tech', sector: 'Electronics' },
  { code: 'MARICO', name: 'Marico Bangladesh', sector: 'FMCG' },
  { code: 'CITYBANK', name: 'The City Bank', sector: 'Banking' },
  { code: 'MTB', name: 'Mutual Trust Bank', sector: 'Banking' },
  { code: 'OLYMPIC', name: 'Olympic Industries', sector: 'Food' },
  { code: 'BSRM', name: 'BSRM Steels', sector: 'Steel' },
  { code: 'LHBL', name: 'LafargeHolcim BD', sector: 'Cement' },
  { code: 'TITASGAS', name: 'Titas Gas T&D', sector: 'Energy' },
  { code: 'SINGERBD', name: 'Singer Bangladesh', sector: 'Electronics' },
  { code: 'PADMALIFE', name: 'Padma Life Ins.', sector: 'Insurance' },
  { code: 'SUMMITPOW', name: 'Summit Power', sector: 'Energy' },
  { code: 'ISLAMIBANK', name: 'Islami Bank BD', sector: 'Banking' },
];

const PRICES = [
  { ltp: 342.5, open: 340.0, high: 390.0, low: 298.0, close: 342.5, ycp: 340.15, change: 2.35, volume: 1234567, trade: 1200, value: 42.0, dseIndex: 1 },
  { ltp: 42.3, open: 43.0, high: 52.0, low: 35.2, close: 42.3, ycp: 43.1, change: -0.8, volume: 4567890, trade: 3500, value: 19.3, dseIndex: 2 },
  { ltp: 78.6, open: 77.5, high: 88.0, low: 61.0, close: 78.6, ycp: 77.4, change: 1.2, volume: 2345678, trade: 2100, value: 18.4, dseIndex: 3 },
  { ltp: 235.7, open: 232.0, high: 268.0, low: 198.0, close: 235.7, ycp: 232.2, change: 3.5, volume: 876543, trade: 950, value: 20.6, dseIndex: 4 },
  { ltp: 1285.0, open: 1300.0, high: 1380.0, low: 1090.0, close: 1285.0, ycp: 1300.0, change: -15.0, volume: 123456, trade: 200, value: 15.9, dseIndex: 5 },
  { ltp: 28.4, open: 27.5, high: 35.0, low: 21.0, close: 28.4, ycp: 27.5, change: 0.9, volume: 12345678, trade: 8000, value: 35.1, dseIndex: 6 },
  { ltp: 865.5, open: 853.0, high: 942.0, low: 720.0, close: 865.5, ycp: 853.0, change: 12.5, volume: 567890, trade: 600, value: 49.1, dseIndex: 7 },
  { ltp: 2145.0, open: 2100.0, high: 2290.0, low: 1840.0, close: 2145.0, ycp: 2100.0, change: 45.0, volume: 45678, trade: 50, value: 9.8, dseIndex: 8 },
  { ltp: 26.8, open: 27.3, high: 34.0, low: 22.0, close: 26.8, ycp: 27.3, change: -0.5, volume: 5678901, trade: 4200, value: 15.2, dseIndex: 9 },
  { ltp: 33.5, open: 32.4, high: 40.0, low: 27.0, close: 33.5, ycp: 32.4, change: 1.1, volume: 3456789, trade: 2800, value: 11.6, dseIndex: 10 },
  { ltp: 198.4, open: 193.0, high: 225.0, low: 155.0, close: 198.4, ycp: 192.8, change: 5.6, volume: 234567, trade: 300, value: 4.7, dseIndex: 11 },
  { ltp: 89.2, open: 91.5, high: 115.0, low: 78.0, close: 89.2, ycp: 91.5, change: -2.3, volume: 1234567, trade: 1500, value: 11.0, dseIndex: 12 },
  { ltp: 64.7, open: 62.9, high: 78.0, low: 51.0, close: 64.7, ycp: 62.9, change: 1.8, volume: 2345678, trade: 2000, value: 15.2, dseIndex: 13 },
  { ltp: 38.9, open: 39.5, high: 46.0, low: 31.0, close: 38.9, ycp: 39.5, change: -0.6, volume: 4567890, trade: 3500, value: 17.8, dseIndex: 14 },
  { ltp: 185.3, open: 188.5, high: 218.0, low: 158.0, close: 185.3, ycp: 188.5, change: -3.2, volume: 345678, trade: 400, value: 6.4, dseIndex: 15 },
  { ltp: 44.6, open: 42.5, high: 55.0, low: 33.0, close: 44.6, ycp: 42.5, change: 2.1, volume: 1987654, trade: 1800, value: 8.9, dseIndex: 16 },
  { ltp: 38.2, open: 39.1, high: 48.0, low: 29.0, close: 38.2, ycp: 39.1, change: -0.9, volume: 3210987, trade: 2500, value: 12.3, dseIndex: 17 },
  { ltp: 31.5, open: 31.1, high: 38.0, low: 25.0, close: 31.5, ycp: 31.1, change: 0.4, volume: 6789012, trade: 5000, value: 21.4, dseIndex: 18 },
];

function rng(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function generatePriceHistory(basePrice, days = 30) {
  const history = [];
  let prevClose = basePrice * (1 + rng(-0.05, 0.05));

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (d.getDay() === 5 || d.getDay() === 6) continue;

    const dailyMove = rng(-0.025, 0.03);
    const open = prevClose;
    const ltp = clamp(open * (1 + dailyMove), open * 0.9, open * 1.1);
    const high = clamp(ltp * (1 + rng(0, 0.02)), ltp, open * 1.12);
    const low = clamp(ltp * (1 - rng(0, 0.02)), open * 0.88, ltp);
    const close = ltp;
    const ycp = prevClose;
    const change = ltp - ycp;
    const volume = Math.round(rng(100000, 5000000));
    const trade = Math.round(rng(100, 5000));
    const value = parseFloat(((ltp * volume) / 1e7).toFixed(2));
    const dseIndex = Math.floor(rng(1, 50));

    history.push({ date: d, open, ltp, high, low, close, ycp, change, volume, trade, value, dseIndex });
    prevClose = ltp;
  }

  return history;
}

async function seed() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');

    await StockMetadata.deleteMany({});
    await StockPrice.deleteMany({});
    console.log('Cleared existing data');

    const inserted = await StockMetadata.insertMany(
      STOCKS.map(s => ({ ...s, isActive: true, lastUpdated: new Date() }))
    );
    console.log(`Inserted ${inserted.length} stock metadata entries`);

    let totalPrices = 0;
    for (let idx = 0; idx < inserted.length; idx++) {
      const meta = inserted[idx];
      const basePrice = PRICES[idx];
      const history = generatePriceHistory(basePrice.ltp, 30);

      const priceDocs = history.map(h => ({
        stockId: meta._id,
        ...h,
      }));

      await StockPrice.insertMany(priceDocs);
      totalPrices += priceDocs.length;
    }
    console.log(`Inserted ${totalPrices} stock price entries`);

    console.log('\nSeed completed successfully!');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
