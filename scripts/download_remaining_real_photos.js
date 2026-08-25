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

const remainingTargets = [
  { id: 19, name: 'Accu-Chek Glucose Test Strips', keys: ['glucometer', 'blood glucose', 'test strip', 'sugar test', 'accu-chek', 'contour', 'onetouch', 'dr. morepen bg', 'strips'], filename: 'accu-chek.jpg' },
  { id: 25, name: 'Benadryl Dry Cough Syrup', keys: ['cough syrup', 'dextromethorphan', 'benadryl', 'corex', 'grilinctus', 'ascoril', 'tussq', 'koflet'], filename: 'benadryl.jpg' },
  { id: 26, name: 'Otrivin Nasal Spray', keys: ['nasal spray', 'xylometazoline', 'oxymetazoline', 'otrivin', 'nasivion', 'sinarest nasal'], filename: 'otrivin.jpg' },
  { id: 30, name: 'Eno Fruit Salt Antacid', keys: ['fruit salt', 'antacid', 'effervescent', 'eno', 'sodium bicarbonate', 'pudin hara', 'gasex'], filename: 'eno.jpg' },
  { id: 31, name: 'Duphalac Lactulose Syrup', keys: ['lactulose', 'duphalac', 'laxative', 'cremaffin', 'looz', 'constulose'], filename: 'duphalac.jpg' },
  { id: 32, name: 'Limcee 500mg Vitamin C', keys: ['vitamin c', 'ascorbic acid', 'limcee', 'celin', 'chewable vitamin c', 'sukcee', 'c-lite'], filename: 'limcee-500.jpg' },
  { id: 33, name: 'Calcirol 60K Vitamin D3', keys: ['cholecalciferol', 'vitamin d3 60', 'calcirol', 'd3 60k', 'uprise d3', 'arachitol', 'd-rise'], filename: 'calcirol-60k.jpg' },
  { id: 34, name: 'Zincovit Multivitamin', keys: ['multivitamin', 'zincovit', 'becadexamin', 'supradyn', 'a to z', 'revital', 'multivitamin tablet'], filename: 'zincovit.jpg' },
  { id: 38, name: 'Candid-B Antifungal Cream', keys: ['candid-b', 'clotrimazole', 'beclomethasone', 'candid', 'fungal cream', 'derma cream', 'clocip', 'canesten', 'lignocaine'], filename: 'candid-b.jpg' },
  { id: 39, name: 'Dettol Antiseptic Liquid', keys: ['antiseptic', 'dettol', 'savlon', 'chlorhexidine', 'disinfectant liquid', 'first aid antiseptic'], filename: 'dettol.jpg' },
  { id: 40, name: 'Lacto Calamine Lotion', keys: ['calamine', 'lacto calamine', 'caladryl', 'zinc oxide lotion', 'soothing lotion', 'skin balance lotion'], filename: 'lacto-calamine.jpg' }
];

async function main() {
  console.log('Downloading Indian Medicine database for remaining items...');
  const data = await fetchJsonStream('https://huggingface.co/datasets/ChenWeiLi/Medicine_Details/resolve/main/Medicine_Details.json');
  console.log(`Database loaded: ${data.length} entries.`);

  let resolved = 0;

  for (const t of remainingTargets) {
    const dest = path.join(outputDir, t.filename);
    let matchedItem = null;

    for (const key of t.keys) {
      matchedItem = data.find(item => {
        if (!item.image || !item.image.startsWith('http')) return false;
        const convText = (item.conversations || []).map(c => c.content || '').join(' ').toLowerCase();
        return convText.includes(key);
      });
      if (matchedItem) {
        console.log(`[${t.id}/40] Matched keyword "${key}" for ${t.name}:`);
        break;
      }
    }

    if (matchedItem) {
      console.log(`       -> Found photo: ${matchedItem.image}`);
      try {
        await downloadFile(matchedItem.image, dest);
        console.log(`       -> Saved ${t.filename} (${fs.statSync(dest).size} bytes)`);
        resolved++;
      } catch (err) {
        console.error(`       -> Error downloading: ${err.message}`);
      }
    } else {
      console.log(`[${t.id}/40] ✗ No keyword matched for ${t.name}`);
    }
  }

  console.log(`\nResolved ${resolved}/${remainingTargets.length} remaining items.`);
}

main().catch(console.error);
