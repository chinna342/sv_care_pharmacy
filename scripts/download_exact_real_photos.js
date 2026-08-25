import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '..', 'frontend', 'public', 'medicines');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

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
  { id: 1, name: 'Dolo 650', keys: ['dolo 650', 'dolo-650', 'dolo'], filename: 'dolo-650.jpg' },
  { id: 2, name: 'Combiflam', keys: ['combiflam', 'combiflam plus'], filename: 'combiflam.jpg' },
  { id: 3, name: 'Tramadol', keys: ['tramadol', 'tramazac', 'ultram'], filename: 'tramadol.jpg' },
  { id: 4, name: 'Volini', keys: ['volini gel', 'volini maxx', 'volini'], filename: 'volini.jpg' },
  { id: 5, name: 'Naprosyn', keys: ['naprosyn', 'naproxen'], filename: 'naprosyn.jpg' },
  { id: 6, name: 'Saridon', keys: ['saridon'], filename: 'saridon.jpg' },
  { id: 7, name: 'Augmentin 625', keys: ['augmentin 625', 'augmentin duo', 'augmentin'], filename: 'augmentin-625.jpg' },
  { id: 8, name: 'Azee 500', keys: ['azee 500', 'azee', 'azithral 500', 'azithromycin'], filename: 'azee-500.jpg' },
  { id: 9, name: 'Ciplox 500', keys: ['ciplox 500', 'ciplox', 'ciprofloxacin 500'], filename: 'ciplox-500.jpg' },
  { id: 10, name: 'Taxim-O 200', keys: ['taxim-o 200', 'taxim o 200', 'taxim-o', 'taxim'], filename: 'taxim-o-200.jpg' },
  { id: 11, name: 'Flagyl 400', keys: ['flagyl 400', 'flagyl', 'metrogyl 400', 'metronidazole'], filename: 'flagyl-400.jpg' },
  { id: 12, name: 'Telma 40', keys: ['telma 40', 'telma', 'telmisartan 40'], filename: 'telma-40.jpg' },
  { id: 13, name: 'Amlong 5', keys: ['amlong 5', 'amlong', 'amlodipine 5', 'amlovas 5'], filename: 'amlong-5.jpg' },
  { id: 14, name: 'Atorva 10', keys: ['atorva 10', 'atorva', 'atorvastatin 10', 'atorlip 10'], filename: 'atorva-10.jpg' },
  { id: 15, name: 'Ecosprin 75', keys: ['ecosprin 75', 'ecosprin', 'aspirin 75'], filename: 'ecosprin-75.jpg' },
  { id: 16, name: 'Concor 5', keys: ['concor 5', 'concor', 'bisoprolol 5', 'bisocor 5'], filename: 'concor-5.jpg' },
  { id: 17, name: 'Glycomet 500', keys: ['glycomet 500', 'glycomet-sr 500', 'glycomet', 'metformin 500'], filename: 'glycomet-500.jpg' },
  { id: 18, name: 'Amaryl 1', keys: ['amaryl 1', 'amaryl', 'glimepiride 1', 'glimy 1'], filename: 'amaryl-1.jpg' },
  { id: 19, name: 'Accu-Chek', keys: ['accu-chek', 'accu chek', 'onetouch', 'contour'], filename: 'accu-chek.jpg' },
  { id: 20, name: 'Januvia 100', keys: ['januvia 100', 'januvia', 'sitagliptin 100', 'istavel 100'], filename: 'januvia-100.jpg' },
  { id: 21, name: 'Lantus SoloStar', keys: ['lantus solostar', 'lantus', 'insulin glargine', 'humalog', 'novorapid'], filename: 'lantus-solostar.jpg' },
  { id: 22, name: 'Montair-LC', keys: ['montair-lc', 'montair lc', 'monticope', 'montek-lc'], filename: 'montair-lc.jpg' },
  { id: 23, name: 'Asthalin Inhaler', keys: ['asthalin inhaler', 'asthalin', 'ventorlin', 'aerocort inhaler'], filename: 'asthalin-inhaler.jpg' },
  { id: 24, name: 'Cetzine 10', keys: ['cetzine', 'cetirizine 10', 'alerid', 'okacet'], filename: 'cetzine-10.jpg' },
  { id: 25, name: 'Benadryl', keys: ['benadryl cough', 'benadryl syrup', 'benadryl', 'grilinctus'], filename: 'benadryl.jpg' },
  { id: 26, name: 'Otrivin', keys: ['otrivin oxy', 'otrivin adult', 'otrivin', 'nasivion'], filename: 'otrivin.jpg' },
  { id: 27, name: 'Pan 40', keys: ['pan 40', 'pan-40', 'pantocid 40', 'pantodac 40'], filename: 'pan-40.jpg' },
  { id: 28, name: 'Omez 20', keys: ['omez 20', 'omez capsule', 'omez', 'omecid 20'], filename: 'omez-20.jpg' },
  { id: 29, name: 'Digene', keys: ['digene gel', 'digene syrup', 'digene mint', 'digene', 'gelusil'], filename: 'digene.jpg' },
  { id: 30, name: 'Eno', keys: ['eno fruit salt', 'eno regular', 'eno powder', 'eno', 'pudin hara'], filename: 'eno.jpg' },
  { id: 31, name: 'Duphalac', keys: ['duphalac solution', 'duphalac syrup', 'duphalac', 'lactulose syrup'], filename: 'duphalac.jpg' },
  { id: 32, name: 'Limcee 500', keys: ['limcee 500', 'limcee', 'celin 500', 'vitamin c 500'], filename: 'limcee-500.jpg' },
  { id: 33, name: 'Calcirol 60K', keys: ['calcirol 60k', 'calcirol', 'd3-must 60k', 'uprise-d3 60k'], filename: 'calcirol-60k.jpg' },
  { id: 34, name: 'Zincovit', keys: ['zincovit tablet', 'zincovit', 'becadexamin', 'supradyn'], filename: 'zincovit.jpg' },
  { id: 35, name: 'Omega 3', keys: ['omega-3', 'omega 3', 'fish oil', 'truebasics omega', 'seacod'], filename: 'omega-3.jpg' },
  { id: 36, name: 'Neurobion Forte', keys: ['neurobion forte', 'neurobion', 'becosules', 'optineuron'], filename: 'neurobion-forte.jpg' },
  { id: 37, name: 'Betnovate-C', keys: ['betnovate-c', 'betnovate c', 'betnovate-n', 'betnovate'], filename: 'betnovate-c.jpg' },
  { id: 38, name: 'Candid-B', keys: ['candid-b', 'candid b', 'candid cream', 'clocip cream'], filename: 'candid-b.jpg' },
  { id: 39, name: 'Dettol', keys: ['dettol antiseptic', 'dettol liquid', 'dettol', 'savlon liquid'], filename: 'dettol.jpg' },
  { id: 40, name: 'Lacto Calamine', keys: ['lacto calamine lotion', 'lacto calamine', 'caladryl lotion'], filename: 'lacto-calamine.jpg' }
];

