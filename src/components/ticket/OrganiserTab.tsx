import React from "react";
import DOMPurify from "dompurify";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { ExternalLink as ExternalLinkIcon, Phone as PhoneIcon, Mail as MailIcon, MapPin as MapPinIcon } from "lucide-react";
import { TicketProfileDataDTO } from "@/types/api/ticket.api";
import { cn } from "@/lib/utils";

interface LucideIconRendererProps {
  name: string;
  className?: string;
  size?: number;
}

interface OrganiserTabProps {
  ticketGroupData: TicketProfileDataDTO;
  LucideIconRenderer: React.FC<LucideIconRendererProps>;
}

const OrganiserTab: React.FC<OrganiserTabProps> = ({ ticketGroupData, LucideIconRenderer }) => {
  if (!ticketGroupData) {
    return <div className="text-center py-10 text-muted-foreground">Memuatkan butiran penganjur...</div>; {/* Translated */}
  }

  const contactInfo = [
    { icon: PhoneIcon, label: "Telefon", value: ticketGroupData.organiserContact }, // Translated
    { icon: MailIcon, label: "Emel", value: ticketGroupData.organiserEmail, isEmail: true }, // Translated
    { icon: ExternalLinkIcon, label: "Laman Web", value: ticketGroupData.organiserWebsite, isLink: true }, // Translated
    { icon: MapPinIcon, label: "Alamat", value: ticketGroupData.organiserAddress, fullWidth: true }, // Translated
  ].filter(info => info.value && info.value !== "-");

  const SectionTitle: React.FC<{ iconName: string; children: React.ReactNode }> = ({ iconName, children }) => (
    <span className="text-md sm:text-lg font-semibold mb-2 text-foreground flex items-center">
      <LucideIconRenderer name={iconName} className="mr-2 h-5 w-5 text-primary/80 flex-shrink-0" />
      {children}
    </span>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="overflow-hidden shadow-sm border-border/50">
        <CardHeader className="p-4 sm:p-5 md:p-6 bg-muted/30 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0 border border-primary/20">
              <LucideIconRenderer name="Building" className="w-8 h-8 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-primary">{ticketGroupData.organiserName || "Maklumat Penganjur"}</h2> {/* Translated */}
              {ticketGroupData.organiserAddress && (
                <CardDescription className="text-sm text-muted-foreground mt-1">{ticketGroupData.organiserAddress}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 md:p-6 space-y-5">
          {ticketGroupData.organiserDescriptionHtml && (
            <div>
              <SectionTitle iconName="Info">Mengenai Penganjur</SectionTitle> {/* Translated */}
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
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ticketGroupData.organiserDescriptionHtml) }}
              />
            </div>
          )}

          <div className="border-t border-border/70 pt-5">
            <SectionTitle iconName="ClipboardList">Maklumat Hubungan</SectionTitle> {/* Translated */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm mt-4">
              {contactInfo.map((info, index) => {
                if (!info.value) return null;
                const IconComponent = info.icon;
                return (
                  <div key={index} className={cn("flex items-start gap-2.5", info.fullWidth && "sm:col-span-2")}>
                    <IconComponent className="w-4 h-4 text-primary/90 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-muted-foreground">{info.label}</p>
                      {info.isLink ? (
                        <a
                          href={info.value.startsWith("http") ? info.value : `//${info.value}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground hover:text-primary hover:underline break-all"
                        >
                          {info.value}
                        </a>
                      ) : info.isEmail ? (
                        <a href={`mailto:${info.value}`} className="text-foreground hover:text-primary hover:underline break-all">
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-foreground break-words">{info.value}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

            {ticketGroupData.operatingHours && ticketGroupData.operatingHours !== "-" ? (
              <div className="border-t border-border/70 pt-5">
              <SectionTitle iconName="Clock">Waktu Operasi</SectionTitle> {/* Translated */}
              <p className="text-sm text-foreground/80 mt-2">
                {ticketGroupData.operatingHours}
              </p>
              </div>
            ) : null}

          {ticketGroupData.organiserFacilities && ticketGroupData.organiserFacilities.length > 0 && (
            <div className="border-t border-border/70 pt-5">
              <SectionTitle iconName="ListChecks">Kemudahan</SectionTitle> {/* Translated */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5 text-sm text-foreground/80 mt-3">
                {ticketGroupData.organiserFacilities.map((facility, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    <span>{facility}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganiserTab;
