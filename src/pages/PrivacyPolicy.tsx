import { LegalPage, LegalSection } from '@/components/marketing/LegalPage'

export function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="June 2026">
      <LegalSection heading="1. Who We Are">
        <p style={{ marginBottom: 12 }}>
          GRYT is a personalised fitness training application operated by Catalyst Digital Operations (Pty) Ltd, a
          company registered in South Africa. When this policy refers to &quot;GRYT&quot;, &quot;we&quot;,
          &quot;us&quot;, or &quot;our&quot;, it means Catalyst Digital Operations (Pty) Ltd.
        </p>
      </LegalSection>

      <LegalSection heading="2. What Information We Collect">
        <p style={{ marginBottom: 12 }}>
          <strong>Information you provide directly:</strong>
        </p>
        <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
          <li style={{ marginBottom: 6 }}>Account details: name, email address, password</li>
          <li style={{ marginBottom: 6 }}>
            Personal health and fitness data: age, height, weight, gender, fitness experience level, training
            goals, injury history, available equipment, and training schedule preferences
          </li>
          <li style={{ marginBottom: 6 }}>
            Daily readiness check-ins: sleep quality, soreness level, energy and stress ratings
          </li>
          <li style={{ marginBottom: 6 }}>
            Workout performance data: exercises completed, weights used, repetitions, RPE ratings, and personal
            bests
          </li>
        </ul>

        <p style={{ marginBottom: 12 }}>
          <strong>Information collected automatically:</strong>
        </p>
        <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
          <li style={{ marginBottom: 6 }}>Device type and operating system</li>
          <li style={{ marginBottom: 6 }}>App usage patterns and feature interactions</li>
          <li style={{ marginBottom: 6 }}>Session timestamps and duration</li>
        </ul>

        <p style={{ marginBottom: 12 }}>
          <strong>Information from third parties:</strong>
        </p>
        <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
          <li style={{ marginBottom: 6 }}>
            If you sign in with Google, we receive your name and email address from Google in accordance with
            Google&apos;s privacy policy
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. How We Use Your Information">
        <p style={{ marginBottom: 12 }}>We use your information to:</p>
        <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
          <li style={{ marginBottom: 6 }}>Create and maintain your account</li>
          <li style={{ marginBottom: 6 }}>
            Generate personalised training programmes tailored to your goals, fitness level, and available
            equipment
          </li>
          <li style={{ marginBottom: 6 }}>
            Power Kwazi, our AI coaching assistant, to provide contextually relevant training guidance
          </li>
          <li style={{ marginBottom: 6 }}>Track your progress and update your programme as you advance</li>
          <li style={{ marginBottom: 6 }}>Process payments for your subscription via Paystack</li>
          <li style={{ marginBottom: 6 }}>Send you notifications related to your training (with your permission)</li>
          <li style={{ marginBottom: 6 }}>Improve GRYT&apos;s programme quality and user experience</li>
          <li style={{ marginBottom: 6 }}>Comply with our legal obligations</li>
        </ul>
      </LegalSection>

      <LegalSection heading="4. AI-Powered Features and Your Data">
        <p style={{ marginBottom: 12 }}>
          GRYT uses artificial intelligence to generate your training programme and to power the Kwazi coaching
          feature. Your personal health and fitness data is used as input to these systems to personalise your
          experience. We use Anthropic&apos;s Claude API to power Kwazi. Data sent to Anthropic is processed in
          accordance with Anthropic&apos;s privacy policy and data processing terms. We do not sell your personal
          data to Anthropic or any other third party for their own use.
        </p>
      </LegalSection>

      <LegalSection heading="5. Who We Share Your Data With">
        <p style={{ marginBottom: 12 }}>
          We share your data only with the following service providers, strictly for the purpose of delivering
          GRYT to you:
        </p>
        <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
          <li style={{ marginBottom: 6 }}>Supabase — database and authentication infrastructure</li>
          <li style={{ marginBottom: 6 }}>Vercel — application hosting</li>
          <li style={{ marginBottom: 6 }}>Anthropic — AI processing for programme generation and Kwazi coaching</li>
          <li style={{ marginBottom: 6 }}>Paystack — payment processing for subscriptions</li>
          <li style={{ marginBottom: 6 }}>Google — authentication (if you use Google Sign-In)</li>
        </ul>
        <p style={{ marginBottom: 12 }}>
          We do not sell, rent, or trade your personal information to any third party for marketing or advertising
          purposes.
        </p>
      </LegalSection>

      <LegalSection heading="6. Data Storage and Security">
        <p style={{ marginBottom: 12 }}>
          Your data is stored on servers provided by Supabase, which operates infrastructure in accordance with
          industry-standard security practices. We implement appropriate technical measures to protect your
          personal information against unauthorised access, loss, or misuse. No method of transmission or storage
          is 100% secure; if you have reason to believe your account has been compromised, contact us immediately
          at info@gryt.co.za.
        </p>
      </LegalSection>

      <LegalSection heading="7. Your Rights Under POPIA">
        <p style={{ marginBottom: 12 }}>
          Under the Protection of Personal Information Act 4 of 2013 (POPIA), you have the right to:
        </p>
        <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
          <li style={{ marginBottom: 6 }}>Know what personal information we hold about you</li>
          <li style={{ marginBottom: 6 }}>Request access to your personal information</li>
          <li style={{ marginBottom: 6 }}>Request correction of inaccurate information</li>
          <li style={{ marginBottom: 6 }}>
            Request deletion of your personal information (subject to our legal obligations to retain certain
            records)
          </li>
          <li style={{ marginBottom: 6 }}>Object to the processing of your personal information</li>
          <li style={{ marginBottom: 6 }}>
            Lodge a complaint with the Information Regulator of South Africa at www.inforegulator.org.za
          </li>
        </ul>
        <p style={{ marginBottom: 12 }}>
          To exercise any of these rights, contact us at info@gryt.co.za. We will respond within 30 days.
        </p>
      </LegalSection>

      <LegalSection heading="8. Data Retention">
        <p style={{ marginBottom: 12 }}>
          We retain your personal data for as long as your account is active. If you delete your account, we will
          delete your personal data within 30 days, except where we are required by law to retain certain records
          (such as payment records, which we retain for 5 years in accordance with South African tax law).
        </p>
      </LegalSection>

      <LegalSection heading="9. Children">
        <p style={{ marginBottom: 12 }}>
          GRYT is not intended for use by persons under the age of 18. We do not knowingly collect personal
          information from minors. If you believe a minor has created an account, contact us at info@gryt.co.za
          and we will delete the account promptly.
        </p>
      </LegalSection>

      <LegalSection heading="10. Changes to This Policy">
        <p style={{ marginBottom: 12 }}>
          We may update this policy from time to time. We will notify you of material changes by email or through
          the app. Your continued use of GRYT after a change takes effect constitutes acceptance of the updated
          policy.
        </p>
      </LegalSection>

      <LegalSection heading="11. Contact">
        <p style={{ marginBottom: 0 }}>Catalyst Digital Operations (Pty) Ltd</p>
        <p style={{ marginBottom: 0 }}>Rosewood Road, Broadacres, Fourways, 2021</p>
        <p style={{ marginBottom: 0 }}>info@gryt.co.za</p>
      </LegalSection>
    </LegalPage>
  )
}
