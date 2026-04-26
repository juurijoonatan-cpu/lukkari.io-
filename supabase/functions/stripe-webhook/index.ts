import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const stripe        = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-12-18.acacia" });
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL   = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SVC   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  const sig  = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, WEBHOOK_SECRET);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SVC);

  const sub = (event.data.object as Stripe.Subscription | Stripe.Invoice);

  async function updateByCustomer(customerId: string, updates: Record<string, unknown>) {
    await supabase.from("profiles")
      .update(updates)
      .eq("stripe_customer_id", customerId);
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const s = sub as Stripe.Subscription;
      await updateByCustomer(s.customer as string, {
        subscription_status:     s.status,
        subscription_period_end: new Date(s.current_period_end * 1000).toISOString(),
      });
      break;
    }
    case "customer.subscription.deleted": {
      const s = sub as Stripe.Subscription;
      await updateByCustomer(s.customer as string, {
        subscription_status:     "canceled",
        subscription_period_end: new Date(s.current_period_end * 1000).toISOString(),
      });
      break;
    }
    case "invoice.payment_failed": {
      const inv = sub as Stripe.Invoice;
      await updateByCustomer(inv.customer as string, { subscription_status: "past_due" });
      break;
    }
  }

  return new Response("ok", { status: 200 });
});
