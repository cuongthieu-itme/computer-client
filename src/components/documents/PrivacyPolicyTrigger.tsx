import React, { useState, cloneElement, isValidElement, ReactNode } from "react";
import DocumentViewerDialog from "@/components/common/DocumentViewerDialog";
import { cn } from "@/lib/utils";

const privacyPolicyHtmlContent = `

  <p class="text-sm text-muted-foreground pb-3">Effective Date: May 20, 2025</p>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">1. Background</h2>
    <p class="mb-2">
      This Privacy Policy sets out the terms and conditions of your use and access to our website between you and us. This Privacy Policy applies to all users of our website.
    </p>
    <p>
      Your use of our website means that you accept and agree to comply with all terms set out in this Privacy Policy, General Terms and Conditions [View General Terms], Acceptable Use Policy [View Acceptable Use Policy], Copyright Policy [View Copyright Policy] and any additional terms that apply to you.
    </p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">2. Introduction</h2>
    <p class="mb-2">
      Johor Tickets ("we") is committed to protecting your privacy and places your privacy at the top of our priorities.
    </p>
    <p>
      This Privacy Policy sets out how we protect your personal information in accordance with the Personal Data Protection Act 2010 ("PDPA").
    </p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">3. What personal information do we collect?</h2>
    <p>
      The types of personal information we collect directly from you or third parties may include (but are not limited to) your name, email address, contact information, credit/debit card number and expiration date, banking or financial information, residential or office address, billing address, and information related to the products and services you frequently use on our website.
    </p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">4. How do we collect your personal information?</h2>
    <p class="mb-2">This Privacy Policy applies to all personal information provided to us:</p>
    <ul class="list-disc pl-5 mb-2 space-y-1">
      <li>When you use our products or services on our website.</li>
      <li>When you register, open an account or sign up for a transaction for a product or service offered or supplied on our website.</li>
      <li>When you use or visit an online site operated by Johor Tickets and its suppliers or contractors.</li>
      <li>Under other contracts or arrangements with third party product or service providers.</li>
    </ul>
    <p class="mb-2">Some of the other ways we may collect Personal Data also includes (but is not limited to):</p>
    <ul class="list-disc pl-5 space-y-1">
      <li>Communication between us and you (by phone, letter, fax or email).</li>
      <li>When you visit our website or the websites of our contractors.</li>
      <li>When you contact us directly. When we contact you directly.</li>
      <li>When we collect information about you from trusted third parties who process our transactions.</li>
    </ul>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">5. How we collect personal information on our website</h2>
    <h3 class="text-lg font-medium text-primary/80">Your IP address</h3>
    <p>
      We use your IP address to diagnose server problems and administer our website. Your IP address is used to identify you and your registration/subscription or membership information, and to gather broad demographic information.
    </p>
    <h3 class="text-lg font-medium text-primary/80">User Feedback Form</h3>
    <p>
      To use our customer care feedback form, you must provide us with contact information (such as your name and email address). This allows us to respond to your comments or inquiries. We use your contact information provided on the registration form (or when you sign up) to send you information about our company. We also use your contact information to contact you when necessary. Demographic and profile data is also collected on our website. We use your personal information to personalize your experience on our website by showing you content, products or services that may be of interest to you.
    </p>
    <h3 class="text-lg font-medium text-primary/80">Cookie Information</h3>
    <p>
      Cookies are small pieces of data that often include an anonymous unique identifier that is sent to your browser from our website and stored on your computer's hard drive. We use cookies on some of our web pages to store your preferences and record session information. The information we collect is used to provide you with a more personalized service experience. You can adjust your browser settings to notify you when you receive a cookie. Please refer to your browser documentation to determine whether cookies are 'enabled' or 'disabled' on your computer. You can adjust your settings to refuse receiving cookies.
    </p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">6. For what purposes do we use your personal information?</h2>
    <p class="mb-2">We may use your personal information for the following purposes (the "Purposes"):</p>
    <ul class="list-disc pl-5 space-y-1">
      <li>To process orders and transactions for products or services.</li>
      <li>To process other transactions.</li>
      <li>To facilitate your participation in the Cloud Credit Program or other promotions, rewards, sweepstakes or loyalty programs offered by us or our affiliate partners from time to time.</li>
      <li>To send you promotions and information about products, services and activities.</li>
      <li>To protect the safety and security of you and other users.</li>
      <li>To investigate and respond to your claims or inquiries.</li>
      <li>To comply with any legal or regulatory requirements.</li>
    </ul>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">7. Access/Restrict/Correction/Update of Personal Information</h2>
    <p class="mb-2">You may request to restrict the collection of your personal information, restrict the processing of your personal information, update or correct your personal information as follows:</p>
    <ul class="list-disc pl-5 mb-2 space-y-1">
      <li>If you are an account holder or registered customer, you may update your personal information by logging into your account.</li>
      <li>For other customers, please forward your request to zoojohor@johor.gov.my.</li>
    </ul>
    <p>We will endeavour to provide you with the information as soon as possible.</p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">8. Withdrawal of Consent</h2>
    <p>
      We are required to process your personal information, without which we cannot process your product or service order and other transactions.
    </p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">9. Who we disclose your personal information to</h2>
    <p class="mb-2">
      We do not sell your personal information to third parties. Your personal information will only be disclosed or transferred to the following third parties, which may be located within or outside Malaysia, to achieve the purposes set out below:
    </p>
    <ul class="list-disc pl-5 space-y-1">
      <li>Our subsidiaries, affiliate partners and, where necessary, trusted merchants and contractors who work closely with us: to process your order, provide products or services on our website or otherwise process essential information</li>
      <li>Credit card verification service providers, data warehouses and other third parties to process your commercial transactions.</li>
      <li>Legal authorities required by law, such as to comply with a warrant or subpoena issued by a court of competent jurisdiction.</li>
      <li>Customs, immigration or other regulatory authorities applicable to you.</li>
    </ul>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">10. How long do we keep your personal information?</h2>
    <p class="mb-2">
      We will not keep your personal information for longer than is necessary to achieve the purposes. However, relevant personal information may be kept in accordance with the following conditions:
    </p>
    <ul class="list-disc pl-5 space-y-1">
      <li>Where required by applicable law.</li>
      <li>Where legal action has been or is pending. We will take all reasonable steps to destroy or permanently delete all personal information when it is no longer needed for the purposes set out in this Agreement.</li>
    </ul>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">11. Permanently Deleting Your Account</h2>
    <p class="mb-2">You can permanently delete your account on Johor Tickets by following these steps:</p>
    <ul class="list-disc pl-5 mb-2 space-y-1">
      <li>Log in to your profile, click [Delete My Account] and then click [Confirm Deletion].</li>
    </ul>
    <p>Deleting your account is permanent. You will no longer be able to access your profile on Johor Tickets.</p>
  </section>
  
  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">12. Permanently Deleting Your Data</h2>
    <p class="mb-2">You can permanently delete your data on Johor Tickets by following these steps:</p>
    <ul class="list-disc pl-5 mb-2 space-y-1">
      <li>Log in to your profile, click [Delete My Account] and then click [Confirm Deletion].</li>
    </ul>
    <p>Deleting your data is permanent. You will no longer be able to access your data on Johor Tickets.</p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">13. Security</h2>
    <p class="mb-2">
      No data transmission over the Internet can be guaranteed to be 100% secure, safe or error-free. Accordingly, we cannot guarantee the security of any information you provide. Upon receipt of your transmitted data, we will make reasonable efforts to ensure the security of our systems. We use secure server software (SSL) and firewalls to protect your information from unauthorized access, disclosure, alteration or destruction. However, this does not provide 100% security. No security system is completely impervious to third-party hackers or malicious users. You agree that we will not be liable to you in the event that our security systems are breached by third-party hackers or malicious actors. If we become aware of a security system breach, we will notify you so that you can take appropriate protective measures to protect your sensitive data.
    </p>
    <p>
      By using our website or providing personal information to us, you agree that we may communicate with you electronically regarding security, privacy and administrative issues related to your use of our website. If a security breach occurs, we may post a notice on the website or send you an email to the email address you provided to us.
    </p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">15. Notification of Changes</h2>
    <p class="mb-2">
      This Privacy Policy may be revised from time to time to comply with applicable laws and regulations, and such changes may apply to you.
    </p>
    <p>
      Please visit our website from time to time to review our Privacy Policy for updates.
    </p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">16. Incorporation by reference</h2>
    <p>
      This "Privacy Policy" shall be construed together with our "Terms of Service" and "Terms of Purchase", all of which are deemed to be incorporated into this Agreement by this reference.
    </p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">17.Contact Us</h2>
    <p>
      If you have any questions, concerns or complaints regarding our processing of your personal data or our Privacy Policy, please contact us at zoojohor@johor.gov.my.
    </p>
  </section>

  <section>
    <h2 class="text-xl font-semibold mb-2 text-primary/90">18. Definitions</h2>
    <p>
      See General Terms and Conditions.
    </p>
  </section>
`;

