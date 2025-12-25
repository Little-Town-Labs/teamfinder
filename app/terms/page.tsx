import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - TeamFinder",
  description: "TeamFinder Terms of Service and usage agreement",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
          Terms of Service
        </h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          {/*
            TODO: Replace with GetTerms embed code after account setup

            Option 1 - Embed Code (Recommended):
            <div
              id="getterms-terms"
              dangerouslySetInnerHTML={{
                __html: `<!-- PASTE GETTERMS EMBED CODE HERE -->`
              }}
            />

            Option 2 - iframe:
            <iframe
              src="https://getterms.io/view/YOUR_SITE_ID/terms"
              style={{ width: '100%', minHeight: '800px', border: 'none' }}
              title="Terms of Service"
            />
          */}

          {/* Temporary placeholder content */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
            <h2 className="mb-4 text-xl font-semibold text-yellow-900 dark:text-yellow-100">
              Terms of Service - Coming Soon
            </h2>
            <p className="text-yellow-800 dark:text-yellow-200">
              This page will be updated with our complete Terms of Service once GetTerms.io account setup is complete.
            </p>
            <p className="mt-4 text-yellow-800 dark:text-yellow-200">
              By using TeamFinder, you agree to our terms and conditions for using the platform.
            </p>
            <div className="mt-6">
              <h3 className="mb-2 font-semibold text-yellow-900 dark:text-yellow-100">
                Key Points:
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-yellow-800 dark:text-yellow-200">
                <li>You must be 18+ to use TeamFinder (aligned with USBC membership requirements)</li>
                <li>You are responsible for the accuracy of your bowling profile information</li>
                <li>You agree to use the platform respectfully and not engage in harassment or spam</li>
                <li>TeamFinder reserves the right to moderate content and remove users who violate terms</li>
                <li>We may update these terms with notice to users</li>
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