async function main() {
  console.log('Downloading Indian Medicine database from Hugging Face...');
  const data = await fetchJsonStream('https://huggingface.co/datasets/ChenWeiLi/Medicine_Details/resolve/main/Medicine_Details.json');
  console.log(`Database loaded: ${data.length} real pharmaceutical entries.`);

  let matchedCount = 0;

  for (const t of targets) {
    const dest = path.join(outputDir, t.filename);
    let matchedItem = null;

    // Search through database conversations
    for (const key of t.keys) {
      matchedItem = data.find(item => {
        if (!item.image || !item.image.startsWith('http')) return false;
        const convText = (item.conversations || []).map(c => c.content || '').join(' ').toLowerCase();
        return convText.includes(key);
      });
      if (matchedItem) break;
    }

    if (matchedItem) {
      console.log(`[${t.id}/40] ✓ Found real photograph for ${t.name} -> ${matchedItem.image}`);
      try {
        await downloadFile(matchedItem.image, dest);
        const size = fs.statSync(dest).size;
        console.log(`       Saved to ${t.filename} (${size} bytes)`);
        matchedCount++;
      } catch (err) {
        console.error(`       Failed to download image:`, err.message);
      }
    } else {
      console.log(`[${t.id}/40] ✗ No database match found for ${t.name}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`Successfully matched and downloaded ${matchedCount}/${targets.length} REAL medicine photographs!`);
  console.log(`========================================`);
}

main().catch(console.error);
