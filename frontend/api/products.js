global.productsStorage = global.productsStorage || [];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json(global.productsStorage);
  }

  if (req.method === "POST") {
    const data = req.body || {};
    const newProduct = {
      ...data,
      id: data.id || `PROD_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    global.productsStorage.unshift(newProduct);
    return res.status(201).json(newProduct);
  }

  return res.status(200).json(global.productsStorage);
}
