import { createClient } from 'jsr:@supabase/supabase-js@2'
import { createHmac } from 'node:crypto'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })

  const signature = req.headers.get('x-paystack-signature')
  const body = await req.text()

  // Verify webhook signature
  const hash = createHmac('sha512', Deno.env.get('PAYSTACK_SECRET_KEY')!)
    .update(body)
    .digest('hex')

  if (hash !== signature) {
    return new Response('Invalid signature', { status: 401 })
  }

  const event = JSON.parse(body)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const customerCode = event.data?.customer?.customer_code

  if (!customerCode) {
    return new Response('OK', { status: 200 })
  }

  switch (event.event) {
    case 'subscription.create':
    case 'charge.success': {
      await supabase
        .from('profiles')
        .update({ subscription_status: 'active' })
        .eq('paystack_customer_code', customerCode)
      break
    }

    case 'subscription.disable':
    case 'subscription.expiry_reminder': {
      // Subscription cancelled or about to expire
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'cancelled',
          subscription_ends_at: event.data?.next_payment_date ?? null,
        })
        .eq('paystack_customer_code', customerCode)
      break
    }

    case 'invoice.payment_failed': {
      await supabase
        .from('profiles')
        .update({ subscription_status: 'past_due' })
        .eq('paystack_customer_code', customerCode)
      break
    }

    default:
      break
  }

  return new Response('OK', { status: 200 })
})
