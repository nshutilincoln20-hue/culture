export default async function handler(request) {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed"
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json"
        }
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
          headers: {
            "Content-Type": "application/json"
          }
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

    const data =
      await paypackResponse.json();

    if (!paypackResponse.ok) {

      console.error(
        "Paypack error:",
        data
      );

      return new Response(
        JSON.stringify({
          error: "Paypack checkout failed",
          details: data
        }),
        {
          status: paypackResponse.status,
          headers: {
            "Content-Type":
              "application/json"
          }
        }
      );
    }

    if (!data.payment_link) {

      console.error(
        "Paypack returned no payment link:",
        data
      );

      return new Response(
        JSON.stringify({
          error:
            "Paypack did not return a payment link",
          details: data
        }),
        {
          status: 502,
          headers: {
            "Content-Type":
              "application/json"
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        payment_link:
          data.payment_link,

        session_id:
          data.session_id || null
      }),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/json"
        }
      }
    );

  } catch (error) {

    console.error(
      "Checkout server error:",
      error
    );

    return new Response(
      JSON.stringify({
        error:
          "Unable to create checkout"
      }),
      {
        status: 500,
        headers: {
          "Content-Type":
            "application/json"
        }
      }
    );
  }
}
