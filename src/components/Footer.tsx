import ContactUsTrigger from "./documents/ContactUsTrigger";
import FAQTrigger from "./documents/FAQTrigger";
import PrivacyPolicyTrigger from "./documents/PrivacyPolicyTrigger";
import RefundPolicyTrigger from "./documents/RefundPolicyTrigger";
import TermsOfPurchaseTrigger from "./documents/TermsOfPurchaseTrigger";
import TermsOfServiceTrigger from "./documents/TermsOfServiceTrigger";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted py-8 mt-auto">
      <div className="container mx-auto px-5">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex flex-col justify-center mb-1 md:mb-0 w-fit">
            <img
              src="/logo-cpt.png"
              alt="Logo"
              className="h-[78px] sm:h-[83px] py-3 mx-auto"
              style={{ width: "fit-content" }}
            />
            <span className="-mt-3 ml-1 font-bold text-[23px] text-primary  sm:block bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent ">
              Computer Store
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8   mx-0 md:mx-5">
            <div>
              <h3 className="text-sm font-semibold mb-3">Hỗ trợ</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <FAQTrigger>
                    <span className="hover:text-primary transition-colors cursor-pointer">FAQ</span>
                  </FAQTrigger>
                </li>
                <li>
                  <ContactUsTrigger>
                    <span className="hover:text-primary transition-colors cursor-pointer">Liên hệ</span>
                  </ContactUsTrigger>
                </li>
                <li>
                  <RefundPolicyTrigger>
                    <span className="hover:text-primary transition-colors cursor-pointer">Chính sách hoàn tiền</span>
                  </RefundPolicyTrigger>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Điều khoản</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <PrivacyPolicyTrigger>
                    <span className="hover:text-primary transition-colors cursor-pointer">Chính sách bảo mật</span>
                  </PrivacyPolicyTrigger>
                </li>
                <li>
                  <TermsOfPurchaseTrigger>
                    <span className="hover:text-primary transition-colors cursor-pointer">Điều khoản mua hàng</span>
                  </TermsOfPurchaseTrigger>
                </li>
                <li>
                  <TermsOfServiceTrigger>
                    <span className="hover:text-primary transition-colors cursor-pointer">Điều khoản dịch vụ</span>
                  </TermsOfServiceTrigger>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-4">
          <p className="text-center text-sm text-muted-foreground">Copyright © {currentYear} Computer Store</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
