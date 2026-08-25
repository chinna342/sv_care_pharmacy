import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '..', 'frontend', 'public', 'medicines');

function fetchPage(urlStr) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(urlStr);
    const client = urlObj.protocol === 'https:' ? https : http;
    client.get(urlStr, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, urlStr).href;
        return fetchPage(nextUrl).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, url: urlStr }));
    }).on('error', reject);
  });
}

function downloadFile(urlStr, dest) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(urlStr);
    const client = urlObj.protocol === 'https:' ? https : http;
    const file = fs.createWriteStream(dest);
    client.get(urlStr, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://www.netmeds.com/'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, urlStr).href;
        return downloadFile(nextUrl, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(dest)));
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

const verifiedList = [
  // 1. Pain & Fever
  { id: 1, name: 'Dolo 650', filename: 'dolo-650.jpg', urls: ['https://www.netmeds.com/prescriptions/dolo-650mg-tablet-15-s'] },
  { id: 2, name: 'Combiflam', filename: 'combiflam.jpg', urls: ['https://www.netmeds.com/prescriptions/combiflam-tablet-20-s'] },
  { id: 3, name: 'Tramadol', filename: 'tramadol.jpg', urls: ['https://www.netmeds.com/prescriptions/tramazac-50mg-capsule-10-s', 'https://www.netmeds.com/prescriptions/tramasure-50mg-capsule-10-s'] },
  { id: 4, name: 'Volini', filename: 'volini.jpg', urls: ['https://www.netmeds.com/prescriptions/volini-gel-50gm', 'https://www.netmeds.com/non-prescriptions/volini-pain-relief-gel-50-gm'] },
  { id: 5, name: 'Naprosyn', filename: 'naprosyn.jpg', urls: ['https://www.netmeds.com/prescriptions/naprosyn-500mg-tablet-15-s', 'https://www.netmeds.com/prescriptions/naprosyn-500-tablet-15s'] },
  { id: 6, name: 'Saridon', filename: 'saridon.jpg', urls: ['https://www.netmeds.com/prescriptions/saridon-tablet-10-s', 'https://www.netmeds.com/non-prescriptions/saridon-tablet-10s'] },

  // 2. Antibiotics
  { id: 7, name: 'Augmentin 625', filename: 'augmentin-625.jpg', urls: ['https://www.netmeds.com/prescriptions/augmentin-625-duo-tablet-10-s', 'https://www.netmeds.com/prescriptions/augmentin-625-duo-tablet-10s'] },
  { id: 8, name: 'Azee 500', filename: 'azee-500.jpg', urls: ['https://www.netmeds.com/prescriptions/azee-500mg-tablet-5-s', 'https://www.netmeds.com/prescriptions/azee-500-tablet-5s'] },
  { id: 9, name: 'Ciplox 500', filename: 'ciplox-500.jpg', urls: ['https://www.netmeds.com/prescriptions/ciplox-500mg-tablet-10-s', 'https://www.netmeds.com/prescriptions/ciplox-500-tablet-10s'] },
  { id: 10, name: 'Taxim-O 200', filename: 'taxim-o-200.jpg', urls: ['https://www.netmeds.com/prescriptions/taxim-o-200mg-tablet-10-s', 'https://www.netmeds.com/prescriptions/taxim-o-200-tablet-10s'] },
  { id: 11, name: 'Flagyl 400', filename: 'flagyl-400.jpg', urls: ['https://www.netmeds.com/prescriptions/flagyl-400mg-tablet-15-s', 'https://www.netmeds.com/prescriptions/flagyl-400-tablet-15s'] },

  // 3. Heart & BP
  { id: 12, name: 'Telma 40', filename: 'telma-40.jpg', urls: ['https://www.netmeds.com/prescriptions/telma-40mg-tablet-15-s', 'https://www.netmeds.com/prescriptions/telma-40-tablet-15s'] },
  { id: 13, name: 'Amlong 5', filename: 'amlong-5.jpg', urls: ['https://www.netmeds.com/prescriptions/amlong-5mg-tablet-15-s', 'https://www.netmeds.com/prescriptions/amlong-5-tablet-15s'] },
  { id: 14, name: 'Atorva 10', filename: 'atorva-10.jpg', urls: ['https://www.netmeds.com/prescriptions/atorva-10mg-tablet-15-s', 'https://www.netmeds.com/prescriptions/atorva-10-tablet-15s'] },
  { id: 15, name: 'Ecosprin 75', filename: 'ecosprin-75.jpg', urls: ['https://www.netmeds.com/prescriptions/ecosprin-75mg-tablet-14-s', 'https://www.netmeds.com/prescriptions/ecosprin-75-tablet-14s'] },
  { id: 16, name: 'Concor 5', filename: 'concor-5.jpg', urls: ['https://www.netmeds.com/prescriptions/concor-5mg-tablet-10-s', 'https://www.netmeds.com/prescriptions/concor-5-tablet-10s'] },

  // 4. Diabetes Care
  { id: 17, name: 'Glycomet 500 SR', filename: 'glycomet-500.jpg', urls: ['https://www.netmeds.com/prescriptions/glycomet-500mg-sr-tablet-20-s', 'https://www.netmeds.com/prescriptions/glycomet-500-tablet-sr-20s'] },
  { id: 18, name: 'Amaryl 1mg', filename: 'amaryl-1.jpg', urls: ['https://www.netmeds.com/prescriptions/amaryl-1mg-tablet-15-s', 'https://www.netmeds.com/prescriptions/amaryl-1-tablet-15s'] },
  { id: 19, name: 'Accu-Chek Active Strips', filename: 'accu-chek.jpg', urls: ['https://www.netmeds.com/non-prescriptions/accu-chek-active-test-strips-50-s', 'https://www.netmeds.com/prescriptions/accu-chek-active-test-strips-50s'] },
  { id: 20, name: 'Januvia 100', filename: 'januvia-100.jpg', urls: ['https://www.netmeds.com/prescriptions/januvia-100mg-tablet-7-s', 'https://www.netmeds.com/prescriptions/januvia-100-tablet-7s'] },
  { id: 21, name: 'Lantus SoloStar', filename: 'lantus-solostar.jpg', urls: ['https://www.netmeds.com/prescriptions/lantus-solostar-100iu-cartridge-3ml', 'https://www.netmeds.com/prescriptions/lantus-solostar-pen-100iu-ml-3ml'] },

  // 5. Respiratory
  { id: 22, name: 'Montair-LC', filename: 'montair-lc.jpg', urls: ['https://www.netmeds.com/prescriptions/montair-lc-tablet-10-s', 'https://www.netmeds.com/prescriptions/montair-lc-tablet-10s'] },
  { id: 23, name: 'Asthalin Inhaler', filename: 'asthalin-inhaler.jpg', urls: ['https://www.netmeds.com/prescriptions/asthalin-100mcg-inhaler-200-md', 'https://www.netmeds.com/prescriptions/asthalin-inhaler-200-metered-doses'] },
  { id: 24, name: 'Cetzine 10', filename: 'cetzine-10.jpg', urls: ['https://www.netmeds.com/prescriptions/cetzine-10mg-tablet-10-s', 'https://www.netmeds.com/prescriptions/cetzine-10-tablet-10s'] },
  { id: 25, name: 'Benadryl Syrup', filename: 'benadryl.jpg', urls: ['https://www.netmeds.com/non-prescriptions/benadryl-cough-formula-syrup-100ml', 'https://www.netmeds.com/non-prescriptions/benadryl-syrup-100ml'] },
  { id: 26, name: 'Otrivin Spray', filename: 'otrivin.jpg', urls: ['https://www.netmeds.com/non-prescriptions/otrivin-oxy-fast-relief-adult-nasal-spray-10ml', 'https://www.netmeds.com/non-prescriptions/otrivin-nasal-spray-10ml'] },

  // 6. Gastro & Acidity
  { id: 27, name: 'Pan 40', filename: 'pan-40.jpg', urls: ['https://www.netmeds.com/prescriptions/pan-40mg-tablet-15-s', 'https://www.netmeds.com/prescriptions/pan-40-tablet-15s'] },
  { id: 28, name: 'Omez 20', filename: 'omez-20.jpg', urls: ['https://www.netmeds.com/prescriptions/omez-20mg-capsule-20-s', 'https://www.netmeds.com/prescriptions/omez-20-capsule-20s'] },
  { id: 29, name: 'Digene Gel Mint', filename: 'digene.jpg', urls: ['https://www.netmeds.com/non-prescriptions/digene-gel-mint-flavour-200ml', 'https://www.netmeds.com/non-prescriptions/digene-antacid-antigas-gel-mint-flavour-200-ml'] },
  { id: 30, name: 'Eno Fruit Salt', filename: 'eno.jpg', urls: ['https://www.netmeds.com/non-prescriptions/eno-fruit-salt-regular-100gm', 'https://www.netmeds.com/non-prescriptions/eno-fruit-salt-regular-powder-100-gm'] },
  { id: 31, name: 'Duphalac Oral Solution', filename: 'duphalac.jpg', urls: ['https://www.netmeds.com/prescriptions/duphalac-oral-solution-200ml', 'https://www.netmeds.com/prescriptions/duphalac-lemon-flavour-oral-solution-200ml'] },

  // 7. Vitamins
  { id: 32, name: 'Limcee 500', filename: 'limcee-500.jpg', urls: ['https://www.netmeds.com/non-prescriptions/limcee-500mg-chewable-tablet-orange-flavour-15-s', 'https://www.netmeds.com/non-prescriptions/limcee-500mg-tablet-15s'] },
  { id: 33, name: 'Calcirol 60K', filename: 'calcirol-60k.jpg', urls: ['https://www.netmeds.com/prescriptions/calcirol-60000iu-granules-1gm', 'https://www.netmeds.com/prescriptions/calcirol-sachet-1gm'] },
  { id: 34, name: 'Zincovit', filename: 'zincovit.jpg', urls: ['https://www.netmeds.com/non-prescriptions/zincovit-tablet-15-s', 'https://www.netmeds.com/non-prescriptions/zincovit-tablet-15s'] },
  { id: 35, name: 'Omega 3', filename: 'omega-3.jpg', urls: ['https://www.netmeds.com/non-prescriptions/truebasics-ultra-omega-3-capsule-60-s', 'https://www.netmeds.com/non-prescriptions/healthkart-hk-vitals-fish-oil-capsule-60-s'] },
  { id: 36, name: 'Neurobion Forte', filename: 'neurobion-forte.jpg', urls: ['https://www.netmeds.com/non-prescriptions/neurobion-forte-tablet-30-s', 'https://www.netmeds.com/non-prescriptions/neurobion-forte-tablet-30s'] },

  // 8. Derma
  { id: 37, name: 'Betnovate-C', filename: 'betnovate-c.jpg', urls: ['https://www.netmeds.com/prescriptions/betnovate-c-skin-cream-30gm', 'https://www.netmeds.com/prescriptions/betnovate-c-cream-30gm'] },
  { id: 38, name: 'Candid-B', filename: 'candid-b.jpg', urls: ['https://www.netmeds.com/prescriptions/candid-b-cream-20gm', 'https://www.netmeds.com/prescriptions/candid-b-cream-20g'] },
  { id: 39, name: 'Dettol Liquid', filename: 'dettol.jpg', urls: ['https://www.netmeds.com/non-prescriptions/dettol-antiseptic-liquid-250-ml', 'https://www.netmeds.com/non-prescriptions/dettol-antiseptic-liquid-250ml'] },
  { id: 40, name: 'Lacto Calamine', filename: 'lacto-calamine.jpg', urls: ['https://www.netmeds.com/non-prescriptions/lacto-calamine-oil-balance-lotion-combination-to-normal-skin-120-ml', 'https://www.netmeds.com/non-prescriptions/lacto-calamine-skin-balance-daily-nourishing-lotion-oil-control-120-ml'] }
];

async function run() {
  console.log('Testing and downloading real verified photos...');
  let downloaded = 0;

  for (const item of verifiedList) {
    const dest = path.join(outputDir, item.filename);
    let foundPhoto = null;

    for (const url of item.urls) {
      try {
        const page = await fetchPage(url);
        if (page.status === 200) {
          const imgMatch = page.body.match(/"image":\s*\[\s*"([^"]+)"/i) || page.body.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
          if (imgMatch && !imgMatch[1].includes('Social-Media') && !imgMatch[1].includes('logo')) {
            foundPhoto = imgMatch[1];
            break;
          }
        }
      } catch (e) {}
    }

    if (foundPhoto) {
      console.log(`[${item.id}/40] ✓ ${item.name} -> ${foundPhoto}`);
      await downloadFile(foundPhoto, dest);
      downloaded++;
    } else {
      console.log(`[${item.id}/40] ✗ ${item.name} could not find direct photo`);
    }
  }

  console.log(`\nFinished: Downloaded ${downloaded}/${verifiedList.length} real photos.`);
}

run();
