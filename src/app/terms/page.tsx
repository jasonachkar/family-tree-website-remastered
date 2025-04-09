"use client"

import { motion } from "framer-motion"

export default function TermsOfServicePage() {
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
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Terms of Service</h1>
            <p className="mt-4 text-gray-500 md:text-xl">Last updated: January 1, 2024</p>
          </motion.div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto prose prose-blue">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h2>1. Introduction</h2>
              <p>
                Welcome to FamilyTree. These Terms of Service ("Terms") govern your access to and use of the FamilyTree
                website and services, including any content, functionality, and services offered on or through the
                website (the "Service").
              </p>
              <p>
                Please read these Terms carefully before you start to use the Service. By using the Service, you accept
                and agree to be bound and abide by these Terms. If you do not agree to these Terms, you must not access
                or use the Service.
              </p>

              <h2>2. Eligibility</h2>
              <p>
                The Service is offered and available to users who are 13 years of age or older. By using this Service,
                you represent and warrant that you meet the eligibility requirements. If you do not meet these
                requirements, you must not access or use the Service.
              </p>

              <h2>3. Account Registration</h2>
              <p>
                To access certain features of the Service, you may be required to register for an account. When you
                register, you agree to provide accurate, current, and complete information about yourself as prompted by
                the registration form and to update such information to keep it accurate, current, and complete.
              </p>
              <p>
                You are responsible for safeguarding the password that you use to access the Service and for any
                activities or actions under your password. You agree not to disclose your password to any third party.
                You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your
                account.
              </p>

              <h2>4. Subscription and Payment</h2>
              <p>
                Some aspects of the Service may be provided for a fee. You will be required to select a payment plan and
                provide accurate information regarding your credit card or other payment instrument. You represent and
                warrant that you have the legal right to use any payment method you provide.
              </p>
              <p>
                By submitting payment information, you authorize us to charge your payment instrument for the type of
                subscription you have selected. If we are unable to process your payment, we reserve the right to
                suspend or terminate your access to the Service.
              </p>
              <p>
                Subscriptions automatically renew unless canceled at least 24 hours before the end of the current
                period. You can cancel your subscription at any time in your account settings.
              </p>

              <h2>5. User Content</h2>
              <p>
                The Service allows you to create, upload, post, send, receive, store, share, and otherwise make
                available certain information, text, graphics, videos, or other material ("User Content"). You are
                solely responsible for your User Content and the consequences of posting or publishing it.
              </p>
              <p>
                By providing User Content, you grant us a worldwide, non-exclusive, royalty-free license to use,
                reproduce, modify, adapt, publish, translate, distribute, and display such content in connection with
                providing the Service.
              </p>
              <p>You represent and warrant that:</p>
              <ul>
                <li>You own or have the necessary rights to use and authorize us to use your User Content</li>
                <li>The User Content does not infringe upon the intellectual property rights of any third party</li>
                <li>The User Content does not violate the privacy rights of any third party</li>
                <li>
                  The User Content does not contain any material that is defamatory, obscene, indecent, abusive,
                  offensive, harassing, violent, hateful, inflammatory, or otherwise objectionable
                </li>
              </ul>

              <h2>6. Prohibited Uses</h2>
              <p>
                You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to
                use the Service:
              </p>
              <ul>
                <li>
                  In any way that violates any applicable federal, state, local, or international law or regulation
                </li>
                <li>
                  To transmit, or procure the sending of, any advertising or promotional material, including any "junk
                  mail," "chain letter," "spam," or any other similar solicitation
                </li>
                <li>
                  To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other
                  person or entity
                </li>
                <li>
                  To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or
                  which may harm the Company or users of the Service
                </li>
              </ul>

              <h2>7. Intellectual Property Rights</h2>
              <p>
                The Service and its entire contents, features, and functionality (including but not limited to all
                information, software, text, displays, images, video, and audio, and the design, selection, and
                arrangement thereof) are owned by the Company, its licensors, or other providers of such material and
                are protected by United States and international copyright, trademark, patent, trade secret, and other
                intellectual property or proprietary rights laws.
              </p>

              <h2>8. Termination</h2>
              <p>
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice
                or liability, under our sole discretion, for any reason whatsoever and without limitation, including but
                not limited to a breach of the Terms.
              </p>
              <p>
                If you wish to terminate your account, you may simply discontinue using the Service or contact us to
                request account deletion.
              </p>

              <h2>9. Limitation of Liability</h2>
              <p>
                In no event will the Company, its affiliates, or their licensors, service providers, employees, agents,
                officers, or directors be liable for damages of any kind, under any legal theory, arising out of or in
                connection with your use, or inability to use, the Service, including any direct, indirect, special,
                incidental, consequential, or punitive damages.
              </p>

              <h2>10. Changes to Terms</h2>
              <p>
                We may revise and update these Terms from time to time in our sole discretion. All changes are effective
                immediately when we post them. Your continued use of the Service following the posting of revised Terms
                means that you accept and agree to the changes.
              </p>

              <h2>11. Governing Law</h2>
              <p>
                These Terms and your use of the Service shall be governed by and construed in accordance with the laws
                of the United States and the State of Massachusetts, without regard to its conflict of law provisions.
              </p>

              <h2>12. Contact Information</h2>
              <p>Questions about the Terms should be sent to us at:</p>
              <p>
                FamilyTree
                <br />
                123 Family Tree Lane
                <br />
                Boston, MA 02110
                <br />
                Email: terms@familytree.com
                <br />
                Phone: +1 (555) 123-4567
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
