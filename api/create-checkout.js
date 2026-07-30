export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "https://buy-culture.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { email, items } = req.body;

    if (!email || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Missing email or cart items"
      });
    }

    const cleanItems = items.map(item => ({
      name: String(item.name),
      price: Number(item.price),
      quantity: Number(item.quantity)
    }));

    console.log("========== PAYPACK REQUEST ==========");
    console.log({
      app_id: process.env.PAYPACK_APP_ID,
      email,
      items: cleanItems
    });

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 10000);

    const paypackResponse = await fetch(
      "https://paypack-checkout.fly.dev/api/checkouts/initiate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          app_id: process.env.PAYPACK_APP_ID,
          email,
          items: cleanItems
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    console.log("Paypack HTTP Status:", paypackResponse.status);

    const rawResponse = await paypackResponse.text();

    console.log("========== RAW RESPONSE ==========");
    console.log(rawResponse);

    let data = {};

    try {
      data = JSON.parse(rawResponse);
    } catch {
      data = {
        raw: rawResponse
      };
    }

    console.log("========== PARSED RESPONSE ==========");
    console.log(data);

    if (!paypackResponse.ok) {
      return res.status(paypackResponse.status).json({
        error: "Paypack checkout failed",
        details: data
      });
    }

    if (!data.payment_link) {
      return res.status(500).json({
        error: "No payment_link returned",
        details: data
      });
    }

    return res.status(200).json({
      payment_link: data.payment_link,
      session_id: data.session_id || null
    });

  } catch (err) {

    console.error("========== SERVER ERROR ==========");
    console.error(err);
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);

    return res.status(500).json({
      error: err.message,
      stack:
        process.env.NODE_ENV === "development"
          ? err.stack
          : undefined
    });
  }
}
