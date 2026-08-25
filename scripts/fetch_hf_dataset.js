import https from 'https';

async function fetchHf(dataset) {
  return new Promise((resolve, reject) => {
    https.get(`https://huggingface.co/api/datasets/${dataset}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function test() {
  const res = await fetchHf('ChenWeiLi/Medicine_Details');
  console.log('Status:', res.status);
  try {
    const json = JSON.parse(res.data);
    console.log('Files:', json.siblings);
  } catch (e) {
    console.log('Raw:', res.data.substring(0, 300));
  }
}

test();
