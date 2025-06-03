import React, { useState, cloneElement, isValidElement, ReactNode } from "react";
import DocumentViewerDialog from "@/components/common/DocumentViewerDialog";
import { cn } from "@/lib/utils";

const faqTitle = "Frequently Asked Questions";

interface FAQTriggerProps {
  children: ReactNode;
  className?: string;
}

const FAQTrigger: React.FC<FAQTriggerProps> = ({ children, className }) => {
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

  const faqData = [
    {
      question: "Q) How do I buy a ticket?",
      answer: (
        <>
          <p className="mb-3">
            From the
            <a href="/" className="text-primary hover:underline mx-1">
              home page
            </a>
            select the ticket you want to buy and click on it, as shown in the image below.
          </p>
          <img
            src="/faq/faq1.jpg"
            alt="Select ticket from home page"
            className="mt-2 mb-7 rounded-md shadow-md w-full max-w-md mx-auto"
            onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/FF0000?text=Image+Not+Found")}
          />
          <p className="mb-3">Select the date you want to visit and increment the number of tickets you want to buy.</p>
          <img
            src="https://placehold.co/600x400/e2e8f0/333333?text=FAQ2.jpg"
            alt="Select date and number of tickets"
            className="mt-2 mb-7 rounded-md shadow-md w-full max-w-md mx-auto"
            onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/FF0000?text=Image+Not+Found")}
          />
          <p className="mb-3">You can proceed with the payment by clicking on the button as shown in the image below.</p>
          <img
            src="https://placehold.co/600x400/e2e8f0/333333?text=FAQ3.jpg"
            alt="Proceed with payment button"
            className="mt-2 mb-7 rounded-md shadow-md w-full max-w-md mx-auto"
            onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/FF0000?text=Image+Not+Found")}
          />
          <p className="mb-3">Verify your order and proceed accordingly.</p>
          <img
            src="https://placehold.co/600x400/e2e8f0/333333?text=FAQ4.jpg"
            alt="Verify order"
            className="mt-2 mb-7 rounded-md shadow-md w-full max-w-md mx-auto"
            onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/FF0000?text=Image+Not+Found")}
          />
          <p className="mb-3">If you are not logged in, you will need to enter your details to proceed with the payment.</p>
          <img
            src="https://placehold.co/600x400/e2e8f0/333333?text=FAQ5.jpg"
            alt="Enter details if not logged in"
            className="mt-2 mb-7 rounded-md shadow-md w-full max-w-md mx-auto"
            onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/FF0000?text=Image+Not+Found")}
          />
          <p className="mb-3">Select the payment method you want to use and proceed.</p>
          <img
            src="https://placehold.co/600x400/e2e8f0/333333?text=FAQ6.jpg"
            alt="Select payment method"
            className="mt-2 mb-7 rounded-md shadow-md w-full max-w-md mx-auto"
            onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/FF0000?text=Image+Not+Found")}
          />
          <p className="mb-3">Make sure you verify your order and proceed with the payment.</p>
          <img
            src="https://placehold.co/600x400/e2e8f0/333333?text=FAQ7.jpg"
            alt="Verify order before final payment"
            className="mt-2 mb-7 rounded-md shadow-md w-full max-w-md mx-auto"
            onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/FF0000?text=Image+Not+Found")}
          />
          <p className="mb-3">You will be redirected to the payment gateway page where you can proceed with the payment.</p>
          <img
            src="https://placehold.co/600x400/e2e8f0/333333?text=FAQ8.jpg"
            alt="Payment gateway page"
            className="mt-2 mb-7 rounded-md shadow-md w-full max-w-md mx-auto"
            onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/FF0000?text=Image+Not+Found")}
          />
          <p className="mb-3">Once the payment is successful, you will be redirected to the order confirmation page.</p>
          <img
            src="https://placehold.co/600x400/e2e8f0/333333?text=FAQ9.jpg"
            alt="Order confirmation page"
            className="mt-2 mb-7 rounded-md shadow-md w-full max-w-md mx-auto"
            onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/FF0000?text=Image+Not+Found")}
          />
        </>
      ),
    },
    {
      question: "Q) Can I change the date of my visit?",
      answer: <p>At the moment, you are not able to change the date of your visit.</p>,
    },
    {
      question: "Q) What is the refund policy and how do I apply?",
      answer: <p>Please refer to the refund policy in the legal footer section of the website.</p>,
    },
    {
      question: "Q) How do I use the e-ticket (QR code) at the entrance?",
      answer: (
        <>
          <p className="mb-2">
            Show the QR code to the staff at the entrance. The staff will guide you to scan the QR code. Once the QR code is scanned, you will be
            allowed to enter!
          </p>
          <p>
            You may also scan the QR code using your mobile phone (make sure your brightness is turned on high) and scan it at the entrance by
            pointing to the scanner.
          </p>
        </>
      ),
    },
    {
      question: "Q) Are the ticket prices different for citizens and non-citizens?",
      answer: <p>Yes, the ticket prices are different for citizens and non-citizens. Please refer to the ticket price on the product page.</p>,
    },
    {
      question: "Q) Do children under 6 years old and disabled people have to pay?",
      answer: (
        <p>
          Children under 6 years old and disabled people are free of charge. Please refer to the ticket price on the product page for specific details
          and any accompanying documentation required.
        </p>
      ),
    },
    {
      question: "Q) How do I make a group booking (more than 10 people)?",
      answer: (
        <>
          <p className="mb-2">You may contact us if you have a large group booking. Please refer to the "Contact Us" section on the website.</p>
          <p>
            Alternatively, based on ticket availability, you may select the number of tickets you wish to buy and proceed with the payment if the
            desired quantity is available.
          </p>
        </>
      ),
    },
  ];

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
      <DocumentViewerDialog isOpen={isOpen} onOpenChange={setIsOpen} documentTitle={faqTitle} 
        width="max-w-[580px]">
        <div className="space-y-8  text-sm md:text-base text-gray-700 dark:text-gray-300">
          {faqData.map((item, index) => (
            <div key={index} className="border-b border-gray-300 dark:border-gray-700 pb-6 last:border-b-0 last:pb-0">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-3">{item.question}</h3>
              <div
                className="   prose prose-sm 
            prose-h2:mt-3 prose-h2:mb-2
            prose-h3:mt-3 prose-h3:mb-2 prose-h4:mt-3 prose-h4:mb-2 
            prose-p:mt-0 prose-p:mb-2 
            prose-ul:mt-3 "
              >
                {/* The 'prose' classes from @tailwindcss/typography can help with styling rich text content */}
                {item.answer}
              </div>
            </div>
          ))}
        </div>
      </DocumentViewerDialog>
    </>
  );
};

export default FAQTrigger;
