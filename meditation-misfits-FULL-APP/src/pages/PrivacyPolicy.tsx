import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-white hover:text-purple-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Privacy Policy
        </h1>

        <p className="text-gray-300 mb-8 text-center">
          Last Updated: November 24, 2025
        </p>

        <div className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-300">Introduction</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                Welcome to Freqyn. We are committed to protecting your privacy and ensuring transparency about how we collect, use, and safeguard your personal information. This Privacy Policy explains our practices regarding data collection and your rights as a user.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-300">Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Account Information</h3>
                <p>When you create an account, we collect:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Email address</li>
                  <li>Username or display name</li>
                  <li>Password (encrypted and never stored in plain text)</li>
                  <li>Profile information (bio, avatar, preferences)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">OAuth Authentication Data</h3>
                <p>When you sign in with Google, Facebook, or GitHub, we collect:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Your name from the provider</li>
                  <li>Email address associated with your social account</li>
                  <li>Profile picture URL</li>
                  <li>Unique provider ID (for authentication purposes only)</li>
                </ul>
                <p className="mt-2">
                  We do not access or store your social media passwords. OAuth authentication is handled securely through the respective provider's API.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Meditation Session Data</h3>
                <p>To provide personalized experiences and track your progress, we collect:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Session duration and completion status</li>
                  <li>Meditation types and frequencies used</li>
                  <li>Mood and energy levels (if provided)</li>
                  <li>Journal entries and reflections</li>
                  <li>Favorites and saved collections</li>
                  <li>Custom meditation preferences</li>
                  <li>Streak and achievement data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Email Communications</h3>
                <p>We collect email addresses for:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Account verification and security</li>
                  <li>Daily quest reminders (if enabled)</li>
                  <li>Newsletter and updates (with your consent)</li>
                  <li>Important service announcements</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-300">How We Use Your Data</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>We use your information to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Provide and improve our meditation services</li>
                <li>Personalize your experience with AI recommendations</li>
                <li>Track your progress and achievements</li>
                <li>Send notifications and reminders (with your permission)</li>
                <li>Communicate important updates about our service</li>
                <li>Ensure security and prevent fraud</li>
                <li>Analyze usage patterns to improve features</li>
                <li>Provide customer support</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-300">Data Storage and Security</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                Your data is stored securely using Supabase, a trusted database platform with enterprise-grade security. We implement:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Encryption in transit (HTTPS/TLS)</li>
                <li>Encryption at rest for sensitive data</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Secure password hashing (bcrypt)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-300">Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>We use the following third-party services:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Supabase:</strong> Database and authentication</li>
                <li><strong>Google OAuth:</strong> Social sign-in</li>
                <li><strong>Facebook OAuth:</strong> Social sign-in</li>
                <li><strong>GitHub OAuth:</strong> Social sign-in</li>
                <li><strong>Constant Contact:</strong> Email marketing (optional)</li>
                <li><strong>OpenAI:</strong> AI-powered meditation generation</li>
              </ul>
              <p className="mt-2">
                These services have their own privacy policies and data handling practices. We recommend reviewing their policies.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-300">Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct your information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Export:</strong> Download your meditation data and journal entries</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing emails</li>
                <li><strong>Portability:</strong> Transfer your data to another service</li>
              </ul>
              <p className="mt-2">
                To exercise these rights, please contact us through your account settings or email support.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-300">Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                We use cookies and local storage to maintain your session, remember preferences, and improve your experience. You can control cookies through your browser settings.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-300">Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                We retain your data for as long as your account is active. If you delete your account, we will remove your personal data within 30 days, except where required by law.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-300">Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                Our service is not intended for children under 13. We do not knowingly collect data from children. If you believe a child has provided us with personal information, please contact us.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-300">Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through the app. Continued use of our service after changes constitutes acceptance.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-300">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                If you have questions about this Privacy Policy or our data practices, please contact us through your account settings or reach out to our support team.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
