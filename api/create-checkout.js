export default async function handler(request) {
  // Only allow POST requests
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const body = await request.json();

    const { items, email } = body;

    if (!email || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing email or cart items" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Basic validation of the cart
    const cleanItems = items.map(item => ({
      name: String(item.name),
      price: Number(item.price),
      quantity: Number(item.quantity)
    }));

    for (const item of cleanItems) {
      if (
        !item.name ||
        !Number.isFinite(item.price) ||
        item.price <= 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return new Response(
          JSON.stringify({ error: "Invalid cart item" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }

    const paypackResponse = await fetch(
      "https://checkout.paypack.rw/api/checkouts/initiate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          items: cleanItems,
          app_id: process.env.PAYPACK_APP_ID,
          email: email
        })
      }
    );

    const data = await paypackResponse.json();

    if (!paypackResponse.ok) {
      console.error("Paypack error:", data);

      return new Response(
        JSON.stringify({
          error: "Unable to create Paypack checkout",
          details: data
        }),
        {
          status: paypackResponse.status,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        payment_link: data.payment_link,
        session_id: data.session_id
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {
    console.error("Checkout error:", error);

    return new Response(
      JSON.stringify({
        error: "Something went wrong creating the checkout"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
