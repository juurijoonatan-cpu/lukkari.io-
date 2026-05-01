import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const stripe     = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-12-18.acacia" });
const PRICE_MONTHLY = Deno.env.get("STRIPE_PRICE_ID_MONTHLY") || Deno.env.get("STRIPE_PRICE_ID");
const PRICE_YEARLY  = Deno.env.get("STRIPE_PRICE_ID_YEARLY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SVC = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Kirjautuminen vaaditaan." }, 401);

    const { billing } = await req.json().catch(() => ({ billing: "monthly" }));
    const useYearly = billing === "yearly";
    const priceId = useYearly ? PRICE_YEARLY : PRICE_MONTHLY;
    if (!priceId) {
      return json({ error: useYearly ? "Vuosihinta puuttuu konfiguraatiosta." : "Hinta puuttuu konfiguraatiosta." }, 500);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SVC);
    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authErr || !user) return json({ error: "Virheellinen istunto." }, 401);

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_id: user.id },
      });
      customerId = customer.id;
      await supabase.from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 7 },
      success_url: "https://lukkari.io/#/onboarding",
      cancel_url:  "https://lukkari.io/#/pro-subscribe",
      allow_promotion_codes: true,
      locale: "fi",
      metadata: { billing: useYearly ? "yearly" : "monthly", supabase_id: user.id },
    });

    return json({ url: session.url });

  } catch (_e) {
    return json({ error: "Virhe kassalle siirryttäessä." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
