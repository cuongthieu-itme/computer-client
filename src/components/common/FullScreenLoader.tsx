import React from 'react';
import { Loader2 } from 'lucide-react'; 

const FullScreenLoader: React.FC = () => {
 return (
   <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
     <Loader2 className="h-12 w-12 animate-spin text-primary" />
     <p className="mt-4 text-lg text-muted-foreground">Memuatkan sesi...</p>
   </div>
 );
};

export default FullScreenLoader;