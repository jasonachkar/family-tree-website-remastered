"use client"

import { motion } from "framer-motion"

export default function PrivacyPolicyPage() {
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
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Privacy Policy</h1>
            <p className="mt-4 text-gray-500 md:text-xl">Last updated: January 1, 2024</p>
          </motion.div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto prose prose-blue">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h2>Introduction</h2>
              <p>
                At FamilyTree, we take your privacy seriously. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our website and services. Please read this privacy
                policy carefully. If you do not agree with the terms of this privacy policy, please do not access the
                site.
              </p>

              <h2>Information We Collect</h2>
              <p>
                We collect information that you voluntarily provide to us when you register on the website, express an
                interest in obtaining information about us or our products and services, or otherwise contact us.
              </p>
              <p>
                The personal information that we collect depends on the context of your interactions with us and the
                website, the choices you make, and the products and features you use. The personal information we
                collect may include the following:
              </p>
              <ul>
                <li>Name and contact data (such as email address, phone number)</li>
                <li>Credentials (such as passwords and security questions)</li>
                <li>Payment data (for subscription services)</li>
                <li>Family history information that you choose to provide</li>
                <li>Photos and media that you upload</li>
              </ul>

              <h2>How We Use Your Information</h2>
              <p>
                We use personal information collected via our website for a variety of business purposes described
                below. We process your personal information for these purposes in reliance on our legitimate business
                interests, in order to enter into or perform a contract with you, with your consent, and/or for
                compliance with our legal obligations. We use the information we collect or receive:
              </p>
              <ul>
                <li>To facilitate account creation and login process</li>
                <li>To provide and maintain our services</li>
                <li>To process your subscription payments</li>
                <li>To respond to user inquiries and offer support</li>
                <li>To send administrative information and updates</li>
                <li>To improve our website and services</li>
                <li>To enforce our terms, conditions, and policies</li>
              </ul>

              <h2>Disclosure of Your Information</h2>
              <p>We may share information in the following situations:</p>
              <ul>
                <li>
                  <strong>With your consent:</strong> We may disclose your personal information for any purpose with
                  your consent.
                </li>
                <li>
                  <strong>With family members:</strong> If you choose to share your family tree with specific
                  individuals, they will have access to the information you've included.
                </li>
                <li>
                  <strong>With service providers:</strong> We may share your information with service providers who
                  perform services for us or on our behalf.
                </li>
                <li>
                  <strong>For business transfers:</strong> We may share or transfer your information in connection with,
                  or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a
                  portion of our business to another company.
                </li>
                <li>
                  <strong>With affiliates:</strong> We may share your information with our affiliates, in which case we
                  will require those affiliates to honor this privacy policy.
                </li>
                <li>
                  <strong>To comply with the law:</strong> We may disclose your information where we are legally
                  required to do so.
                </li>
              </ul>

              <h2>Security of Your Information</h2>
              <p>
                We use administrative, technical, and physical security measures to help protect your personal
                information. While we have taken reasonable steps to secure the personal information you provide to us,
                please be aware that despite our efforts, no security measures are perfect or impenetrable, and no
                method of data transmission can be guaranteed against any interception or other type of misuse.
              </p>

              <h2>Your Privacy Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, such as:
              </p>
              <ul>
                <li>The right to access personal information we hold about you</li>
                <li>The right to request correction of your personal information</li>
                <li>The right to request deletion of your personal information</li>
                <li>The right to withdraw consent where we rely on consent to process your information</li>
                <li>The right to object to processing of your personal information</li>
                <li>The right to data portability</li>
              </ul>
              <p>
                To exercise these rights, please contact us using the information provided in the "Contact Us" section
                below.
              </p>

              <h2>Children's Privacy</h2>
              <p>
                Our website is not intended for children under 13 years of age. We do not knowingly collect personal
                information from children under 13. If you are a parent or guardian and you are aware that your child
                has provided us with personal information, please contact us so that we can take steps to remove that
                information from our servers.
              </p>

              <h2>Changes to This Privacy Policy</h2>
              <p>
                We may update our privacy policy from time to time. We will notify you of any changes by posting the new
                privacy policy on this page and updating the "Last Updated" date. You are advised to review this privacy
                policy periodically for any changes.
              </p>

              <h2>Contact Us</h2>
              <p>If you have questions or comments about this privacy policy, please contact us at:</p>
              <p>
                FamilyTree
                <br />
                123 Family Tree Lane
                <br />
                Boston, MA 02110
                <br />
                Email: privacy@familytree.com
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
