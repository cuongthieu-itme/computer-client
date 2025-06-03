import React, { useState, cloneElement, isValidElement, ReactNode } from "react";
import DocumentViewerDialog from "@/components/common/DocumentViewerDialog";
import { cn } from "@/lib/utils";

const termsOfPurchaseHtmlContent = `
  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">1. Perlindungan dan Kerahsiaan Maklumat Peribadi</h2>
    <p class="mb-2">
      Maklumat peribadi yang dikongsikan oleh pembeli, termasuk nombor kad pengenalan (MyKad) atau nombor pasport, akan digunakan bagi tujuan:
    </p>
    <ul class=" mb-2">
      <li>Menentukan kewarganegaraan atau bukan kewarganegaraan untuk pengiraan harga tiket.</li>
      <li>Menentukan kategori umur pembeli untuk klasifikasi harga tiket.</li>
    </ul>
    <p class="mb-2">
      Taman Botani Diraja Johor Istana Besar komited untuk melindungi data peribadi pembeli mengikut Akta Perlindungan Data Peribadi 2010 (PDPA) atau mana-mana perundangan berkaitan yang terpakai.
    </p>
    <ul class="">
      <li>Maklumat peribadi tidak akan dikongsi dengan pihak ketiga tanpa persetujuan kecuali sebagaimana yang diperlukan oleh undang-undang.</li>
      <li>Prosedur keselamatan yang ketat dilaksanakan untuk memastikan maklumat pembeli kekal sulit dan selamat.</li>
    </ul>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">2. Ketepatan Maklumat Tiket</h2>
    <p class="mb-2">
      Pembeli bertanggungjawab untuk memastikan butiran pembelian tiket adalah tepat sebelum mengklik butang bayaran, termasuk:
    </p>
    <ul class=" mb-2">
      <li>Tarikh dan hari lawatan</li>
      <li>Kategori tiket (dewasa, kanak-kanak, warga emas, dll.)</li>
      <li>Kuantiti tiket</li>
    </ul>
    <p class="mb-2">
      Bagi bayaran melalui kad kredit, kad debit atau perbankan internet seperti Maybank2U atau lain-lain bank, pembeli hendaklah memastikan pembeli adalah pemilik akaun dan maklum mengenai pembayaran tersebut.
    </p>
    <p>
      Sebarang kesilapan dalam pengisian butiran maklumat adalah muktamad dan tidak boleh dipinda selepas transaksi selesai.
    </p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">3. Pengesahan Pembelian</h2>
    <p class="mb-2">
      Selepas penerimaan pembayaran, pembeli akan menerima resit dan tiket yang tertera QR Code melalui emel yang telah didaftarkan.
    </p>
    <p>
      Sila bawa bersama resit dan tiket tersebut (hanya tunjuk resit melalui handphone dibenarkan) semasa berkunjung ke Taman Botani Diraja Johor Istana Besar bagi mengelakkan sebarang permasalahan.
    </p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">4. Polisi Bayaran Balik</h2>
    <p class="mb-2">
      Semua transaksi adalah muktamad. Kesemua bayaran yang telah diterima tidak akan dibayar balik kepada pembeli atas kesilapan memilih tarikh, kategori tiket, atau kuantiti kecuali di dalam keadaan tertentu yang akan ditentukan oleh pihak pengurusan seperti masalah teknikal laman web/sistem atau masalah berkaitan sistem perbankan.
    </p>
    <p class="mb-2">
      Proses bayaran balik adalah dalam tempoh 14 hari dari tarikh masalah dikenalpasti. Bayaran balik hanya akan dilaksanakan setelah bukti pembayaran dikemukakan kepada pihak pengurusan.
    </p>
    <p class="mb-2">Dokumen yang perlu disertakan:</p>
    <ul class="">
      <li>Surat permohonan dari penama/penuntut.</li>
      <li>Resit asal bayaran atau perakuan sumpah jika ada.</li>
      <li>Penyata bank kemasukkan pembayaran tersebut.</li>
      <li>Salinan buku bank/penyata bank pemohon.</li>
      <li>Salinan kad pengenalan pemohon.</li>
      <li>Lain-lain dokumen yang menjelaskan bahawa bayaran tersebut perlu dipulangkan.</li>
    </ul>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">5. Polisi Menukar Tarikh Tiket</h2>
    <p class="mb-2">
      Perkhidmatan pembelian tiket secara dalam talian ini beroperasi atas polisi penukaran tarikh adalah tidak dibenarkan.
    </p>
    <p>
      Sekiranya pengunjung tidak dapat hadir pada tarikh yang telah dijadualkan, penukaran tarikh adalah tidak dibenarkan dan tiada pulangan bayaran akan dibuat. Dengan meneruskan pembelian, pembeli dianggap telah membaca, memahami, dan bersetuju dengan terma dan syarat ini.
    </p>
  </section>

  <section class="mb-6">
    <h2 class="text-xl font-semibold mb-2 text-primary/90">6. Had Tanggungjawab</h2>
    <p class="mb-2">
      Pihak pengurusan tidak menjamin bahawa fungsi yang terdapat di dalam laman web ini tidak akan terganggu atau bebas dari sebarang kesalahan.
    </p>
    <p>
      Pihak pengurusan juga tidak akan bertanggungjawab atas sebarang kerosakan, kemusnahan, gangguan perkhidmatan, kerugian, kehilangan simpanan atau kesan sampingan yang lain ketika mengoperasikan atau kegagalan mengoperasikan laman web ini, akses tanpa kebenaran, kenyataan atau tindakan pihak ketiga di laman web ini atau perkara-perkara lain yang berkaitan dengan laman web ini.
    </p>
  </section>
`;

const termsOfPurchaseTitle = "Terma Pembelian";

interface TermsOfPurchaseTriggerProps {
  children: ReactNode;
  className?: string;
}

const TermsOfPurchaseTrigger: React.FC<TermsOfPurchaseTriggerProps> = ({ children, className }) => {
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
        documentTitle={termsOfPurchaseTitle}
        htmlContent={termsOfPurchaseHtmlContent}
      />
    </>
  );
};

export default TermsOfPurchaseTrigger;
