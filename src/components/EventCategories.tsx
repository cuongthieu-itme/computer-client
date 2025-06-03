
import React from 'react';
import { Button } from "@/components/ui/button";

const EventCategories = () => {
  const categories = [
    { name: "Attraction & Leisure", count: 42 },
    { name: "Travel & Transportation", count: 28 },
    { name: "Events", count: 35 },
    { name: "Exhibitions", count: 19 },
    { name: "Others", count: 14 }
  ];

  return (
    <div className="bg-muted/20 rounded-lg shadow-sm p-4 h-full">
      <h4 className="text-lg font-medium mb-3">Event Categories</h4>
      <ul className="space-y-2">
        {categories.map((category, index) => (
          <li key={index}>
            <Button 
              variant="ghost" 
              className="w-full justify-between hover:bg-muted/50 rounded-md p-3"
            >
              <span className="flex-1 text-left break-words">{category.name}</span>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventCategories;
