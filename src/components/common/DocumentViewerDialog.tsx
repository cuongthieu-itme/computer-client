import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentViewerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documentTitle: string;
  htmlContent?: string;
  dialogContentClassName?: string;
  width?: string; // e.g. "sm:max-w-2xl", "w-[800px]", etc.
  children?: React.ReactNode;
}

const DocumentViewerDialog: React.FC<DocumentViewerDialogProps> = ({
  isOpen,
  onOpenChange,
  documentTitle,
  htmlContent,
  dialogContentClassName,
  width,
  children,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-h-[90vh] flex flex-col p-0 overflow-hidden", width ?? "sm:max-w-2xl md:max-w-3xl lg:max-w-4xl", dialogContentClassName)}
        onEscapeKeyDown={() => onOpenChange(false)}
      >
        <DialogHeader className="p-6 pb-4 border-b sticky top-0 bg-background z-10 flex-shrink-0">
          <DialogTitle className="text-md md:text-lg flex items-center">
            <FileText className="w-5 h-5  mr-2 sm:mr-3 text-primary flex-shrink-0" />
            <span className="truncate">{documentTitle}</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-grow overflow-y-auto">
          <div
            className="px-6 pt-2 pb-4 max-w-none dark:prose-invert text-foreground 
            prose prose-sm 
            prose-h2:mt-3 prose-h2:mb-2
            prose-h3:mt-3 prose-h3:mb-2 prose-h4:mt-3 prose-h4:mb-2 
            prose-p:mt-0 prose-p:mb-2 
            prose-ul:mt-3 
            "
            {...(children
              ? { children }
              : htmlContent
              ? { dangerouslySetInnerHTML: { __html: htmlContent } }
              : {})}
          />
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t sticky bottom-0 bg-background z-10 flex-shrink-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Tutup
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewerDialog;
