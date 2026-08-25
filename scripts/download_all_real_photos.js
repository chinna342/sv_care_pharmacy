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

function fetchPage(urlStr) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(urlStr);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    client.get(urlStr, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
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
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://www.netmeds.com/'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, urlStr).href;
        return downloadFile(nextUrl, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Download failed HTTP ${res.statusCode} for ${urlStr}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(dest));
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

const productSearchList = [
  { id: 1, name: 'Dolo 650', filename: 'dolo-650.jpg', query: 'dolo 650' },
  { id: 2, name: 'Combiflam', filename: 'combiflam.jpg', query: 'combiflam' },
  { id: 3, name: 'Tramadol', filename: 'tramadol.jpg', query: 'tramazac' },
  { id: 4, name: 'Volini', filename: 'volini.jpg', query: 'volini pain relief gel 50gm' },
  { id: 5, name: 'Naprosyn', filename: 'naprosyn.jpg', query: 'naprosyn 500' },
  { id: 6, name: 'Saridon', filename: 'saridon.jpg', query: 'saridon headache relief' },
  { id: 7, name: 'Augmentin 625', filename: 'augmentin-625.jpg', query: 'augmentin 625 duo' },
  { id: 8, name: 'Azee 500', filename: 'azee-500.jpg', query: 'azee 500' },
  { id: 9, name: 'Ciplox 500', filename: 'ciplox-500.jpg', query: 'ciplox 500' },
  { id: 10, name: 'Taxim-O 200', filename: 'taxim-o-200.jpg', query: 'taxim o 200' },
  { id: 11, name: 'Flagyl 400', filename: 'flagyl-400.jpg', query: 'flagyl 400' },
  { id: 12, name: 'Telma 40', filename: 'telma-40.jpg', query: 'telma 40' },
  { id: 13, name: 'Amlong 5', filename: 'amlong-5.jpg', query: 'amlong 5' },
  { id: 14, name: 'Atorva 10', filename: 'atorva-10.jpg', query: 'atorva 10' },
  { id: 15, name: 'Ecosprin 75', filename: 'ecosprin-75.jpg', query: 'ecosprin 75' },
  { id: 16, name: 'Concor 5', filename: 'concor-5.jpg', query: 'concor 5' },
  { id: 17, name: 'Glycomet 500', filename: 'glycomet-500.jpg', query: 'glycomet 500 sr' },
  { id: 18, name: 'Amaryl 1', filename: 'amaryl-1.jpg', query: 'amaryl 1mg' },
  { id: 19, name: 'Accu-Chek', filename: 'accu-chek.jpg', query: 'accu chek active test strips 50' },
  { id: 20, name: 'Januvia 100', filename: 'januvia-100.jpg', query: 'januvia 100' },
  { id: 21, name: 'Lantus SoloStar', filename: 'lantus-solostar.jpg', query: 'lantus solostar' },
  { id: 22, name: 'Montair-LC', filename: 'montair-lc.jpg', query: 'montair lc' },
  { id: 23, name: 'Asthalin Inhaler', filename: 'asthalin-inhaler.jpg', query: 'asthalin 100mcg inhaler' },
  { id: 24, name: 'Cetzine 10', filename: 'cetzine-10.jpg', query: 'cetzine' },
  { id: 25, name: 'Benadryl', filename: 'benadryl.jpg', query: 'benadryl cough formula syrup 100ml' },
  { id: 26, name: 'Otrivin', filename: 'otrivin.jpg', query: 'otrivin oxy fast relief' },
  { id: 27, name: 'Pan 40', filename: 'pan-40.jpg', query: 'pan 40' },
  { id: 28, name: 'Omez 20', filename: 'omez-20.jpg', query: 'omez 20' },
  { id: 29, name: 'Digene', filename: 'digene.jpg', query: 'digene gel mint flavour 200ml' },
  { id: 30, name: 'Eno', filename: 'eno.jpg', query: 'eno fruit salt regular 100gm' },
  { id: 31, name: 'Duphalac', filename: 'duphalac.jpg', query: 'duphalac oral solution 200ml' },
  { id: 32, name: 'Limcee 500', filename: 'limcee-500.jpg', query: 'limcee 500mg' },
  { id: 33, name: 'Calcirol 60K', filename: 'calcirol-60k.jpg', query: 'calcirol 60000iu granules' },
  { id: 34, name: 'Zincovit', filename: 'zincovit.jpg', query: 'zincovit tablet' },
  { id: 35, name: 'Omega 3', filename: 'omega-3.jpg', query: 'truebasics ultra omega 3' },
  { id: 36, name: 'Neurobion Forte', filename: 'neurobion-forte.jpg', query: 'neurobion forte' },
  { id: 37, name: 'Betnovate-C', filename: 'betnovate-c.jpg', query: 'betnovate c skin cream' },
  { id: 38, name: 'Candid-B', filename: 'candid-b.jpg', query: 'candid b cream 20gm' },
  { id: 39, name: 'Dettol', filename: 'dettol.jpg', query: 'dettol antiseptic liquid 250 ml' },
  { id: 40, name: 'Lacto Calamine', filename: 'lacto-calamine.jpg', query: 'lacto calamine oil balance lotion 120 ml' }
];

async function processAll() {
  console.log(`Starting real pharmacy image extraction for ${productSearchList.length} products...`);
  let successCount = 0;

  for (const item of productSearchList) {
    const destPath = path.join(outputDir, item.filename);
    console.log(`[${item.id}/40] Searching real image for: ${item.name}...`);

    try {
      // Search via Netmeds catalog search
      const encodedQuery = encodeURIComponent(item.query);
      const searchUrl = `https://www.netmeds.com/catalogsearch/result?q=${encodedQuery}`;
      const searchPage = await fetchPage(searchUrl);

      let realImageUrl = null;

      // Check if redirected directly to product page
      if (searchPage.url && searchPage.url.includes('/product/')) {
        const ogMatch = searchPage.body.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        if (ogMatch && !ogMatch[1].includes('social-media') && !ogMatch[1].includes('logo')) {
          realImageUrl = ogMatch[1];
        }
      }

      // If not, extract the first product image from search results
      if (!realImageUrl) {
        const imgMatches = searchPage.body.match(/https:\/\/gdn\.pixelbin\.io\/[^"'\s<>]+\.(?:jpg|png|webp|jpeg)/gi) ||
                           searchPage.body.match(/https:\/\/[^"'\s<>]+\/products\/assets\/item\/[^"'\s<>]+\.(?:jpg|png|webp|jpeg)/gi) ||
                           searchPage.body.match(/https:\/\/www\.netmeds\.com\/images\/product-v1\/600x600\/[^"'\s<>]+\.(?:jpg|png|webp|jpeg)/gi);
        
        if (imgMatches && imgMatches.length > 0) {
          // pick first non-generic match
          const cleanMatches = imgMatches.filter(u => !u.includes('social-media') && !u.includes('logo') && !u.includes('banner'));
          if (cleanMatches.length > 0) {
            realImageUrl = cleanMatches[0];
          }
        }
      }

      if (realImageUrl) {
        console.log(`  ✓ Found real photo: ${realImageUrl}`);
        await downloadFile(realImageUrl, destPath);
        const size = fs.statSync(destPath).size;
        console.log(`  ✓ Saved ${item.filename} (${size} bytes)`);
        successCount++;
      } else {
        console.log(`  ✗ No real image found in search for: ${item.name}`);
      }
    } catch (err) {
      console.error(`  ✗ Error processing ${item.name}:`, err.message);
    }
  }

  console.log(`\n========================================`);
  console.log(`Successfully downloaded ${successCount}/${productSearchList.length} real medicine photos!`);
  console.log(`========================================`);
}

processAll();
