export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "https://buy-culture.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle browser preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST
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

    console.log("Sending to Paypack:", {
      app_id: process.env.PAYPACK_APP_ID,
      email,
      items: cleanItems
    });

    const paypackResponse = await fetch(
      "https://checkout.paypack.rw/api/checkouts/initiate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          app_id: process.env.PAYPACK_APP_ID,
          email,
          items: cleanItems
        })
      }
    );

    const data = await paypackResponse.json();

    console.log("Paypack Status:", paypackResponse.status);
    console.log("Paypack Response:", data);

    if (!paypackResponse.ok) {
      return res.status(paypackResponse.status).json({
        error: "Paypack checkout failed",
        details: data
      });
    }

    if (!data.payment_link) {
      return res.status(500).json({
        error: "Paypack did not return a payment link",
        details: data
      });
    }

    return res.status(200).json({
      payment_link: data.payment_link,
      session_id: data.session_id || null
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);

    return res.status(500).json({
      error: err.message
    });
  }
}
