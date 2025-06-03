import React from 'react';
import TicketCard from './TicketCard';
import { TicketGroupDTO } from '@/types/api/ticket.api';
import { AlertCircle, Ticket as TicketIconLucide } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface TicketDisplaySectionProps {
  ticketGroups?: TicketGroupDTO[];
  isLoading: boolean;
  error: Error | null;
}

const TicketDisplaySection: React.FC<TicketDisplaySectionProps> = ({ ticketGroups, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, index) => ( // Show 3 skeleton cards
          <Card key={index} className="h-full flex flex-col overflow-hidden shadow-md">
            <AspectRatio ratio={16 / 9} className="bg-muted animate-pulse rounded-t-lg" />
            <CardHeader className="pb-3 pt-4">
              <div className="h-6 w-3/4 bg-muted animate-pulse rounded-md mb-2"></div> {/* Skeleton for Title */}
              <div className="h-4 w-full bg-muted animate-pulse rounded-md"></div> {/* Skeleton for Description line 1 */}
              <div className="h-4 w-5/6 bg-muted animate-pulse rounded-md mt-1"></div> {/* Skeleton for Description line 2 */}
            </CardHeader>
            <CardContent className="flex-grow pt-2 pb-4 space-y-3">
              <div className="h-4 w-full bg-muted animate-pulse rounded-md"></div> {/* Skeleton for Operating Hours */}
              <div className="h-6 w-1/2 bg-muted animate-pulse rounded-md"></div> {/* Skeleton for Price */}
            </CardContent>
            <CardFooter className="p-4">
              <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div> {/* Skeleton for Button */}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    // Display an error message if fetching fails
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-destructive/10 border border-destructive/30 rounded-lg p-6 shadow-lg">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-xl font-semibold text-destructive mb-2">Gagal Memuatkan Tiket</h3> {/* Translated */}
        <p className="text-muted-foreground mb-4">
          Kami menghadapi ralat semasa cuba mendapatkan maklumat tiket. Sila cuba muat semula halaman atau semak semula kemudian. {/* Translated */}
        </p>
        <p className="text-xs text-destructive/80">Butiran ralat: {error.message}</p> {/* Partially translated */}
      </div>
    );
  }

  if (!ticketGroups || ticketGroups.length === 0) {
    // Display a message if no tickets are available after loading and no error
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-muted/30 border border-border rounded-lg p-8 shadow-md">
        <TicketIconLucide className="w-16 h-16 text-muted-foreground mb-6" strokeWidth={1.5} />
        <h3 className="text-2xl font-semibold text-foreground mb-3">Tiada Tiket Tersedia Buat Masa Ini</h3> {/* Translated */}
        <p className="text-muted-foreground max-w-md">
          Nampaknya tiada tiket yang disenaraikan pada masa ini. Sila semak semula tidak lama lagi untuk acara dan tarikan baharu! {/* Translated */}
        </p>
      </div>
    );
  }

  // Render the ticket cards if data is available
  // Reverted to gap-4 to match original
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {ticketGroups.map((ticketGroup) => (
        <TicketCard key={ticketGroup.ticketGroupId} ticketGroup={ticketGroup} />
      ))}
    </div>
  );
};

export default TicketDisplaySection;
