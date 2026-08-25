import https from 'https';

async function fetchPage(urlStr) {
  return new Promise((resolve, reject) => {
    https.get(urlStr, {
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

async function test() {
  const urls = [
    'https://www.netmeds.com/prescriptions/combiflam-tablet-20-s',
    'https://www.netmeds.com/non-prescriptions/volini-pain-relief-gel-50gm',
    'https://www.netmeds.com/prescriptions/augmentin-625-duo-tablet-10-s',
    'https://www.netmeds.com/prescriptions/telma-40mg-tablet-15-s',
    'https://www.netmeds.com/prescriptions/asthalin-100mcg-inhaler-200-md',
    'https://www.netmeds.com/non-prescriptions/limcee-500mg-chewable-tablet-orange-flavour-15-s',
    'https://www.netmeds.com/non-prescriptions/dettol-antiseptic-liquid-250-ml',
    'https://www.netmeds.com/non-prescriptions/digene-gel-mint-flavour-200ml',
    'https://www.netmeds.com/non-prescriptions/saridon-headache-relief-tablet-10-s',
    'https://www.netmeds.com/prescriptions/pan-40mg-tablet-15-s'
  ];

  for (let u of urls) {
    try {
      const res = await fetchPage(u);
      console.log(`URL: ${u} -> Status: ${res.status}`);
      // Find schema.org image or og:image
      const imgMatch = res.body.match(/"image":\s*\[\s*"([^"]+)"/i) || res.body.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
      if (imgMatch) {
        console.log(`  -> Real photo: ${imgMatch[1]}`);
      } else {
        console.log(`  -> No image found. Page length: ${res.body.length}`);
      }
    } catch (e) {
      console.log(`  -> Error: ${e.message}`);
    }
  }
}

test();
