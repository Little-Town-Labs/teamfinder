import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy - TeamFinder",
  description: "TeamFinder Cookie Policy and cookie usage information",
};

export default function CookiePolicyPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
          Cookie Policy
        </h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          {/*
            TODO: Replace with GetTerms embed code after account setup

            Option 1 - Embed Code (Recommended):
            <div
              id="getterms-cookies"
              dangerouslySetInnerHTML={{
                __html: `<!-- PASTE GETTERMS EMBED CODE HERE -->`
              }}
            />

            Option 2 - iframe:
            <iframe
              src="https://getterms.io/view/YOUR_SITE_ID/cookies"
              style={{ width: '100%', minHeight: '800px', border: 'none' }}
              title="Cookie Policy"
            />
          */}

          {/* Temporary placeholder content */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
            <h2 className="mb-4 text-xl font-semibold text-yellow-900 dark:text-yellow-100">
              Cookie Policy - Coming Soon
            </h2>
            <p className="text-yellow-800 dark:text-yellow-200">
              This page will be updated with our complete Cookie Policy once GetTerms.io account setup is complete.
            </p>
            <p className="mt-4 text-yellow-800 dark:text-yellow-200">
              TeamFinder uses cookies to enhance your browsing experience and provide essential functionality.
            </p>
            <div className="mt-6">
              <h3 className="mb-2 font-semibold text-yellow-900 dark:text-yellow-100">
                Cookie Categories:
              </h3>
              <ul className="list-disc space-y-2 pl-5 text-yellow-800 dark:text-yellow-200">
                <li>
                  <strong>Strictly Necessary:</strong> Authentication cookies from Clerk (required for login)
                </li>
                <li>
                  <strong>Functional:</strong> User preferences and settings
                </li>
                <li>
                  <strong>Analytics:</strong> Usage statistics (if Google Analytics is implemented)
                </li>
              </ul>
            </div>
            <p className="mt-6 text-yellow-800 dark:text-yellow-200">
              You can manage your cookie preferences through the cookie consent banner that appears when you first visit the site.
            </p>
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
