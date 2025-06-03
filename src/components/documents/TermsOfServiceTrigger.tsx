import React, { useState, cloneElement, isValidElement, ReactNode } from "react";
import DocumentViewerDialog from "@/components/common/DocumentViewerDialog";
import { cn } from "@/lib/utils";

const termsOfServiceHtmlContent = `
  <p class="text-sm text-muted-foreground pb-4">Effective Date: May 20, 2025</p>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">1. Purpose</h2>
    <p>
      These Terms of Service are intended to stipulate the terms and procedures for using the services provided through the Johor Tickets website (hereinafter referred to as the “Portal”) operated by the Johor State Government (hereinafter referred to as the “State Government”), as well as the rights and obligations and responsibilities between users and the State Government.
    </p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">2. Definition</h2>
    <p class="mb-1"><strong class="font-medium">Portal:</strong> A website operated by the State Government that provides ticket reservation and purchase services for public facilities such as zoos, botanical gardens, and museums.</p>
    <p class="mb-1"><strong class="font-medium">User:</strong> An individual or corporation that accesses the Johor Tickets website and uses the services in accordance with these Terms of Service.</p>
    <p class="mb-1"><strong class="font-medium">Member:</strong> A person who has registered as a member by providing personal information to the Portal and can continuously use the Services.</p>
    <p class="mb-1"><strong class="font-medium">Non-member:</strong> A person who temporarily uses the Services without registering as a member.</p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">3. Effectiveness and Change of Terms of Service</h2>
    <p class="mb-2">These Terms of Service take effect upon posting on the Portal.</p>
    <p class="mb-2">The state government may change these terms and conditions to the extent that they do not violate relevant laws and regulations, and the changed terms and conditions will take effect upon posting on the portal.</p>
    <p>If the user does not agree to the changed terms and conditions, he or she may discontinue using the service and withdraw.</p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">4. Provision and Change of Services</h2>
    <p class="mb-2">The state government provides the following services:</p>
    <ul class="list-disc pl-5 mb-2 space-y-1">
      <li>Ticket reservation and purchase service for facilities</li>
      <li>Reservation details confirmation and cancellation service</li>
      <li>Other related services determined by the state government</li>
    </ul>
    <p>The state government may change the contents of the service according to operational or technical needs, and the changed contents will be posted on the portal.</p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">5. Suspension of Services</h2>
    <p class="mb-2">The state government may restrict or suspend all or part of the service in the following cases:</p>
    <ul class="list-disc pl-5 mb-2 space-y-1">
      <li>When regular system inspection, maintenance, or replacement occurs</li>
      <li>When force majeure occurs, such as a natural disaster or national emergency</li>
      <li>When the state government determines that it is difficult to provide the service</li>
    </ul>
    <p>In the case of a service suspension under Paragraph 1, the state government will notify in advance through the portal. However, in urgent cases, it may notify after the fact.</p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">6. Membership Registration</h2>
    <p class="mb-2">Users may apply for membership registration in accordance with the procedures set by the portal.</p>
    <p class="mb-2">The state government may not approve applications that fall under any of the following:</p>
    <ul class="list-disc pl-5 space-y-1">
      <li>If another person's name is used</li>
      <li>If false information is provided</li>
      <li>If other requirements for application for use set by the state government are not met</li>
    </ul>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">7. Change of Membership Information</h2>
    <p>Members may view and modify their personal information at any time through the personal information management screen.</p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">8. Withdrawal of Membership and Loss of Qualification</h2>
    <p class="mb-2">Members may request withdrawal of membership through the portal at any time, and the state government will immediately process the withdrawal of membership.</p>
    <p class="mb-2">If a member falls under any of the following reasons, the state government may restrict or suspend membership:</p>
    <ul class="list-disc pl-5 space-y-1">
      <li>If the name of another person is used impersonally</li>
      <li>If the operation of the portal is disrupted</li>
      <li>If other terms and conditions are violated</li>
    </ul>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">9. User Obligations</h2>
    <p class="mb-2">Users must not perform the following actions:</p>
    <ul class="list-disc pl-5 space-y-1">
      <li>Registering false information when applying or changing</li>
      <li>Stealing another person's information</li>
      <li>Changing information posted on the portal</li>
      <li>Transmitting or posting information (such as computer programs) other than information designated by the state government</li>
      <li>Other illegal or unfair actions</li>
    </ul>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">10. Ticket Purchase and Refund</h2>
    <p class="mb-2">Users can purchase tickets through the portal using a payment method designated by the state government.</p>
    <p class="mb-2">Ticket refunds and cancellations are subject to the refund policy of each facility.</p>
    <p>Refund requests are received through the portal, and the state government processes them in accordance with relevant laws and refund policies.</p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">11. Personal Information Protection</h2>
    <p class="mb-2">The state government strives to protect the personal information of users and processes personal information in accordance with relevant laws and regulations.</p>
    <p>Matters regarding the collection, use, storage, and destruction of personal information are subject to a separate personal information processing policy.</p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">12. Copyright Attribution and Restrictions on Use</h2>
    <p class="mb-2">The copyright of works posted on the portal belongs to the state government.</p>
    <p>Users may not use the information obtained by using the portal for profit-making purposes or allow third parties to use it by means of reproduction, transmission, publication, distribution, broadcasting, or other methods without the prior consent of the state government.</p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">13. Disclaimer</h2>
    <p class="mb-2">The state government shall be exempt from liability for providing services if it is unable to provide services due to natural disasters or other force majeure.</p>
    <p>The state government shall not be liable for any service disruption caused by the user's fault.</p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">14. Dispute Resolution</h2>
    <p class="mb-2">Matters not specified in these Terms and Conditions shall be governed by the relevant laws and customs of Malaysia.</p>
    <p>The court located in Johor shall have jurisdiction over any disputes that arise between the state government and users in connection with the use of the service.</p>
  </section>
`;

const termsOfServiceTitle = "Terma Perkhidmatan";

interface TermsOfServiceTriggerProps {
  children: ReactNode;
  className?: string;
}

const TermsOfServiceTrigger: React.FC<TermsOfServiceTriggerProps> = ({ children, className }) => {
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
        role: children.type === "button" || (children.props as any).role === "button" ? (children.props as any).role : "button",
        tabIndex: (children.props as any).tabIndex !== undefined ? (children.props as any).tabIndex : 0,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen();
          }

          if (typeof (children.props as any).onKeyDown === "function") {
            (children.props as any).onKeyDown(e);
          }
        },
      })
    : children;

  return (
    <>
      {/* The span acts as a clickable wrapper only if children is not a valid element (e.g., plain text) */}
      <span
        className={cn(className)}
        onClick={!isValidElement(children) ? handleOpen : undefined}
        role={!isValidElement(children) ? "button" : undefined}
        tabIndex={!isValidElement(children) ? 0 : undefined}
        onKeyDown={
          !isValidElement(children)
            ? (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOpen();
                }
              }
            : undefined
        }
      >
        {triggerElement}
      </span>
      <DocumentViewerDialog
        width="max-w-[1080px]"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        documentTitle={termsOfServiceTitle}
        htmlContent={termsOfServiceHtmlContent}
      />
    </>
  );
};

export default TermsOfServiceTrigger;
