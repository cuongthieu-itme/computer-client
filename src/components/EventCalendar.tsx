import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { 
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface EventItem {
  id: number;
  name: string;
  date: Date;
  hours?: string;
  price?: string;
}

const EventCalendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<EventItem[]>([
    { id: 1, name: "Johor Food Festival", date: new Date(2025, 4, 15), hours: "10:00 AM - 8:00 PM", price: "RM 25" },
    { id: 2, name: "Cultural Heritage Day", date: new Date(2025, 4, 18), hours: "9:00 AM - 6:00 PM", price: "RM 15" },
    { id: 3, name: "Botanical Garden Tour", date: new Date(2025, 4, 20), hours: "8:00 AM - 4:00 PM", price: "RM 10" },
    { id: 4, name: "Zoo Night Safari", date: new Date(2025, 4, 22), hours: "6:00 PM - 10:00 PM", price: "RM 40" },
    { id: 5, name: "Local Arts Exhibition", date: new Date(2025, 4, 25), hours: "10:00 AM - 5:00 PM", price: "RM 15" },
    { id: 6, name: "Johor River Cruise", date: new Date(2025, 4, 27), hours: "11:00 AM - 3:00 PM", price: "RM 60" },
    { id: 7, name: "Weekend Market Fair", date: new Date(2025, 4, 29), hours: "9:00 AM - 2:00 PM", price: "Free" },
    { id: 8, name: "Photography Contest", date: new Date(2025, 4, 30), hours: "10:00 AM - 4:00 PM", price: "RM 20" },
    { id: 9, name: "Cultural Dance Show", date: new Date(2025, 5, 2), hours: "7:00 PM - 9:00 PM", price: "RM 35" },
    { id: 10, name: "Historical Tour", date: new Date(2025, 5, 5), hours: "9:00 AM - 1:00 PM", price: "RM 30" },
  ]);
  
  const [showCount, setShowCount] = useState<number>(5);
  const [canScroll, setCanScroll] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  
  // Check if table can be scrolled horizontally
  useEffect(() => {
    const checkScroll = () => {
      if (tableWrapperRef.current) {
        const { scrollWidth, clientWidth, scrollLeft } = tableWrapperRef.current;
        setCanScroll(scrollWidth > clientWidth);
        setIsScrolled(scrollLeft > 0);
      }
    };
    
    // Check initially and on resize
    checkScroll();
    window.addEventListener('resize', checkScroll);
    
    // Add scroll event listener to track scroll position
    if (tableWrapperRef.current) {
      tableWrapperRef.current.addEventListener('scroll', checkScroll);
    }
    
    return () => {
      window.removeEventListener('resize', checkScroll);
      if (tableWrapperRef.current) {
        tableWrapperRef.current.removeEventListener('scroll', checkScroll);
      }
    };
  }, []);
  
  const nextMonth = () => {
    setDate(addMonths(date, 1));
  };
  
  const prevMonth = () => {
    setDate(subMonths(date, 1));
  };
  
  const handleShowMore = () => {
    setShowCount(prev => prev + 5);
  };
  
  const visibleEvents = events.slice(0, showCount);
  const hasMoreEvents = showCount < events.length;
  
  return (
    <div className="bg-muted/20 rounded-lg shadow-sm p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={prevMonth}>
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <h3 className="text-base font-medium">{format(date, 'MMMM yyyy')}</h3>
        <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={nextMonth}>
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium mb-2 text-sm">Upcoming Events</h4>
        
        {/* Scroll indicator */}
        {canScroll && (
          <div className="flex items-center justify-end mb-1 text-xs text-muted-foreground">
            <span>{isScrolled ? "Scroll for more" : "Swipe to see more"}</span>
            <ArrowRight className="h-3 w-3 ml-1 animate-pulse" />
          </div>
        )}
        
        {/* Table wrapper with ref and scroll indicators */}
        <div 
          ref={tableWrapperRef}
          className="overflow-auto relative"
        >
          {/* Right shadow for scroll indication */}
          {canScroll && !isScrolled && (
            <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-background/40 to-transparent pointer-events-none z-10"></div>
          )}
        
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-2/5 lg:w-1/3 xl:w-1/4 text-xs">Date</TableHead>
                <TableHead className="text-xs">Event Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">
                    <div className="text-xs">{format(event.date, 'MMM d')}</div>
                    <div className="text-xs text-muted-foreground">{format(event.date, 'EEEE')}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-xs">{event.name}</div>
                    {event.hours && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-xs text-muted-foreground truncate max-w-[120px] md:max-w-[150px] lg:max-w-none">
                              {event.hours}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{event.hours}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {event.price && (
                      <div className="text-xs font-medium">{event.price}</div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Mobile touch hint on first render */}
        <div className={cn(
          "md:hidden text-center text-xs text-muted-foreground mt-2 transition-opacity duration-300",
          canScroll && !isScrolled ? "opacity-100" : "opacity-0 h-0 mt-0"
        )}>
          <span className="inline-flex items-center">
            <span className="mr-1">Swipe left</span>
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
        
        {hasMoreEvents && (
          <Button 
            variant="ghost" 
            className="w-full mt-4 text-primary hover:text-primary/90 text-xs"
            onClick={handleShowMore}
          >
            Show More
          </Button>
        )}
      </div>
    </div>
  );
};

export default EventCalendar;