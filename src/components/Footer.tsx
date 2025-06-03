// src/components/Footer.tsx
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
// import DesignThemeSwitcher from "./DesignThemeSwitcher"; // Commented out as per original

import { cn } from "@/lib/utils";
import PrivacyPolicyTrigger from "./documents/PrivacyPolicyTrigger";
import TermsOfPurchaseTrigger from "./documents/TermsOfPurchaseTrigger";
import TermsOfServiceTrigger from "./documents/TermsOfServiceTrigger";
import FAQTrigger from "./documents/FAQTrigger";
import ContactUsTrigger from "./documents/ContactUsTrigger";
import RefundPolicyTrigger from "./documents/RefundPolicyTrigger";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage(); // Hook for translations

  return (
    <footer className="bg-muted py-8 mt-auto">
      <div className="container mx-auto px-5">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex flex-col justify-center mb-1 md:mb-0 w-fit">
            <img
              src="/portal-e-ticket-logo.png"
              alt={t("components.Navbar.logoAlt")}
              className="h-[78px] sm:h-[83px] py-3 mx-auto"
              style={{ width: "fit-content" }}
            />
            <span className="-mt-3 ml-1 font-bold text-[23px] text-primary  sm:block bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent ">
              {t("components.Footer.brandName")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8   mx-0 md:mx-5">
            <div>
              <h3 className="text-sm font-semibold mb-3">{t("components.Footer.support.heading")}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <FAQTrigger>
                    <span className="hover:text-primary transition-colors cursor-pointer">{t("common.faq")}</span>
                  </FAQTrigger>
                </li>
                <li>
                  <ContactUsTrigger>
                    <span className="hover:text-primary transition-colors cursor-pointer">{t("common.contactUs")}</span>
                  </ContactUsTrigger>
                </li>
                <li>
                  <RefundPolicyTrigger>
                    <span className="hover:text-primary transition-colors cursor-pointer">{t("common.refundPolicy")}</span>
                  </RefundPolicyTrigger>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">{t("components.Footer.legal.heading")}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <PrivacyPolicyTrigger>
                    <span className="hover:text-primary transition-colors cursor-pointer">{t("common.privacyPolicy")}</span>
                  </PrivacyPolicyTrigger>
                </li>
                <li>
                  <TermsOfPurchaseTrigger>
                    <span className="hover:text-primary transition-colors cursor-pointer">{t("common.termsOfPurchase")}</span>
                  </TermsOfPurchaseTrigger>
                </li>
                <li>
                  <TermsOfServiceTrigger>
                    <span className="hover:text-primary transition-colors cursor-pointer">{t("common.termsOfService")}</span>
                  </TermsOfServiceTrigger>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-4">
          {/* <DesignThemeSwitcher /> */}
          <p className="text-center text-sm text-muted-foreground">{t("components.Footer.copyright", { year: currentYear })}</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
