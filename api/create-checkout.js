const allowedOrigin = "https://buy-culture.com";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
}

export default async function handler(request) {

  // Handle browser CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders()
    });
  }

  // Only allow POST
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed"
      }),
      {
        status: 405,
        headers: corsHeaders()
      }
    );
  }

  try {

    const body = await request.json();

    const { email, items } = body;

    if (
      !email ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return new Response(
        JSON.stringify({
          error: "Missing email or cart items"
        }),
        {
          status: 400,
          headers: corsHeaders()
        }
      );
    }

    const cleanItems = items.map(item => ({
      name: String(item.name),
      price: Number(item.price),
      quantity: Number(item.quantity)
    }));

    const paypackResponse = await fetch(
      "https://checkout.paypack.rw/api/checkouts/initiate",
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
        })
      }
    );

    const data = await paypackResponse.json();

    console.log("Paypack response:", {
      status: paypackResponse.status,
      data
    });

    if (!paypackResponse.ok) {
      return new Response(
        JSON.stringify({
          error: "Paypack checkout failed",
          details: data
        }),
        {
          status: paypackResponse.status,
          headers: corsHeaders()
        }
      );
    }

    if (!data.payment_link) {
      return new Response(
        JSON.stringify({
          error: "Paypack did not return a payment link",
          details: data
        }),
        {
          status: 502,
          headers: corsHeaders()
        }
      );
    }

    return new Response(
      JSON.stringify({
        payment_link: data.payment_link,
        session_id: data.session_id || null
      }),
      {
        status: 200,
        headers: corsHeaders()
      }
    );

  } catch (error) {

    console.error(
      "Checkout server error:",
      error
    );

    return new Response(
      JSON.stringify({
        error: "Unable to create checkout",
        details: error.message
      }),
      {
        status: 500,
        headers: corsHeaders()
      }
    );
  }
}
