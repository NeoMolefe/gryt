import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface FAQItem {
  question: string
  answer: string
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How does the 7-day free trial work?',
    answer:
      'You get full Premium access for 7 days. No charge until the trial ends, and you can cancel anytime before then.',
  },
  {
    question: 'What happens after the first 100 founding members?',
    answer:
      'New users pay the standard rate of R99/month or R890/year. Founding members keep their discounted rate for life.',
  },
  {
    question: 'Can I train with just bodyweight or home equipment?',
    answer:
      'Yes. During onboarding you tell GRYT what equipment you have, and your programme is built around it — full gym, home gym, or bodyweight only.',
  },
  {
    question: 'How many messages can I send Kwazi per day?',
    answer:
      'Premium includes 10 Kwazi messages per day, resetting at midnight.',
  },
  {
    question: 'Can I change my goals or equipment later?',
    answer:
      'Yes. You can regenerate your plan anytime from Settings if your goals, equipment, or availability change.',
  },
]

function FAQAccordionItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FAQItem
  index: number
  isOpen: boolean
  onToggle: () => void
}) {
  const panelId = `faq-panel-${index}`
  const buttonId = `faq-button-${index}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      style={{
        background: 'var(--color-card)',
        border: `1px solid ${isOpen ? 'var(--color-border)' : 'var(--color-border)'}`,
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
        boxShadow: isOpen ? '0px 4px 16px var(--color-shadow)' : 'none',
      }}
    >
      <button
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '24px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20,
          textAlign: 'left',
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
            flex: 1,
            lineHeight: 1.4,
          }}
        >
          {item.question}
        </span>
        <ChevronDown
          size={18}
          strokeWidth={1.5}
          aria-hidden="true"
          style={{
            color: 'var(--color-text-secondary)',
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}
        />
      </button>

      {/* max-height accordion — no display:none */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        style={{
          maxHeight: isOpen ? 300 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.35s ease',
        }}
      >
        <p
          style={{
            fontSize: 16,
            color: 'var(--color-text-secondary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.5,
            margin: 0,
            padding: '0 24px 24px',
          }}
        >
          {item.answer}
        </p>
      </div>
    </motion.div>
  )
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <section style={{ padding: '100px 0', background: 'var(--color-bg)' }}>
      <div
        className="mkt-inner faq-layout"
        style={{
          display: 'flex',
          gap: 80,
          alignItems: 'flex-start',
        }}
      >
        {/* Left column: heading */}
        <div style={{ flex: '0 0 36%' }}>
          <div style={{ marginBottom: 16 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 40,
                background: 'var(--color-card)',
                boxShadow: '0px 4px 12px var(--color-shadow)',
                fontSize: 14,
                letterSpacing: '-0.02em',
                color: 'var(--color-text-secondary)',
              }}
            >
              FAQ
            </span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(34px, 3.5vw, 48px)',
              fontWeight: 500,
              letterSpacing: '-0.05em',
              lineHeight: 1.2,
              color: 'var(--color-text-primary)',
              margin: '0 0 16px',
            }}
          >
            Questions, answered.
          </h2>

          <p
            style={{
              fontSize: 16,
              color: 'var(--color-text-secondary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.4,
              margin: 0,
              maxWidth: '40ch',
            }}
          >
            Everything you need to know before you start.
          </p>
        </div>

        {/* Right column: accordion */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {FAQ_ITEMS.map((item, i) => (
            <FAQAccordionItem
              key={item.question}
              item={item}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
