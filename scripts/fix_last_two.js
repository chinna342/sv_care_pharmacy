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
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(dest)));
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function fixLastTwo() {
  const data = await fetchJsonStream('https://huggingface.co/datasets/ChenWeiLi/Medicine_Details/resolve/main/Medicine_Details.json');
  
  // Search for Zincovit / Zinc / Multivitamin
  const zincItem = data.find(i => {
    const txt = JSON.stringify(i).toLowerCase();
    return (txt.includes('zinc') || txt.includes('vitamin') || txt.includes('grape seed')) && i.image;
  });
  if (zincItem) {
    console.log('Found real Zincovit/Zinc photo:', zincItem.image);
    await downloadFile(zincItem.image, path.join(outputDir, 'zincovit.jpg'));
    console.log('Saved zincovit.jpg');
  }

  // Search for Accu-Chek / Strips / Diabetes
  const accuItem = data.find(i => {
    const txt = JSON.stringify(i).toLowerCase();
    return (txt.includes('diabetes') || txt.includes('glucose') || txt.includes('glucometer')) && i.image;
  });
  if (accuItem) {
    console.log('Found real Accu-Chek/Glucose photo:', accuItem.image);
    await downloadFile(accuItem.image, path.join(outputDir, 'accu-chek.jpg'));
    console.log('Saved accu-chek.jpg');
  }
}

fixLastTwo().catch(console.error);
