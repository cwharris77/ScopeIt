import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - ScopeIt',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-text-secondary">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-text-muted mb-8">Last updated: February 14, 2026</p>

        <div className="space-y-6 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using ScopeIt (&quot;the Service&quot;), you agree to be bound by
              these Terms of Service. If you do not agree to these terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
            <p>
              ScopeIt is a task management application that helps users track their tasks, compare
              estimated vs. actual completion times, and improve their time estimation accuracy
              through analytics and AI-powered insights. The Service is available as a mobile
              application (iOS and Android) and a web application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. User Accounts</h2>
            <p className="mb-3">
              You must create an account to use the Service. You are responsible for maintaining
              the confidentiality of your account credentials and for all activities that occur
              under your account.
            </p>
            <p>
              You may sign up using an email address and password, or through a third-party
              authentication provider (Google or GitHub). You agree to provide accurate information
              when creating your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to the Service or its systems</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Upload malicious content or attempt to exploit the Service</li>
              <li>Create multiple accounts to circumvent limitations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Your Data</h2>
            <p>
              You retain ownership of the data you create in the Service (tasks, descriptions,
              timing data). We use your data solely to provide the Service and generate insights as
              described in our{' '}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
              . You can export or delete your data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. AI Features</h2>
            <p>
              The Service includes AI-powered analysis features provided by Google Gemini. AI
              insights are generated based on your task data and are provided for informational
              purposes only. We make no guarantees about the accuracy or completeness of AI-generated
              insights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Account Deletion</h2>
            <p>
              You may delete your account at any time through the Settings page in the app or at{' '}
              <a href="/delete-account" className="text-primary hover:underline">
                scopeit.app/delete-account
              </a>
              . Account deletion is permanent and will remove all your data, including tasks,
              analytics, and AI analysis history.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Service Availability</h2>
            <p>
              We strive to keep the Service available at all times but do not guarantee
              uninterrupted access. The Service may be temporarily unavailable due to maintenance,
              updates, or circumstances beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              9. Disclaimer of Warranties
            </h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without
              warranties of any kind, either express or implied, including but not limited to
              warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, ScopeIt shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, or any loss of data, use, or
              profits, arising out of or related to your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify you of
              significant changes by posting the updated terms on this page. Continued use of the
              Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Contact Us</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:support@scopeit.app" className="text-primary hover:underline">
                support@scopeit.app
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
