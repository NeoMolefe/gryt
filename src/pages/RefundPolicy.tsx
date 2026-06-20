import { LegalPage, LegalSection } from '@/components/marketing/LegalPage'

export function RefundPolicy() {
  return (
    <LegalPage title="Refund Policy" lastUpdated="June 2026">
      <LegalSection heading="1. Free Trial">
        <p style={{ marginBottom: 12 }}>
          GRYT offers a 7-day free trial. No payment is taken during the trial period. You may cancel at any time
          during the trial at no cost and you will not be charged.
        </p>
      </LegalSection>

      <LegalSection heading="2. Subscriptions">
        <p style={{ marginBottom: 12 }}>
          GRYT offers monthly and annual subscription plans. Your subscription begins on the date your first
          payment is processed.
        </p>
      </LegalSection>

      <LegalSection heading="3. Cancellation">
        <p style={{ marginBottom: 12 }}>
          You may cancel your subscription at any time through the Settings section of the app. Cancellation takes
          effect at the end of your current billing period. You will retain full access to GRYT until that date.
        </p>
      </LegalSection>

      <LegalSection heading="4. Refunds — Monthly Subscriptions">
        <p style={{ marginBottom: 12 }}>
          Monthly subscriptions are non-refundable once the billing period has commenced. If you cancel a monthly
          subscription, no refund will be issued for the current month. Your access will continue until the end of
          the paid period.
        </p>
      </LegalSection>

      <LegalSection heading="5. Refunds — Annual Subscriptions">
        <p style={{ marginBottom: 12 }}>
          If you cancel an annual subscription within 5 business days of your most recent charge, you are entitled
          to a full refund of that charge in accordance with the Consumer Protection Act 68 of 2008 (CPA). To
          request this refund, contact us at info@gryt.co.za with your registered email address and the date of
          payment. Refunds will be processed within 10 business days.
        </p>
        <p style={{ marginBottom: 12 }}>
          After the 5-business-day cooling-off period, annual subscriptions are non-refundable for the remainder of
          the billing year. We may, at our discretion, offer a pro-rata refund for exceptional circumstances —
          contact us to discuss.
        </p>
      </LegalSection>

      <LegalSection heading="6. Your Rights Under the Consumer Protection Act">
        <p style={{ marginBottom: 12 }}>
          Nothing in this policy limits or excludes rights you are entitled to under the Consumer Protection Act 68
          of 2008 or any other applicable South African law. If you believe your statutory rights have not been
          respected, you may contact the National Consumer Commission at www.thencc.org.za.
        </p>
      </LegalSection>

      <LegalSection heading="7. Exceptional Circumstances">
        <p style={{ marginBottom: 12 }}>
          We consider refund requests on a case-by-case basis for circumstances outside your control, including
          extended technical outages on our side that prevented you from accessing the service. Contact us at
          info@gryt.co.za to discuss.
        </p>
      </LegalSection>

      <LegalSection heading="8. How to Request a Refund">
        <p style={{ marginBottom: 12 }}>Email info@gryt.co.za with:</p>
        <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
          <li style={{ marginBottom: 6 }}>Your full name</li>
          <li style={{ marginBottom: 6 }}>Your registered email address</li>
          <li style={{ marginBottom: 6 }}>Date of the charge</li>
          <li style={{ marginBottom: 6 }}>Reason for your request</li>
        </ul>
        <p style={{ marginBottom: 0 }}>We will respond within 3 business days.</p>
      </LegalSection>
    </LegalPage>
  )
}
