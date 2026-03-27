export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-[#333]">
      <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: March 27, 2026</p>

      <div className="prose prose-slate max-w-none space-y-10 text-[15px] leading-relaxed">

        {/* INTRO */}
        <section>
          <p>
            This Privacy Policy describes how <strong>Ozigi Corp</strong> (&ldquo;Ozigi,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
            collects, uses, stores, and shares your personal information when you use our website at{" "}
            <a href="https://www.ozigi.app" className="text-blue-600 underline">https://www.ozigi.app</a>{" "}
            and our agentic social media management application (collectively, the &ldquo;Services&rdquo;).
          </p>
          <p className="mt-3">
            If you have questions or concerns about this policy, please contact us at{" "}
            <a href="mailto:hello@ozigi.app" className="text-blue-600 underline">hello@ozigi.app</a>.
          </p>
        </section>

        {/* TABLE OF CONTENTS */}
        <section>
          <h2 className="text-xl font-bold uppercase tracking-tight mb-3">Table of Contents</h2>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li><a href="#section-1" className="underline">What Information Do We Collect?</a></li>
            <li><a href="#section-2" className="underline">Google User Data — Specific Disclosures</a></li>
            <li><a href="#section-3" className="underline">How Do We Use Your Information?</a></li>
            <li><a href="#section-4" className="underline">When and With Whom Do We Share Your Information?</a></li>
            <li><a href="#section-5" className="underline">Cookies and Tracking Technologies</a></li>
            <li><a href="#section-6" className="underline">Artificial Intelligence Features</a></li>
            <li><a href="#section-7" className="underline">Social Logins</a></li>
            <li><a href="#section-8" className="underline">How Long Do We Keep Your Information?</a></li>
            <li><a href="#section-9" className="underline">How Do We Keep Your Information Safe?</a></li>
            <li><a href="#section-10" className="underline">Your Privacy Rights</a></li>
            <li><a href="#section-11" className="underline">Do-Not-Track Features</a></li>
            <li><a href="#section-12" className="underline">United States Residents — Specific Rights</a></li>
            <li><a href="#section-13" className="underline">Other Regions — Specific Rights</a></li>
            <li><a href="#section-14" className="underline">Updates to This Policy</a></li>
            <li><a href="#section-15" className="underline">How to Contact Us</a></li>
            <li><a href="#section-16" className="underline">How to Review, Update, or Delete Your Data</a></li>
          </ol>
        </section>

        {/* 1. WHAT INFORMATION DO WE COLLECT */}
        <section id="section-1">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-3">1. What Information Do We Collect?</h2>

          <h3 className="font-semibold mt-4 mb-1">A. Information You Provide to Us</h3>
          <p>
            We collect personal information you voluntarily provide when you register for an account,
            use our Services, or contact us. This includes:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
            <li>Name</li>
            <li>Email address</li>
            <li>Profile picture (sourced from your Google account)</li>
            <li>Billing address</li>
            <li>Phone number and mailing address (if provided)</li>
            <li>Payment instrument details (handled by our payment processor, Dodo)</li>
          </ul>

          <h3 className="font-semibold mt-5 mb-1">B. Information Collected Automatically</h3>
          <p>
            When you visit or use the Services, we automatically collect certain technical information,
            including your IP address, browser type, device characteristics, operating system, language
            preferences, referring URLs, and information about how you interact with the Services
            (such as pages viewed, features used, and timestamps). This information is used for security,
            operations, and internal analytics.
          </p>
          <p className="mt-3">
            We also collect information through cookies and similar technologies. For details, see
            our <a href="https://ozigi.app/cookie-policy" className="text-blue-600 underline">Cookie Policy</a>.
          </p>
          <p className="mt-3">The specific data we collect automatically includes:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
            <li><strong>Log and Usage Data:</strong> IP address, browser type, device info, pages viewed, search queries, error reports, crash dumps, and timestamps.</li>
            <li><strong>Device Data:</strong> Device model, operating system, application IDs, hardware model, and ISP or mobile carrier.</li>
            <li><strong>Location Data:</strong> Approximate location inferred from IP address. You may disable precise location sharing via your device settings.</li>
          </ul>

          <h3 className="font-semibold mt-5 mb-1">C. Information from Third Parties</h3>
          <p>
            We do not purchase or acquire personal information from third-party data brokers.
            We may receive limited profile information from Google when you choose to log in via
            Google OAuth (see Section 2 for full details).
          </p>
        </section>

        {/* 2. GOOGLE USER DATA */}
        <section id="section-2">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-3">
            2. Google User Data — Specific Disclosures
          </h2>
          <p>
            Ozigi&apos;s use of information received from Google APIs adheres to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Google API Services User Data Policy
            </a>
            , including its{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy#limited-use"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Limited Use requirements
            </a>
            .
          </p>

          <h3 className="font-semibold mt-5 mb-1">2.1 Data Accessed</h3>
          <p>
            When you sign in to Ozigi using your Google account, we request access to the
            following Google user data via Google OAuth:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
            <li>Your <strong>name</strong></li>
            <li>Your <strong>email address</strong></li>
            <li>Your <strong>profile picture</strong></li>
          </ul>
          <p className="mt-3">
            We do not request access to Gmail, Google Drive, Google Calendar, or any other
            Google services beyond the basic profile information listed above.
          </p>

          <h3 className="font-semibold mt-5 mb-1">2.2 Data Usage</h3>
          <p>Google user data accessed by Ozigi is used <strong>only</strong> for the following purposes:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
            <li>To create and authenticate your Ozigi account</li>
            <li>To display your name and profile picture within the Ozigi interface</li>
            <li>To associate your account with your email address for service communications</li>
          </ul>
          <p className="mt-3">
            We do <strong>not</strong> use Google user data to serve advertising, build advertising
            profiles, or for any purpose unrelated to providing the Ozigi service to you.
            We do not allow any human to read your Google user data unless you explicitly
            request support, it is necessary for security purposes, or we are required to do so by law.
          </p>

          <h3 className="font-semibold mt-5 mb-1">2.3 Data Sharing</h3>
          <p>
            We do <strong>not</strong> sell, rent, or share Google user data with third parties,
            except in the following limited circumstances:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
            <li>
              With infrastructure and hosting service providers under written agreements that
              prohibit them from using the data for any purpose other than providing services to us.
            </li>
            <li>As required by applicable law or valid legal process.</li>
          </ul>

          <h3 className="font-semibold mt-5 mb-1">2.4 Data Storage &amp; Protection</h3>
          <p>
            Your Google profile data (name, email, and profile picture) is stored in our
            secure databases. We use industry-standard encryption in transit (TLS/HTTPS) and
            at rest. Access to this data is restricted to authorized personnel only, and
            we maintain organizational and technical controls to prevent unauthorized access,
            loss, or misuse.
          </p>

          <h3 className="font-semibold mt-5 mb-1">2.5 Data Retention &amp; Deletion</h3>
          <p>
            We retain your Google user data for as long as your Ozigi account is active. When
            you delete your account, we delete your Google user data from our active systems
            within <strong>30 days</strong>. Residual copies in encrypted backups are purged
            within the same window unless retention is required by law.
          </p>
          <p className="mt-3">To request deletion of your Google user data, you may:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
            <li>Delete your account from your account settings, or</li>
            <li>Email us at <a href="mailto:hello@ozigi.app" className="text-blue-600 underline">hello@ozigi.app</a>, or</li>
            <li>
              Submit a{" "}
              <a
                href="https://app.termly.io/dsar/201bd088-3302-4012-bee3-0a5ac67877e5"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                data subject access request
              </a>
              .
            </li>
          </ul>
        </section>

        {/* 3. HOW DO WE USE YOUR INFORMATION */}
        <section id="section-3">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-3">3. How Do We Use Your Information?</h2>
          <p>We process your personal information for the following purposes:</p>
          <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
            <li><strong>Account creation and authentication:</strong> To create and maintain your account and verify your identity.</li>
            <li><strong>Service delivery:</strong> To provide, operate, and improve the Ozigi platform and its AI-powered features.</li>
            <li><strong>Customer support:</strong> To respond to your inquiries and resolve issues.</li>
            <li><strong>Communications:</strong> To send service-related messages, security alerts, and (with your consent) marketing emails. You may opt out of marketing emails at any time.</li>
            <li><strong>Analytics and improvement:</strong> To understand how users interact with the Services and improve features and performance.</li>
            <li><strong>Security and fraud prevention:</strong> To detect, investigate, and prevent fraudulent transactions and other unauthorized activity.</li>
            <li><strong>Legal compliance:</strong> To comply with applicable laws, regulations, and legal obligations.</li>
            <li><strong>Vital interests:</strong> To protect the safety of users or the public where necessary.</li>
          </ul>
        </section>

        {/* 4. SHARING */}
        <section id="section-4">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-3">4. When and With Whom Do We Share Your Information?</h2>
          <p>We share your personal information only in the specific circumstances below:</p>
          <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
            <li>
              <strong>Payment processing (Dodo):</strong> Payment data is handled directly by Dodo. We do not store
              your full card details. See Dodo&apos;s privacy policy at{" "}
              <a
                href="https://www.dodo.com/terms-policies/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                dodo.com/terms-policies/privacy-policy
              </a>.
            </li>
            <li>
              <strong>AI service providers (Google Cloud AI, Anthropic):</strong> Your inputs and outputs may be
              processed by these providers to power AI features. Their use is governed by their respective
              privacy policies and our data processing agreements with them.
            </li>
            <li>
              <strong>Analytics and monitoring (Google Analytics, PostHog, Sentry):</strong> These tools
              collect usage and error data to help us improve the Services. See Section 5 for more detail.
            </li>
            <li>
              <strong>Business transfers:</strong> If Ozigi Corp is involved in a merger, acquisition, or
              asset sale, your information may be transferred as part of that transaction.
            </li>
            <li>
              <strong>Legal requirements:</strong> We may disclose your information where required by law,
              court order, or governmental authority.
            </li>
          </ul>
          <p className="mt-4">
            We have not sold or shared personal information with third parties for commercial purposes
            in the past twelve (12) months, and we do not intend to do so in the future.
          </p>
        </section>

        {/* 5. COOKIES */}
        <section id="section-5">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-3">5. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies (web beacons, pixels) to operate the Services,
            remember your preferences, maintain security, and analyze usage. Third-party tools we use include:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
            <li>
              <strong>Google Analytics:</strong> Tracks usage patterns, page views, and user behavior.
              You can opt out via the{" "}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                Google Analytics Opt-out Browser Add-on
              </a>{" "}
              or{" "}
              <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                Google Ad Settings
              </a>.
            </li>
            <li>
              <strong>PostHog:</strong> Tracks product usage and user interactions to help us understand
              how the platform is used and identify areas for improvement.
            </li>
            <li>
              <strong>Sentry:</strong> Monitors errors and application performance. Error reports may
              include technical data about your session at the time of the error.
            </li>
          </ul>
          <p className="mt-4">
            For full details on how we use cookies and how to manage your preferences, see our{" "}
            <a href="https://ozigi.app/cookie-policy" className="text-blue-600 underline">Cookie Policy</a>.
            You can also set your browser to reject cookies, though this may affect some features.
          </p>
        </section>

        {/* 6. AI */}
        <section id="section-6">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-3">6. Artificial Intelligence Features</h2>
          <p>
            Ozigi is an AI-powered platform. Our Services include features such as AI-generated social
            media content, document generation, AI automation, and AI search. These features are
            powered by third-party AI service providers including <strong>Google Cloud AI</strong> and{" "}
            <strong>Anthropic</strong>.
          </p>
          <p className="mt-3">
            When you use AI features, your inputs (such as notes, PDFs, links, and instructions)
            and the resulting outputs may be processed by these providers in accordance with our
            data processing agreements with them and their own privacy policies. You must not use
            AI features in any way that violates the terms of these providers.
          </p>
          <p className="mt-3">
            To opt out of AI processing, please contact us at{" "}
            <a href="mailto:hello@ozigi.app" className="text-blue-600 underline">hello@ozigi.app</a>.
          </p>
        </section>

        {/* 7. SOCIAL LOGINS */}
        <section id="section-7">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-3">7. Social Logins</h2>
          <p>
            Ozigi allows you to register and log in using your Google account. When you do this, we
            receive your name, email address, and profile picture from Google, as described in Section 2.
            We use this information only to create and manage your account. We recommend reviewing
            Google&apos;s own privacy policy to understand how they handle your data.
          </p>
        </section>

        {/* 8. RETENTION */}
        <section id="section-8">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-3">8. How Long Do We Keep Your Information?</h2>
          <p>
            We retain your personal information for as long as your account is active or as otherwise
            necessary to provide the Services. When you delete your account, we delete your personal
            data from our active systems within <strong>30 days</strong>. We may retain certain
            information in our records for longer periods only where required by law (for example,
            for tax, accounting, or fraud prevention purposes).
          </p>
          <p className="mt-3">
            When we no longer have a legitimate need to process your information, we will delete or
            anonymize it. If immediate deletion is not possible (for example, due to encrypted backup
            archives), we will securely isolate the data until deletion is possible.
          </p>
        </section>

        {/* 9. SECURITY */}
        <section id="section-9">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-3">9. How Do We Keep Your Information Safe?</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your
            personal information, including encryption in transit (TLS/HTTPS), encryption at rest,
            access controls, and monitoring via Sentry. However, no electronic transmission over the
            internet or data storage system is guaranteed to be 100% secure. While we work hard to
            protect your information, we cannot guarantee that unauthorized parties will never be able
            to circumvent our security measures. You should access the Services only within a secure
            environment.
          </p>
        </section>

        {/* 10. PRIVACY RIGHTS */}
        <section id="section-10">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-3">10. Your Privacy Rights</h2>
          <p>
            Depending on where you are located, you may have the following rights regarding your
            personal information:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
            <li><strong>Right to access:</strong> Request a copy of the personal information we hold about you.</li>
            <li><strong>Right to rectification:</strong> Request correction of inaccurate or incomplete information.</li>
            <li><strong>Right to erasure:</strong> Request deletion of your personal information.</li>
            <li><strong>Right to restrict processing:</strong> Request that we limit how we use your data.</li>
            <li><strong>Right to data portability:</strong> Request your data in a structured, commonly used format.</li>
            <li><strong>Right to object:</strong> Object to processing based on legitimate interests or for direct marketing.</li>
            <li><strong>Right to withdraw consent:</strong> Where processing is based on consent, withdraw it at any time.</li>
          </ul>
          <p className="mt-4">
            To exercise any of these rights, please email us at{" "}
            <a href="mailto:hello@ozigi.app" className="text-blue-600 underline">hello@ozigi.app</a>,
            call us at <strong>09038133730</strong>, or submit a{" "}
            <a
              href="https://app.termly.io/dsar/201bd088-3302-4012-bee3-0a5ac67877e5"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              data subject access request
            </a>.
          </p>
          <p className="mt-3">
            If you are in the EEA or UK and believe we are unlawfully processing your data, you may
            lodge a complaint with your local data protection authority. If you are in Switzerland,
            you may contact the{" "}
            <a href="https://www.edoeb.admin.ch/edoeb/en/home.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              Federal Data Protection and Information Commissioner
            </a>.
          </p>
          <p className="mt-3">
            You may also unsubscribe from marketing emails at any time by clicking the unsubscribe
            link in any marketing email we send, or by contacting us directly.
          </p>

          <h3 className="font-semibold mt-5 mb-1">Account Information</h3>
          <p>
            You can review or update your account information by logging into your account settings.
            To terminate your account, log in and follow the account deletion steps, or contact us.
            Upon deletion, your account and associated data will be deactivated and deleted within 30 days.
          </p>
        </section>

        {/* 11. DNT */}
        <section id="section-11">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-3">11. Do-Not-Track Features</h2>
          <p>
            Most web browsers include a Do-Not-Track (&ldquo;DNT&rdquo;) setting that signals to websites that
            you prefer not to be tracked. Because no uniform technical standard for recognizing DNT
            signals currently exists, we do not respond to DNT browser signals at this time. If a
            standard is adopted in the future, we will update this policy accordingly.
          </p>
          <p className="mt-3">
            California law requires us to disclose this practice, and we do so here: we do not
            currently honor DNT signals.
          </p>
        </section>

        {/* 12. US RESIDENTS */}
        <section id="section-12">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-3">12. United States Residents — Specific Rights</h2>
          <p>
            If you are a resident of California, Colorado, Connecticut, Virginia, or another US state
            with applicable privacy legislation, you may have additional rights, including the right
            to know what personal data we collect and how it is used, the right to correct inaccuracies,
            the right to delete your data, the right to opt out of the sale or sharing of your data,
            and the right to non-discrimination for exercising your rights.
          </p>
          <p className="mt-3">
            We have not sold or shared any personal information with third parties for commercial purposes
            in the preceding twelve (12) months and do not intend to do so.
          </p>
          <p className="mt-3">
            To exercise your rights, submit a{" "}
            <a
              href="https://app.termly.io/dsar/201bd088-3302-4012-bee3-0a5ac67877e5"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              data subject access request
            </a>{" "}
            or email us at{" "}
            <a href="mailto:hello@ozigi.app" className="text-blue-600 underline">hello@ozigi.app</a>.
            We will verify your identity before processing any request.
          </p>
          <p className="mt-3">
            If we deny your request and you wish to appeal, email us at{" "}
            <a href="mailto:hello@ozigi.app" className="text-blue-600 underline">hello@ozigi.app</a>.
            If your appeal is denied, you may contact your state attorney general.
          </p>
        </section>

        {/* 13. OTHER REGIONS */}
        <section id="section-13">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-3">13. Other Regions — Specific Rights</h2>

          <h3 className="font-semibold mt-4 mb-1">Australia and New Zealand</h3>
          <p>
            We process personal information in accordance with Australia&apos;s Privacy Act 1988 and
            New Zealand&apos;s Privacy Act 2020. You have the right to request access to or correction
            of your personal information at any time by contacting us.
          </p>

          <h3 className="font-semibold mt-5 mb-1">Republic of South Africa</h3>
          <p>
            You have the right to request access to or correction of your personal information at any time.
            If you are unsatisfied with how we handle a complaint, you may contact the{" "}
            <a href="https://inforegulator.org.za/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              Information Regulator (South Africa)
            </a>{" "}
            at{" "}
            <a href="mailto:enquiries@inforegulator.org.za" className="text-blue-600 underline">
              enquiries@inforegulator.org.za
            </a>.
          </p>
        </section>

        {/* 14. UPDATES */}
        <section id="section-14">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-3">14. Updates to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices,
            technology, or legal requirements. The &ldquo;Last updated&rdquo; date at the top of this page
            indicates when the most recent changes were made. If we make material changes, we will
            notify you by email or by posting a prominent notice on our website. We encourage you
            to review this policy periodically.
          </p>
        </section>

        {/* 15. CONTACT */}
        <section id="section-15">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-3">15. How to Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy or our data practices,
            please contact our Data Protection Officer:
          </p>
          <div className="mt-3 space-y-1">
            <p><strong>Ozigi Corp</strong></p>
            <p>Data Protection Officer</p>
            <p>Umuna Woko Street, 22</p>
            <p>Portharcourt-Mgbuoba, Rivers 500221</p>
            <p>Nigeria</p>
            <p>
              Email:{" "}
              <a href="mailto:hello@ozigi.app" className="text-blue-600 underline">hello@ozigi.app</a>
            </p>
            <p>Phone: 09038133730</p>
          </div>
        </section>

        {/* 16. REVIEW / DELETE */}
        <section id="section-16">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-3">16. How to Review, Update, or Delete Your Data</h2>
          <p>
            Based on applicable law, you may have the right to request access to the personal information
            we collect from you, request corrections, or request deletion. To do so, please:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
            <li>
              Submit a{" "}
              <a
                href="https://app.termly.io/dsar/201bd088-3302-4012-bee3-0a5ac67877e5"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                data subject access request
              </a>
            </li>
            <li>
              Email us at{" "}
              <a href="mailto:hello@ozigi.app" className="text-blue-600 underline">hello@ozigi.app</a>
            </li>
            <li>Log in to your account and update or delete your information directly from account settings</li>
          </ul>
        </section>

      </div>
    </div>
  );
}