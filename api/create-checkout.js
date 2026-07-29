export default async function handler(request) {
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
    const { items, email } = await request.json();

    if (!email || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing email or cart items" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const cleanItems = items.map(item => ({
      name: String(item.name),
      price: Number(item.price),
      quantity: Number(item.quantity)
    }));

    const response = await fetch(
      "https://checkout.paypack.rw/api/checkouts/initiate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          items: cleanItems,
          app_id: "aafbde76-8b5d-11f1-bf97-deadd43720af",
          email: email
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Paypack error:", data);

      return new Response(
        JSON.stringify({ error: "Paypack checkout failed", details: data }),
        {
          status: response.status,
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
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({ error: "Server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
