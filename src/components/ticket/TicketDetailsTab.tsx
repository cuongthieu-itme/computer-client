import React from "react";
import DOMPurify from "dompurify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketProfileDataDTO, TicketDetailItemDTO } from "@/types/api/ticket.api";
import { cn } from "@/lib/utils";

interface LucideIconRendererProps {
  name: string;
  className?: string;
  size?: number;
}

interface TicketDetailsTabProps {
  ticketGroupData: TicketProfileDataDTO;
  LucideIconRenderer: React.FC<LucideIconRendererProps>;
}

const TicketDetailsTab: React.FC<TicketDetailsTabProps> = ({ ticketGroupData, LucideIconRenderer }) => {
  if (!ticketGroupData) {
    return <div className="text-center py-10 text-muted-foreground">Memuatkan butiran...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {ticketGroupData.ticketDetails &&
        ticketGroupData.ticketDetails
          .filter((detail) => detail.displayFlag)
          .map((detail: TicketDetailItemDTO) => (
            <Card key={detail.ticketDetailId} className="overflow-hidden shadow-sm border-border/50">
              <CardHeader className="bg-muted/30 py-3 sm:py-4 px-4 sm:px-5">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-primary">
                  <LucideIconRenderer name={detail.titleIcon} className="text-primary flex-shrink-0" size={22} />
                  <span>{detail.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-5 px-4 sm:px-5 text-sm sm:text-base">
                <div
                  className={cn(
                    "prose prose-sm max-w-none dark:prose-invert",
                    "prose-p:my-2",
                    "prose-ul:my-2 prose-ul:pl-5 prose-li:my-1 prose-li:marker:text-muted-foreground",
                    "prose-ol:my-2 prose-ol:pl-5 prose-li:my-1",
                    "prose-headings:font-semibold prose-headings:text-foreground/90",
                    "prose-h1:text-xl sm:prose-h1:text-2xl prose-h1:mb-3 prose-h1:mt-4",
                    "prose-h2:text-lg sm:prose-h2:text-xl prose-h2:mb-2 prose-h2:mt-3",
                    "prose-h3:text-base sm:prose-h3:text-lg prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-4",
                    "prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80"
                  )}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(detail.rawHtml) }}
                />
              </CardContent>
            </Card>
          ))}

      <Card className="overflow-hidden shadow-sm border-border/50">
        <CardHeader className="bg-muted/30 py-3 sm:py-4 px-4 sm:px-5">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-primary">
            <LucideIconRenderer name="MapPin" className="text-primary flex-shrink-0" size={22} />
            <span>Lokasi</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          <div className="aspect-[16/9] bg-muted rounded-b-lg sm:rounded-lg overflow-hidden">
            <iframe
              src={ticketGroupData.locationMapEmbedUrl || "https://placehold.co/600x400/E0E0E0/757575?text=Peta+Tidak+Tersedia&font=inter"}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title={`peta lokasi ${ticketGroupData.groupName}`}
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            ></iframe>
          </div>
          {ticketGroupData.locationAddress && (
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground px-4 sm:px-5 pb-4 sm:pb-5">{ticketGroupData.locationAddress}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketDetailsTab;
