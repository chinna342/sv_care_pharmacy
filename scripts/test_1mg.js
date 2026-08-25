import https from 'https';

async function fetch1mg(query) {
  const url = `https://www.1mg.com/pharmacy_api_provider/v1/search?filter=true&name=${encodeURIComponent(query)}&page=1&pageSize=3`;
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.1mg.com/'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data.substring(0, 300) });
        }
      });
    }).on('error', reject);
  });
}

async function test() {
  console.log('Testing 1mg API...');
  const res = await fetch1mg('Combiflam');
  console.log('1mg status:', res.status);
  if (res.data) {
    const list = res.data.results || res.data.data?.skus || res.data.data || [];
    console.log('1mg response keys:', Object.keys(res.data));
    console.log('1mg sample result:', JSON.stringify(list[0] || res.data, null, 2).substring(0, 500));
  } else {
    console.log('1mg raw:', res.raw);
  }
}

test();
