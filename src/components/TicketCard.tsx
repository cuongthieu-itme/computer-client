import { Link } from "react-router-dom";
import { Calendar, MapPin, Tag, ArrowRight, Star, Ticket as TicketIcon, Link2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { TicketGroupDTO } from "@/types/api/ticket.api";
import { getTicketGroupImageUrl } from "@/lib/imageUtils";
import { cn } from "@/lib/utils"; // Assuming you have cn utility

// --- TEMPORARY FOR PRESENTATION ---
// Set this to true to use hardcoded cover images, false to use API-driven images via uniqueExtension
const USE_HARDCODED_COVER_IMAGES = true;
const STATIC_PLACEHOLDER_CARD_IMAGE = "/placeholder-card.png"; // Add a generic card placeholder in /public

interface TicketCardProps {
  ticketGroup: TicketGroupDTO;
}

const TicketCard = ({ ticketGroup }: TicketCardProps) => {
  const {
    ticketGroupId,
    groupType,
    groupName,
    groupDesc,
    operatingHours,
    pricePrefix,
    priceSuffix,
    uniqueExtension, // This will be used if USE_HARDCODED_COVER_IMAGES is false
    isActive,
    tags,
  } = ticketGroup;

  let imageUrl: string;

  if (USE_HARDCODED_COVER_IMAGES) {
    // Determine hardcoded image based on ticketGroupId
    // Ensure these IDs match what your actual ticketGroupData will have.
    // For example, if your Zoo Johor has ticketGroupId = 1.
    // Make sure zoo1.jpg, tamanbotani1.jpg are in your /public folder.
    switch (
      ticketGroupId.toString() // Convert ticketGroupId to string for reliable comparison
    ) {
      case "2": // Assuming '1' is for Zoo
        imageUrl = "/zoo1.jpg"; // Path relative to the public folder
        break;
      case "1": // Assuming '2' is for Taman Botani
        imageUrl = "/tamanbotani1.jpg"; // Path relative to the public folder
        break;
      // Add more cases for other ticketGroupIds as needed for your presentation
      // case "3":
      //   imageUrl = "/another-cover.jpg";
      //   break;
      default:
        // Fallback for hardcoded mode if ID doesn't match, or use original logic
        // For presentation, a distinct placeholder might be better if an ID is not covered.
        // imageUrl = STATIC_PLACEHOLDER_CARD_IMAGE;
        // Or fallback to the original API-driven image logic:
        imageUrl = getTicketGroupImageUrl(uniqueExtension, groupName);
        break;
    }
  } else {
    // Original logic: Use uniqueExtension from API data
    imageUrl = getTicketGroupImageUrl(uniqueExtension, groupName);
  }

  // Determine primary badge text: use groupType, fallback to first tag if groupType is generic like "ongoing"
  let primaryBadgeText = groupType;
  if (groupType.toLowerCase() === "ongoing" && tags && tags.length > 0) {
    primaryBadgeText = tags[0].tagName;
  }
  primaryBadgeText = primaryBadgeText.length > 20 ? primaryBadgeText.substring(0, 17) + "..." : primaryBadgeText;

  // Determine a highlight text (e.g., "Popular", "New", or a secondary tag)
  // This is an example; you might have specific logic for highlights
  // const highlightText = tags && tags.length > 1 ? tags[1].tagName : (groupType === "event" ? "Special Event" : null);

  // Basic theming based on groupType or first tag - can be expanded
  let themeColorClass = "text-primary";
  let badgeBgClass = "bg-primary";
  let buttonColorClass = "bg-primary hover:bg-primary/90";
  let cardHoverBorderClass = "hover:border-primary/60";
  let iconComponent = <TicketIcon className="w-4 h-4" />;

  const lowerCaseGroupType = groupType.toLowerCase();
  const firstTagNameLower = tags?.[0]?.tagName.toLowerCase();

  // Simplified theming based on known ticketGroupIds for demo, can be expanded
  if (ticketGroupId.toString() === "2" || lowerCaseGroupType.includes("zoo") || firstTagNameLower?.includes("zoo")) {
    themeColorClass = "text-primary"; // Make sure 'text-primary' is defined in tailwind.config.ts
    badgeBgClass = "bg-primary"; // Make sure 'bg-primary' is defined
    buttonColorClass = "bg-primary hover:bg-primary/90 dark:text-white";
    cardHoverBorderClass = "hover:border-primary/60"; // Make sure 'border-zoo' is defined or use a generic color
    iconComponent = <MapPin className="w-4 h-4" />;
  } else if (ticketGroupId.toString() === "1" || lowerCaseGroupType.includes("botanic") || firstTagNameLower?.includes("botanic")) {
    themeColorClass = "text-botanic"; // Make sure 'text-botanic' is defined
    badgeBgClass = "bg-botanic"; // Make sure 'bg-botanic' is defined
    buttonColorClass = "bg-botanic hover:bg-botanic/90 dark:text-white";
    cardHoverBorderClass = "hover:border-botanic/60"; // Make sure 'border-botanic' is defined
    iconComponent = <Star className="w-4 h-4" />; // Example: different icon for botanic
  } else if (lowerCaseGroupType.includes("event") || firstTagNameLower?.includes("event")) {
    themeColorClass = "text-primary";
    badgeBgClass = "bg-primary";
    buttonColorClass = "bg-primary hover:bg-primary/90 dark:text-white";
    cardHoverBorderClass = "hover:border-primary/60";
    iconComponent = <Star className="w-4 h-4" />;
  }
  // Add more conditions for other types/tags if needed

  return (
    <Card
      className={cn(
        "h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl border group",
        cardHoverBorderClass,
        !isActive ? "opacity-60 bg-muted/30 cursor-not-allowed" : ""
      )}
    >
      <div className="relative">
        <AspectRatio ratio={16 / 9} className="bg-muted/10">
          {" "}
          {/* Added a light bg for aspect ratio */}
          <img
            src={imageUrl}
            alt={groupName}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // More robust fallback: if hardcoded fails, try API, then general placeholder
              if (USE_HARDCODED_COVER_IMAGES && e.currentTarget.src !== STATIC_PLACEHOLDER_CARD_IMAGE) {
                // If hardcoded image failed, maybe try the API one as a secondary fallback for the demo
                // Or directly go to a very generic placeholder
                const apiAttemptUrl = getTicketGroupImageUrl(uniqueExtension, groupName);
                if (apiAttemptUrl !== e.currentTarget.src && apiAttemptUrl !== STATIC_PLACEHOLDER_CARD_IMAGE) {
                  e.currentTarget.src = apiAttemptUrl; // Try API image
                } else {
                  e.currentTarget.src = STATIC_PLACEHOLDER_CARD_IMAGE; // Final fallback
                }
              } else if (e.currentTarget.src !== STATIC_PLACEHOLDER_CARD_IMAGE) {
                e.currentTarget.src = STATIC_PLACEHOLDER_CARD_IMAGE; // General fallback for API images
              }
            }}
          />
        </AspectRatio>

        {/* Primary Tag Badge */}
        <Badge
          className={cn(
            `absolute top-3 right-3 flex items-center gap-1.5 py-1.5 px-3 rounded-md text-primary-foreground border-2 border-transparent shadow-md`,
            badgeBgClass // Apply dynamic background class
          )}
        >
          {iconComponent}
          <span className="font-semibold text-xs">{primaryBadgeText}</span>
        </Badge>

        {!isActive && (
          <div className="absolute inset-0 bg-slate-700/60 flex items-center justify-center backdrop-blur-sm">
            <Badge variant="destructive" className="text-sm p-2 shadow-lg">
              Tidak Tersedia Buat Masa Ini {/* Translated */}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3 pt-4">
        <CardTitle className={cn("text-xl lg:text-2xl font-bold", themeColorClass)}>{groupName}</CardTitle>
        <CardDescription className="text-sm leading-relaxed h-12 line-clamp-2 mt-0.5">{groupDesc}</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow pt-2 pb-4 space-y-3 flex flex-col justify-end">
        {ticketGroupId.toString() === "1" && ( // Changed to string comparison
          <div className="flex items-center">
            <Link2 className="w-4 h-4 mr-4 shrink-0 opacity-80" />
            <a
              href="https://tamanbotanidiraja.johor.gov.my/koleksi-botani/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline"
              aria-label="Buka pautan luar" // Translated
            >
              Koleksi Botani - Taman Botani
            </a>
          </div>
        )}
        {ticketGroupId.toString() === "2" && ( // Changed to string comparison
          <div className="flex items-center">
            <Link2 className="w-4 h-4 mr-4 shrink-0 opacity-80" />
            <a
              href="https://zoo.johor.gov.my/main-page/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline"
              aria-label="Buka pautan luar" // Translated
            >
              Zoo Johor - Laman Utama
            </a>
          </div>
        )}

        <div className="flex flex-col space-y-1">
          {ticketGroupId === 1 ? (
            <>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-4 shrink-0" />
                <span>Isnin – Jumaat: 2:00PM – 6:00PM </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="w-4 h-4 mr-4 shrink-0" />
                <span>Sabtu – Ahad: 9:00AM – 6:00PM</span>
              </div>

              <div className="pt-2 flex items-center text-sm text-muted-foreground">
                <div className="w-4 h-4 mr-4 shrink-0" />
                <span>Kemasukan Akhir 5:00PM</span>
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <div className="w-4 h-4 mr-4 shrink-0" />
                <span>Tutup setiap Selasa & cuti umum tertentu.</span>
              </div>
            </>
          ) : ticketGroupId === 2 ? (
            <>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-4 shrink-0" />
                  <span>8:30/9:00AM – 6:00PM</span>
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-4 h-4 mr-4 shrink-0" />
                  <span>Kemasukan Akhir 5:00PM</span>
                </div>

                <div className="pt-2 flex items-center text-sm text-muted-foreground">
                  <div className="w-4 h-4 mr-4 shrink-0" />
                  <span>Selasa: Tutup (Kec. Cuti Sekolah)</span>
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-4 h-4 mr-4 shrink-0" />
                  <span>Jumaat: Rehat 12:30PM – 2:00PM</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-4 shrink-0" />
              <span>{operatingHours || "Operating hours not available"}</span>
            </div>
          )}
        </div>

        <div className="flex items-center pt-2">
          <Tag className={cn("w-4 h-4 mr-4 shrink-0", themeColorClass)} />
          <span className="text-lg font-semibold text-foreground">{pricePrefix}</span>
          {priceSuffix && <span className="text-xs text-muted-foreground ml-1">/ {priceSuffix}</span>}
        </div>
      </CardContent>

      <CardFooter className="mt-auto p-4">
        <Link to={`/tickets/${ticketGroupId}`} className="w-full" aria-disabled={!isActive} tabIndex={!isActive ? -1 : undefined}>
          <Button
            className={cn("w-full text-base py-3 font-semibold", buttonColorClass)}
            disabled={!isActive}
            aria-label={isActive ? `Lihat butiran untuk ${groupName}` : `${groupName} tidak tersedia buat masa ini`} // Translated
          >
            {isActive ? "Lihat Butiran" : "Tidak Tersedia"} {/* Translated */}
            {isActive && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TicketCard;
