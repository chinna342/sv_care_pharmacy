import https from 'https';

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function test() {
  const html = await fetchPage('https://www.apollopharmacy.in/search-medicines/dolo-650');
  
  // Search for any .jpg or .png or .webp in the whole HTML
  const allImages = html.match(/[a-zA-Z0-9_\-\.\/]+\.(?:jpg|png|webp|jpeg)/gi) || [];
  console.log('All image filenames found:', allImages.length);
  const catalogImgs = allImages.filter(img => !img.includes('favicon') && !img.includes('bank') && !img.includes('logo') && !img.includes('icon') && !img.includes('_next'));
  console.log('Filtered catalog images:', [...new Set(catalogImgs)].slice(0, 20));
}

test();
