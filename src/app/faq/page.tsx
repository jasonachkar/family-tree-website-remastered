"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

interface FAQItem {
  question: string
  answer: string
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const faqs: FAQItem[] = [
    {
      question: "How do I start building my family tree?",
      answer:
        "After signing up, you can create a new family tree from your dashboard. Start by adding yourself and immediate family members, then expand to include extended family. Our intuitive interface makes it easy to add people and establish relationships.",
    },
    {
      question: "Can I invite family members to collaborate on my tree?",
      answer:
        "Yes! With our Premium and Family plans, you can invite relatives to view and contribute to your family tree. This collaborative approach helps create a more comprehensive family history with input from multiple family members.",
    },
    {
      question: "How secure is my family data?",
      answer:
        "We take data security seriously. All your family information is encrypted and stored securely. We never share your data with third parties, and you have complete control over privacy settings for your family tree.",
    },
    {
      question: "Can I export my family tree data?",
      answer:
        "Yes, Premium and Family plan subscribers can export their family tree data in multiple formats for backup or sharing purposes. This ensures you always have access to your valuable family history.",
    },
    {
      question: "What's the difference between the subscription plans?",
      answer:
        "Our Free plan allows you to create one family tree with up to 50 members. The Premium plan increases this to 5 trees and 500 members, plus adds features like data export and family stories. The Family plan offers unlimited trees and members, plus collaborative editing features.",
    },
    {
      question: "How do I add photos to my family tree?",
      answer:
        "When editing a family member's profile, you can upload photos directly from your device. These photos will be displayed on their profile card in the family tree view, helping to bring your family history to life.",
    },
    {
      question: "Can I cancel my subscription?",
      answer:
        "Yes, you can cancel your subscription at any time. You'll continue to have access to your plan features until the end of your current billing period. After that, your account will revert to the Free plan limitations.",
    },
    {
      question: "Is there a mobile app available?",
      answer:
        "Currently, FamilyTree is optimized for web browsers on both desktop and mobile devices. A dedicated mobile app is in development and will be released soon to provide an even better experience on smartphones and tablets.",
    },
    {
      question: "How far back can I trace my family history?",
      answer:
        "There's no limit to how far back you can trace your family history on FamilyTree. The platform supports multiple generations, allowing you to document your ancestry as far back as your research can take you.",
    },
    {
      question: "What if I need help using the platform?",
      answer:
        "We offer comprehensive documentation and tutorials to help you get the most out of FamilyTree. Premium and Family plan subscribers also have access to priority support for more personalized assistance.",
    },
  ]

  return (
    <div className="min-h-screen">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Frequently Asked Questions</h1>
            <p className="mt-4 text-gray-500 md:text-xl">
              Find answers to common questions about FamilyTree and how to make the most of our platform.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="flex justify-between items-center w-full p-4 text-left bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-500 transition-transform ${
                        openIndex === index ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">Still have questions?</h2>
            <p className="mt-4 text-gray-500">
              If you couldn't find the answer you were looking for, please reach out to our support team.
            </p>
            <div className="mt-8">
              <a
                href="/contact"
                className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
