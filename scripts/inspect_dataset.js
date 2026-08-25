import https from 'https';

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

async function test() {
  const data = await fetchJsonStream('https://huggingface.co/datasets/ChenWeiLi/Medicine_Details/resolve/main/Medicine_Details.json');
  console.log('Total items:', data.length);
  console.log('Sample item keys:', Object.keys(data[0]));
  console.log('Sample 3 items:', JSON.stringify(data.slice(0, 3), null, 2));

  // Search for dolo, combiflam, augmentin in all text
  for (const q of ['dolo', 'combiflam', 'augmentin', 'volini', 'telma', 'pan', 'omez']) {
    const found = data.filter(item => JSON.stringify(item).toLowerCase().includes(q));
    console.log(`Found for ${q}:`, found.length);
    if (found.length > 0) {
      console.log(`  Example for ${q}:`, found[0]);
    }
  }
}

test();
