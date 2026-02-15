import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About - ScopedIn',
  description:
    'ScopedIn helps you track task estimates vs. actual time so you can get better at scoping work.',
};

const features = [
  {
    title: 'Time Estimation Tracking',
    description:
      'Log how long you think a task will take, then record the actual time. Over time, see exactly where your estimates go wrong.',
  },
  {
    title: 'AI-Powered Insights',
    description:
      'Get personalized analysis of your estimation patterns powered by Google Gemini. Discover blind spots you never knew you had.',
  },
  {
    title: 'Analytics & Accuracy Trends',
    description:
      'Visual charts that track your estimation accuracy over time. Watch yourself improve week by week.',
  },
  {
    title: 'Projects & Tags',
    description:
      'Organize tasks by project and tag. See which types of work you estimate well — and which ones trip you up.',
  },
];

const steps = [
  {
    number: '1',
    title: 'Create Tasks',
    description: 'Add tasks with your best time estimate before you start working.',
  },
  {
    number: '2',
    title: 'Complete & Log',
    description: 'When you finish, record how long it actually took.',
  },
  {
    number: '3',
    title: 'Get Insights',
    description: 'Review your accuracy trends and AI-generated insights to improve over time.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-text-secondary">
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Scoped<span className="text-primary">In</span>
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-8">
          The task manager that helps you get better at estimating how long things actually take.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-white hover:bg-primary-light transition-colors">
          Get Started
        </Link>
      </section>

      {/* What is ScopedIn */}
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="text-2xl font-semibold text-white mb-4 text-center">What is ScopedIn?</h2>
        <p className="text-center leading-relaxed">
          Most people are terrible at estimating how long tasks will take — and they never get
          better because they never track it. ScopedIn changes that. It&apos;s a task management app
          that tracks your estimated time against actual time, giving you data-driven feedback and
          AI-powered insights so you can finally learn to scope work accurately.
        </p>
      </section>

      {/* Key Features */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <h2 className="text-2xl font-semibold text-white mb-8 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl bg-background-secondary p-6 border border-border">
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="text-2xl font-semibold text-white mb-8 text-center">How It Works</h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center">
          {steps.map((step) => (
            <div key={step.number} className="flex-1 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="mx-auto max-w-3xl px-6 pb-20 text-center">
        <h2 className="text-2xl font-semibold text-white mb-4">Ready to improve your estimates?</h2>
        <p className="mb-8">Start tracking your task accuracy today — it&apos;s free.</p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-white hover:bg-primary-light transition-colors">
          Sign Up Free
        </Link>
      </section>
    </div>
  );
}
