import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ComputerProductDTO } from "@/data/computerProducts";
import { cn } from "@/lib/utils";
import { ArrowRight, Calendar, Cpu, Headphones, Keyboard, Laptop, Monitor, Mouse, Tag } from "lucide-react";

const STATIC_PLACEHOLDER_CARD_IMAGE = "/placeholder-card.png";

interface ProductCardProps {
  product: ComputerProductDTO;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const {
    productId,
    productType,
    productName,
    productDesc,
    warranty,
    pricePrefix,
    priceSuffix,
    imageUrl,
    isAvailable,
    tags,
  } = product;

  let displayImageUrl = imageUrl;
  if (!imageUrl.startsWith('http')) {
    displayImageUrl = `/${imageUrl}`;
  }

  let primaryBadgeText = productType;
  if (tags && tags.length > 0) {
    primaryBadgeText = tags[0].tagName;
  }
  primaryBadgeText = primaryBadgeText.length > 20 ? primaryBadgeText.substring(0, 17) + "..." : primaryBadgeText;

  let themeColorClass = "text-primary";
  let badgeBgClass = "bg-primary";
  let buttonColorClass = "bg-primary hover:bg-primary/90";
  let cardHoverBorderClass = "hover:border-primary/60";
  let iconComponent = <Monitor className="w-4 h-4" />;

  const lowerCaseProductType = productType.toLowerCase();

  if (lowerCaseProductType.includes("laptop")) {
    themeColorClass = "text-blue-500";
    badgeBgClass = "bg-blue-500";
    buttonColorClass = "bg-blue-500 hover:bg-blue-600 text-white";
    cardHoverBorderClass = "hover:border-blue-400";
    iconComponent = <Laptop className="w-4 h-4" />;
  } else if (lowerCaseProductType.includes("pc")) {
    themeColorClass = "text-purple-500";
    badgeBgClass = "bg-purple-500";
    buttonColorClass = "bg-purple-500 hover:bg-purple-600 text-white";
    cardHoverBorderClass = "hover:border-purple-400";
    iconComponent = <Cpu className="w-4 h-4" />;
  } else if (lowerCaseProductType.includes("linh kiện")) {
    themeColorClass = "text-green-500";
    badgeBgClass = "bg-green-500";
    buttonColorClass = "bg-green-500 hover:bg-green-600 text-white";
    cardHoverBorderClass = "hover:border-green-400";
    iconComponent = <Cpu className="w-4 h-4" />;
  } else if (lowerCaseProductType.includes("phụ kiện")) {
    themeColorClass = "text-amber-500";
    badgeBgClass = "bg-amber-500";
    buttonColorClass = "bg-amber-500 hover:bg-amber-600 text-white";
    cardHoverBorderClass = "hover:border-amber-400";

    if (productName.toLowerCase().includes("tai nghe")) {
      iconComponent = <Headphones className="w-4 h-4" />;
    } else if (productName.toLowerCase().includes("bàn phím")) {
      iconComponent = <Keyboard className="w-4 h-4" />;
    } else if (productName.toLowerCase().includes("chuột")) {
      iconComponent = <Mouse className="w-4 h-4" />;
    } else {
      iconComponent = <Tag className="w-4 h-4" />;
    }
  } else if (lowerCaseProductType.includes("màn hình")) {
    themeColorClass = "text-teal-500";
    badgeBgClass = "bg-teal-500";
    buttonColorClass = "bg-teal-500 hover:bg-teal-600 text-white";
    cardHoverBorderClass = "hover:border-teal-400";
    iconComponent = <Monitor className="w-4 h-4" />;
  }

  return (
    <Card
      className={cn(
        "h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl border group",
        cardHoverBorderClass,
        !isAvailable ? "opacity-60 bg-muted/30 cursor-not-allowed" : ""
      )}
    >
      <div className="relative">
        <AspectRatio ratio={16 / 9} className="bg-muted/10">
          <img
            src={displayImageUrl}
            alt={productName}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = STATIC_PLACEHOLDER_CARD_IMAGE;
            }}
          />
        </AspectRatio>

        <Badge
          className={cn(
            `absolute top-3 right-3 flex items-center gap-1.5 py-1.5 px-3 rounded-md text-white border-2 border-transparent shadow-md`,
            badgeBgClass
          )}
        >
          {iconComponent}
          <span className="font-semibold text-xs">{primaryBadgeText}</span>
        </Badge>

        {!isAvailable && (
          <div className="absolute inset-0 bg-slate-700/60 flex items-center justify-center backdrop-blur-sm">
            <Badge variant="destructive" className="text-sm p-2 shadow-lg">
              Hiện không có sẵn
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3 pt-4">
        <CardTitle className={cn("text-xl lg:text-2xl font-bold", themeColorClass)}>{productName}</CardTitle>
        <CardDescription className="text-sm leading-relaxed h-12 line-clamp-2 mt-0.5">{productDesc}</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow pt-2 pb-4 space-y-3 flex flex-col justify-end">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 shrink-0 opacity-70" />
          <span className="text-sm text-muted-foreground">{warranty}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.slice(1).map((tag) => (
            <Badge key={tag.tagId} variant="secondary" className="text-xs">
              {tag.tagName}
            </Badge>
          ))}
        </div>

        <div className="mt-3">
          <p className="text-lg font-bold">
            {pricePrefix} {priceSuffix}
          </p>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4">
        <Button
          className={cn("w-full gap-2", buttonColorClass)}
          disabled={!isAvailable}
        >
          <span>Xem chi tiết</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
