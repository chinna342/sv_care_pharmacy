import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '..', 'frontend', 'public', 'medicines');

function fetchJsonStream(urlStr) {
  return new Promise((resolve, reject) => {
    https.get(urlStr, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJsonStream(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
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
        'Referer': 'https://www.1mg.com/'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, urlStr).href;
        return downloadFile(nextUrl, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${urlStr}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(dest)));
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

const targets = [
  { id: 1, name: 'Dolo 650', query: 'dolo 650', filename: 'dolo-650.jpg' },
  { id: 2, name: 'Combiflam', query: 'combiflam', filename: 'combiflam.jpg' },
  { id: 3, name: 'Tramadol', query: 'tramadol', filename: 'tramadol.jpg' },
  { id: 4, name: 'Volini', query: 'volini', filename: 'volini.jpg' },
  { id: 5, name: 'Naprosyn', query: 'naprosyn', filename: 'naprosyn.jpg' },
  { id: 6, name: 'Saridon', query: 'saridon', filename: 'saridon.jpg' },
  { id: 7, name: 'Augmentin 625', query: 'augmentin 625', filename: 'augmentin-625.jpg' },
  { id: 8, name: 'Azee 500', query: 'azee 500', filename: 'azee-500.jpg' },
  { id: 9, name: 'Ciplox 500', query: 'ciplox 500', filename: 'ciplox-500.jpg' },
  { id: 10, name: 'Taxim-O 200', query: 'taxim-o 200', filename: 'taxim-o-200.jpg' },
  { id: 11, name: 'Flagyl 400', query: 'flagyl 400', filename: 'flagyl-400.jpg' },
  { id: 12, name: 'Telma 40', query: 'telma 40', filename: 'telma-40.jpg' },
  { id: 13, name: 'Amlong 5', query: 'amlong 5', filename: 'amlong-5.jpg' },
  { id: 14, name: 'Atorva 10', query: 'atorva 10', filename: 'atorva-10.jpg' },
  { id: 15, name: 'Ecosprin 75', query: 'ecosprin 75', filename: 'ecosprin-75.jpg' },
  { id: 16, name: 'Concor 5', query: 'concor 5', filename: 'concor-5.jpg' },
  { id: 17, name: 'Glycomet 500', query: 'glycomet 500', filename: 'glycomet-500.jpg' },
  { id: 18, name: 'Amaryl 1', query: 'amaryl 1', filename: 'amaryl-1.jpg' },
  { id: 19, name: 'Accu-Chek', query: 'accu-chek', filename: 'accu-chek.jpg' },
  { id: 20, name: 'Januvia 100', query: 'januvia 100', filename: 'januvia-100.jpg' },
  { id: 21, name: 'Lantus SoloStar', query: 'lantus', filename: 'lantus-solostar.jpg' },
  { id: 22, name: 'Montair-LC', query: 'montair-lc', filename: 'montair-lc.jpg' },
  { id: 23, name: 'Asthalin Inhaler', query: 'asthalin', filename: 'asthalin-inhaler.jpg' },
  { id: 24, name: 'Cetzine 10', query: 'cetzine', filename: 'cetzine-10.jpg' },
  { id: 25, name: 'Benadryl', query: 'benadryl', filename: 'benadryl.jpg' },
  { id: 26, name: 'Otrivin', query: 'otrivin', filename: 'otrivin.jpg' },
  { id: 27, name: 'Pan 40', query: 'pan 40', filename: 'pan-40.jpg' },
  { id: 28, name: 'Omez 20', query: 'omez 20', filename: 'omez-20.jpg' },
  { id: 29, name: 'Digene', query: 'digene', filename: 'digene.jpg' },
  { id: 30, name: 'Eno', query: 'eno', filename: 'eno.jpg' },
  { id: 31, name: 'Duphalac', query: 'duphalac', filename: 'duphalac.jpg' },
  { id: 32, name: 'Limcee 500', query: 'limcee', filename: 'limcee-500.jpg' },
  { id: 33, name: 'Calcirol 60K', query: 'calcirol', filename: 'calcirol-60k.jpg' },
  { id: 34, name: 'Zincovit', query: 'zincovit', filename: 'zincovit.jpg' },
  { id: 35, name: 'Omega 3', query: 'omega', filename: 'omega-3.jpg' },
  { id: 36, name: 'Neurobion Forte', query: 'neurobion', filename: 'neurobion-forte.jpg' },
  { id: 37, name: 'Betnovate-C', query: 'betnovate-c', filename: 'betnovate-c.jpg' },
  { id: 38, name: 'Candid-B', query: 'candid-b', filename: 'candid-b.jpg' },
  { id: 39, name: 'Dettol', query: 'dettol', filename: 'dettol.jpg' },
  { id: 40, name: 'Lacto Calamine', query: 'lacto calamine', filename: 'lacto-calamine.jpg' }
];

async function main() {
  console.log('Downloading Indian Medicine Details database from Hugging Face resolve URL...');
  const data = await fetchJsonStream('https://huggingface.co/datasets/ChenWeiLi/Medicine_Details/resolve/main/Medicine_Details.json');
  console.log(`Database loaded: ${data.length} real pharmaceutical entries.`);

  let matchedCount = 0;
  for (const t of targets) {
    const dest = path.join(outputDir, t.filename);
    const qLower = t.query.toLowerCase();

    // Find medicine in database
    const matched = data.find(m => {
      const name = (m['Medicine Name'] || '').toLowerCase();
      return name.includes(qLower) && m['Image URL'] && m['Image URL'].startsWith('http');
    });

    if (matched) {
      console.log(`[${t.id}/40] ✓ Found real photograph for ${t.name}: "${matched['Medicine Name']}" -> ${matched['Image URL']}`);
      try {
        await downloadFile(matched['Image URL'], dest);
        matchedCount++;
      } catch (err) {
        console.error(`Failed to download ${matched['Image URL']}:`, err.message);
      }
    } else {
      console.log(`[${t.id}/40] ✗ No database match for ${t.name}`);
    }
  }

  console.log(`\nMatched & Downloaded ${matchedCount}/${targets.length} real medicine photos directly to ${outputDir}!`);
}

main().catch(console.error);
