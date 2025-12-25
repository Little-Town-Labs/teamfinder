import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - TeamFinder",
  description: "TeamFinder Privacy Policy and data handling practices",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
          Privacy Policy
        </h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          {/*
            TODO: Replace with GetTerms embed code after account setup

            Option 1 - Embed Code (Recommended):
            <div
              id="getterms-privacy-policy"
              dangerouslySetInnerHTML={{
                __html: `<!-- PASTE GETTERMS EMBED CODE HERE -->`
              }}
            />

            Option 2 - iframe:
            <iframe
              src="https://getterms.io/view/YOUR_SITE_ID/privacy"
              style={{ width: '100%', minHeight: '800px', border: 'none' }}
              title="Privacy Policy"
            />
          */}

          {/* Temporary placeholder content */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
            <h2 className="mb-4 text-xl font-semibold text-yellow-900 dark:text-yellow-100">
              Privacy Policy - Coming Soon
            </h2>
            <p className="text-yellow-800 dark:text-yellow-200">
              This page will be updated with our complete Privacy Policy once GetTerms.io account setup is complete.
            </p>
            <p className="mt-4 text-yellow-800 dark:text-yellow-200">
              TeamFinder is committed to protecting your privacy and complying with GDPR, CCPA, and other data protection regulations.
            </p>
            <div className="mt-6">
              <h3 className="mb-2 font-semibold text-yellow-900 dark:text-yellow-100">
                What we collect:
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-yellow-800 dark:text-yellow-200">
                <li>Personal information (name, email) via Clerk authentication</li>
                <li>Bowling-specific data (USBC ID, averages, preferences)</li>
                <li>Team and activity data</li>
                <li>Technical data (cookies, IP addresses for audit logs)</li>
              </ul>
            </div>
            <div className="mt-6">
              <h3 className="mb-2 font-semibold text-yellow-900 dark:text-yellow-100">
                Your rights:
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-yellow-800 dark:text-yellow-200">
                <li>Access your data</li>
                <li>Export your data</li>
                <li>Delete your account</li>
                <li>Opt-out of marketing emails</li>
              </ul>
            </div>
            <p className="mt-6 text-sm text-yellow-700 dark:text-yellow-300">
              Contact: privacy@littletownlabs.site
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
