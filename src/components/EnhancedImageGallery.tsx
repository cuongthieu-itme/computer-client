import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTicketGroupImageUrl } from "@/lib/imageUtils";

export interface GalleryImage {
  groupGalleryId: number;
  attachmentName?: string;
  uniqueExtension: string;
}

interface EnhancedImageGalleryProps {
  images: GalleryImage[];
  ticketGroupName: string;
  ticketGroupId?: string;
  useHardcodedDemoImages?: boolean;
}

const STATIC_PLACEHOLDER_ERROR_IMAGE = "/placeholder-error.png"; // Define this once

const EnhancedImageGallery: React.FC<EnhancedImageGalleryProps> = ({
  images: apiImages,
  ticketGroupName,
  ticketGroupId,
  useHardcodedDemoImages = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State to track images that failed to load, using their unique identifier (groupGalleryId)
  const [failedImageIds, setFailedImageIds] = useState<Set<number>>(new Set());

  const getDemoImages = useCallback((id?: string): GalleryImage[] => {
    if (!id) return [];
    const demoImagesArray: GalleryImage[] = [];
    const basePath = "/";

    if (id === "2") {
      // Zoo
      for (let i = 1; i <= 5; i++) {
        demoImagesArray.push({
          groupGalleryId: 1000 + i,
          uniqueExtension: `${basePath}zoo${i}.jpg`, // Assuming correct format is .jpg
          attachmentName: `Zoo Image ${i}`,
        });
      }
    } else if (id === "1") {
      // Taman Botani
      for (let i = 1; i <= 7; i++) {
        demoImagesArray.push({
          groupGalleryId: 2000 + i,
          uniqueExtension: `${basePath}tamanbotani${i}.jpg`, // Assuming correct format is .jpg
          attachmentName: `Taman Botani Image ${i}`,
        });
      }
    }
    return demoImagesArray;
  }, []);

  const finalImages = useMemo(() => {
    if (useHardcodedDemoImages && ticketGroupId) {
      return getDemoImages(ticketGroupId);
    }
    return apiImages;
  }, [useHardcodedDemoImages, ticketGroupId, apiImages, getDemoImages]);

  const imageIdSignature = useMemo(() => {
    return finalImages.map((img) => img.groupGalleryId).join(",");
  }, [finalImages]);

  useEffect(() => {
    setCurrentIndex(0);
    setFailedImageIds(new Set()); // Reset failed images when the image set changes
  }, [imageIdSignature]);

  const handleImageError = (imageId: number, event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Prevent potential infinite loop if the placeholder itself is broken
    if (event.currentTarget.src === STATIC_PLACEHOLDER_ERROR_IMAGE) {
      return;
    }
    setFailedImageIds((prev) => new Set(prev).add(imageId));
    event.currentTarget.src = STATIC_PLACEHOLDER_ERROR_IMAGE; // Set to a known good static placeholder
  };

  if (!finalImages || finalImages.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64 bg-muted/30 rounded-lg border border-dashed">
        <p className="text-muted-foreground text-sm sm:text-base">
          {useHardcodedDemoImages ? "No demo images configured for this ID." : "No images available for this gallery."}
        </p>
      </div>
    );
  }

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? finalImages.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === finalImages.length - 1 ? 0 : prevIndex + 1));
  };

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const currentImage = finalImages[currentIndex];

  const getDisplayImageUrl = (image: GalleryImage | undefined): string => {
    if (!image) return STATIC_PLACEHOLDER_ERROR_IMAGE;
    if (failedImageIds.has(image.groupGalleryId)) {
      return STATIC_PLACEHOLDER_ERROR_IMAGE;
    }
    if (useHardcodedDemoImages && image.uniqueExtension.startsWith("/")) {
      return image.uniqueExtension;
    }
    return getTicketGroupImageUrl(image.uniqueExtension, image.attachmentName || ticketGroupName);
  };

  const mainImageUrl = getDisplayImageUrl(currentImage);

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* Main Image Display */}
      <div className="relative group aspect-video bg-muted/30 rounded-lg overflow-hidden border shadow-sm">
        <img
          src={mainImageUrl}
          alt={currentImage?.attachmentName || `${ticketGroupName} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 ease-in-out group-hover:opacity-90"
          onClick={() => openModal(currentIndex)}
          onError={(e) => currentImage && handleImageError(currentImage.groupGalleryId, e)}
        />

        <div
          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          onClick={() => openModal(currentIndex)}
        >
          <ZoomIn className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
        </div>

        {finalImages.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 transform bg-background/70 hover:bg-background/90 h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 transform bg-background/70 hover:bg-background/90 h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {finalImages.length > 1 && (
        <div className="relative">
          <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-muted/20">
            {finalImages.map((image, index) => {
              const thumbnailUrl = getDisplayImageUrl(image);
              return (
                <div
                  key={image.groupGalleryId}
                  className={cn(
                    "flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-md border-2 overflow-hidden cursor-pointer transition-all duration-200 hover:opacity-100 hover:border-primary/80",
                    index === currentIndex ? "border-primary opacity-100" : "border-border opacity-70"
                  )}
                  onClick={() => handleThumbnailClick(index)}
                >
                  <img
                    src={thumbnailUrl}
                    alt={`Thumbnail ${image.attachmentName || index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => handleImageError(image.groupGalleryId, e)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-black/80 backdrop-blur-sm" />
          <DialogContent className="p-0 w-full max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl h-auto max-h-[90vh] bg-transparent border-0 shadow-none flex flex-col items-center justify-center outline-none">
            <DialogHeader className="sr-only">
              {" "}
              {/* Hide header visually */}
              <DialogTitle>-</DialogTitle>
              {/* You can also add a DialogDescription here if needed, also with sr-only */}
            </DialogHeader>
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={mainImageUrl} // Uses the same current main image URL
                alt={currentImage?.attachmentName || `${ticketGroupName} - Image ${currentIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                onError={(e) => currentImage && handleImageError(currentImage.groupGalleryId, e)}
              />
              {finalImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-1 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 transform text-white/70 hover:text-white hover:bg-black/30 h-10 w-10 sm:h-12 sm:w-12 rounded-full"
                    onClick={goToPrevious}
                    aria-label="Previous image in modal"
                  >
                    <ArrowLeftCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 transform text-white/70 hover:text-white hover:bg-black/30 h-10 w-10 sm:h-12 sm:w-12 rounded-full"
                    onClick={goToNext}
                    aria-label="Next image in modal"
                  >
                    <ArrowRightCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                  </Button>
                </>
              )}
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 sm:top-2 sm:right-2 md:top-4 md:right-4 text-white/70 hover:text-white hover:bg-black/30 h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                  aria-label="Close image modal"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </DialogClose>
            </div>
            {finalImages.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
                {currentIndex + 1} / {finalImages.length}
              </div>
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
};

export default EnhancedImageGallery;
