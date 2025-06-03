import React, { useState, cloneElement, isValidElement, ReactNode } from "react";
import DocumentViewerDialog from "@/components/common/DocumentViewerDialog";
import { cn } from "@/lib/utils";

// -a. Tiket yang telah dibeli tidak boleh dibatalkan atau ditukar tarikh.
// b. Jika lawatan dibatalkan atas sebab kecemasan (banjir, penutupan
// rasmi), permohonan refund dihantar melalui emel sekurang-kurangnya 3
// hari sebelum tarikh lawatan, disertakan bukti pembayaran.
// c. Sekiranya dipersetujui, refund akan diproses dalam 14 hari bekerja ke
// akaun asal.
// d. Tiada caj tambahan dikenakan untuk pemprosesan refund.
// Selanjutnya Boleh rujuk dalam dokumen “PRIVACY POLICY”

const contactUsHtmlContent = `
    <section>
            Pejabat Setiausaha Kerajaan Johor<br />
            Bahagian Kerajaan Tempatan<br />
            Aras 2, Bangunan Dato’ Abdul Rahman Andak<br />
            Kota Iskandar, 79503 Iskandar Puteri, Johor<br />
            Pejabat Am: 07-2666380<br />
            <br />
            
            E-mel: <span class="text-primary">sukkt@johor.gov.my</span><br />
            Laman Web: <span class="text-primary">www.johor.gov.my/sukkt</span>
    </section>
`;

const contactUsTitle = "Hubungi Kami"; // Translated

interface ContactUsTriggerProps {
  children: ReactNode;
  className?: string;
}

const ContactUsTrigger: React.FC<ContactUsTriggerProps> = ({ children, className }) => {
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
        width="max-w-[420px]"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        documentTitle={contactUsTitle}
        htmlContent={contactUsHtmlContent}
      />
    </>
  );
};

export default ContactUsTrigger;
