import type { PlanType } from '@/types/subscription.types'

const PLAN_CODES: Record<PlanType, string> = {
  founding_monthly: 'PLN_d4zfhw5jfzlshwp',
  founding_annual: 'PLN_np7snhz7vxvje32',
  standard_monthly: 'PLN_t2uo7040g02bol6',
  standard_annual: 'PLN_c7b1y99b1z98cxz',
}

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string

interface CheckoutOptions {
  userId: string
  userEmail: string
  planType: PlanType
}

export async function initiateCheckout({ userId, userEmail, planType }: CheckoutOptions): Promise<void> {
  // Dynamically load Paystack inline JS
  await loadPaystackScript()

  return new Promise((resolve, reject) => {
    // Named function declarations, not arrow functions inside the object
    // literal — Paystack's inline.js validator rejects some arrow function
    // shapes for callback/onClose with "Attribute callback must be a valid
    // function". Named function references pass validation.
    function onSuccess(response: { reference: string }) {
      verifyPayment(response.reference, userId, planType)
        .then(() => {
          // Reload to refresh subscription state
          window.location.href = '/dashboard'
          resolve()
        })
        .catch((err) => {
          console.error('Checkout error:', err)
          reject(err instanceof Error ? err : new Error('Payment verification failed'))
        })
    }

    function onClose() {
      // User closed the modal — not an error, just resolve
      resolve()
    }

    // @ts-expect-error — PaystackPop is loaded dynamically
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: userEmail,
      plan: PLAN_CODES[planType],
      metadata: {
        user_id: userId,
        plan_type: planType,
        is_founding: planType.startsWith('founding'),
      },
      callback: onSuccess,
      onClose: onClose,
    })

    handler.openIframe()
  })
}

async function verifyPayment(reference: string, userId: string, planType: PlanType): Promise<void> {
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ reference, userId, planType }),
    },
  )
  if (!res.ok) throw new Error('Verification failed')
}

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById('paystack-script')) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.id = 'paystack-script'
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
}
