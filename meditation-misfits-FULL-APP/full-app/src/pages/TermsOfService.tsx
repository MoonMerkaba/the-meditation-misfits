import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-gray-300 mb-8">Last Updated: November 24, 2025</p>

        <div className="space-y-8 text-gray-200">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing or using Freqyn ("the Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the Service.
            </p>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the Service after 
              changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">2. User Responsibilities</h2>
            <p className="mb-4">As a user of Freqyn, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
              <li>Use the Service in compliance with all applicable laws</li>
              <li>Not share your account with others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">3. Acceptable Use Policy</h2>
            <p className="mb-4">You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Post spam, malware, or malicious content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Reverse engineer or copy any part of the Service</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Impersonate others or misrepresent your affiliation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">4. Content Guidelines</h2>
            <p className="mb-4">User-generated content must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be respectful and appropriate for all audiences</li>
              <li>Not contain hate speech, violence, or explicit material</li>
              <li>Not infringe on intellectual property rights</li>
              <li>Not contain personal information of others</li>
              <li>Comply with community standards</li>
            </ul>
            <p className="mt-4">
              We reserve the right to remove any content that violates these guidelines and may 
              suspend or terminate accounts of repeat offenders.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">5. Intellectual Property Rights</h2>
            <p className="mb-4">
              All content, features, and functionality of Freqyn, including but not limited to audio files, 
              text, graphics, logos, and software, are owned by Freqyn and protected by copyright, trademark, 
              and other intellectual property laws.
            </p>
            <p className="mb-4">
              You retain ownership of content you create, but grant us a worldwide, non-exclusive, royalty-free 
              license to use, display, and distribute your content within the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">6. Subscription and Payment</h2>
            <p className="mb-4">
              Premium features require a paid subscription. By subscribing, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pay all fees associated with your subscription plan</li>
              <li>Automatic renewal unless cancelled before the renewal date</li>
              <li>No refunds for partial subscription periods</li>
              <li>Price changes with 30 days notice</li>
            </ul>
            <p className="mt-4">
              You may cancel your subscription at any time. Access to premium features will continue 
              until the end of your current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">7. Medical Disclaimer</h2>
            <p className="mb-4 font-semibold text-yellow-300">
              IMPORTANT: Freqyn is not a medical device or healthcare service.
            </p>
            <p className="mb-4">
              Our meditation, frequency, and wellness content is for informational and relaxation purposes only. 
              It is not intended to diagnose, treat, cure, or prevent any disease or medical condition.
            </p>
            <p className="mb-4">
              Always consult with a qualified healthcare professional before:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Starting any new wellness routine</li>
              <li>Making changes to existing treatments</li>
              <li>If you have any medical conditions</li>
              <li>If you are pregnant or nursing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">8. Limitation of Liability</h2>
            <p className="mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, FREQYN SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
            </p>
            <p className="mb-4">
              Our total liability shall not exceed the amount you paid for the Service in the 12 months 
              preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">9. Warranty Disclaimer</h2>
            <p className="mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, 
              FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
            <p>
              We do not guarantee that the Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">10. Termination</h2>
            <p className="mb-4">
              We may suspend or terminate your access to the Service at any time, with or without cause, 
              with or without notice, for any reason including violation of these Terms.
            </p>
            <p>
              Upon termination, your right to use the Service will immediately cease. You may also 
              terminate your account at any time through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">11. Governing Law</h2>
            <p className="mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
              in which Freqyn operates, without regard to conflict of law principles.
            </p>
            <p>
              Any disputes shall be resolved through binding arbitration in accordance with applicable 
              arbitration rules.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">12. Contact Information</h2>
            <p className="mb-4">
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <p className="font-semibold">Email: legal@freqyn.com</p>
            <p className="font-semibold">Address: [Your Business Address]</p>
          </section>

          <section className="border-t border-gray-700 pt-6">
            <p className="text-sm text-gray-400">
              By using Freqyn, you acknowledge that you have read, understood, and agree to be bound by 
              these Terms of Service and our Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
