import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - ScopedIn',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-text-secondary">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-text-muted mb-8">Last updated: February 14, 2026</p>

        <div className="space-y-6 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
            <p>
              ScopedIn (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is a task management
              application designed to help you improve your time estimation skills. This Privacy
              Policy explains how we collect, use, and protect your information when you use our
              mobile application and web application (collectively, the &quot;Service&quot;).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
            <h3 className="text-lg font-medium text-white mb-2">Account Information</h3>
            <p className="mb-3">
              When you create an account, we collect your email address. If you sign in with a
              third-party provider (Google or GitHub), we receive your email address and basic
              profile information from that provider.
            </p>
            <h3 className="text-lg font-medium text-white mb-2">Task Data</h3>
            <p className="mb-3">
              We store the tasks you create, including task names, descriptions, categories,
              priority levels, estimated times, and actual completion times. This data is essential
              to providing the core functionality of the Service.
            </p>
            <h3 className="text-lg font-medium text-white mb-2">AI Analysis Data</h3>
            <p>
              When you use the AI Insights feature, your task completion data (task names,
              categories, estimated vs. actual times) is sent to Google Gemini for analysis. The
              generated insights are cached in our database to reduce repeated API calls.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain the Service</li>
              <li>To authenticate your identity and secure your account</li>
              <li>To generate AI-powered productivity insights from your task data</li>
              <li>To display accuracy trends and performance analytics</li>
              <li>To improve and develop new features for the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using Supabase, which provides encrypted database storage
              and row-level security policies. Each user can only access their own data. We use
              industry-standard security measures to protect your information, including HTTPS
              encryption for all data in transit and secure authentication tokens.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Third-Party Services</h2>
            <p className="mb-3">We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-white">Supabase</strong> — Authentication and database
                hosting
              </li>
              <li>
                <strong className="text-white">Google Gemini</strong> — AI-powered task analysis
                (task names, categories, and timing data are sent for analysis)
              </li>
              <li>
                <strong className="text-white">Expo / EAS</strong> — Mobile app build and
                distribution services
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. You can delete individual
              tasks at any time. You can also permanently delete your entire account and all
              associated data through the Settings page in the app or at{' '}
              <a href="/delete-account" className="text-primary hover:underline">
                scopedin.app/delete-account
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Access your personal data (visible in your account and task list)</li>
              <li>Delete individual tasks from the Service</li>
              <li>Delete your account and all associated data at any time</li>
              <li>Request information about how your data is processed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Children&apos;s Privacy</h2>
            <p>
              The Service is not intended for children under 13 years of age. We do not knowingly
              collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the &quot;Last
              updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or your data, please contact us at{' '}
              <a href="mailto:support@scopedin.app" className="text-primary hover:underline">
                support@scopedin.app
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