const privacyPolicyTitle = "Polisi Privasi";

interface PrivacyPolicyTriggerProps {
  children: ReactNode;
  className?: string;
}

const PrivacyPolicyTrigger: React.FC<PrivacyPolicyTriggerProps> = ({ children, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);

  const triggerElement = isValidElement(children)
    ? cloneElement(children as React.ReactElement<any>, {
        onClick: (e: React.MouseEvent) => {
          handleOpen();
          if (typeof (children.props as any).onClick === "function") {
            (children.props as any).onClick(e);
          }
        },
        "aria-haspopup": "dialog",
        "aria-expanded": isOpen,
        role: "button",
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            handleOpen();
            if (typeof (children.props as any).onKeyDown === "function") {
              (children.props as any).onKeyDown(e);
            }
          }
        },
      })
    : children;

  return (
    <>
      <span
        className={cn(className)}
        onClick={!isValidElement(children) ? handleOpen : undefined}
        role={!isValidElement(children) ? "button" : undefined}
        tabIndex={!isValidElement(children) ? 0 : undefined}
        onKeyDown={
          !isValidElement(children)
            ? (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") handleOpen();
              }
            : undefined
        }
      >
        {triggerElement}
      </span>
      <DocumentViewerDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        documentTitle={privacyPolicyTitle}
        htmlContent={privacyPolicyHtmlContent}
        width="max-w-[1080px]"
      />
    </>
  );
};

export default PrivacyPolicyTrigger;
