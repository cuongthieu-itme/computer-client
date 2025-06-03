import React, { useState, cloneElement, isValidElement, ReactNode } from "react";
import DocumentViewerDialog from "@/components/common/DocumentViewerDialog";
import { cn } from "@/lib/utils";

const refundPolicyHtmlContent = `
    <section class="mb-0">
        <p> 1) Tiket yang telah dibeli tidak boleh dibatalkan atau ditukar tarikh.</p>
        <p>
           2) Jika lawatan dibatalkan atas sebab kecemasan (banjir, penutupan
rasmi), permohonan refund dihantar melalui emel sekurang-kurangnya 3
hari sebelum tarikh lawatan, disertakan bukti pembayaran.
        </p>
        <p>
           3) Sekiranya dipersetujui, refund akan diproses dalam 14 hari bekerja ke
akaun asal.
        </p>
        <p>
           4) Tiada caj tambahan dikenakan untuk pemprosesan refund.
        </p>
        <p>
           5) Selanjutnya Boleh rujuk dalam dokumen “DASAR PRIVASI”.
        </p>
    </section>
`;

const refundPolicyTitle = "Polisi Bayaran Balik"; // Translated

interface RefundPolicyTriggerProps {
  children: ReactNode;
  className?: string;
}

const RefundPolicyTrigger: React.FC<RefundPolicyTriggerProps> = ({ children, className }) => {
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
        width="w-[550px]"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        documentTitle={refundPolicyTitle}
        htmlContent={refundPolicyHtmlContent}
      />
    </>
  );
};

export default RefundPolicyTrigger;
