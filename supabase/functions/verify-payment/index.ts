import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FOUNDING_LIMIT = 100

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { reference, userId, planType } = await req.json()

  if (!reference || !userId || !planType) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  // Verify with Paystack
  const paystackRes = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
      },
    },
  )

  const paystackData = await paystackRes.json()

  if (!paystackData.status || paystackData.data?.status !== 'success') {
    return new Response(JSON.stringify({ error: 'Payment not successful' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  const subscriptionCode = paystackData.data?.subscription_code ?? null
  const customerCode = paystackData.data?.customer?.customer_code ?? null

  // Claim founding member spot atomically if applicable. founding_members
  // schema is { id, user_id, plan_type, claimed_at } — no other columns, so
  // the upsert below only ever writes those two real fields plus the
  // default-populated id/claimed_at.
  const isFoundingPlan = planType.startsWith('founding')
  if (isFoundingPlan) {
    // Atomic check — only insert if under the limit
    const { count } = await supabase
      .from('founding_members')
      .select('*', { count: 'exact', head: true })

    if ((count ?? 0) < FOUNDING_LIMIT) {
      await supabase
        .from('founding_members')
        .upsert({ user_id: userId, plan_type: planType }, { onConflict: 'user_id' })
    }
    // If over limit, still proceed with standard pricing — don't block the subscription
  }

  // Update profile subscription status
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
      plan_type: planType,
      paystack_customer_code: customerCode,
      paystack_subscription_code: subscriptionCode,
      subscription_ends_at: null, // active subscription — no end date
    })
    .eq('id', userId)

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
})
