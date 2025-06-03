import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MinusCircle, PlusCircle, TicketSlash } from "lucide-react";
import { TicketCategory } from "@/pages/TicketPage";

export interface TicketSelectorProps {
  categories: TicketCategory[];
  quantities: Record<string, number>;
  onQuantityChange: (id: string, quantity: number) => void;
}

export interface TicketCategoryInput extends TicketCategory {}

const TicketSelector: React.FC<TicketSelectorProps> = ({ categories, quantities, onQuantityChange }) => {
  const handleIncrement = (category: TicketCategoryInput) => {
    const currentQuantity = quantities[category.id] || 0;
    if (currentQuantity < category.max) {
      onQuantityChange(category.id, currentQuantity + 1);
    }
  };

  const handleDecrement = (category: TicketCategoryInput) => {
    const currentQuantity = quantities[category.id] || 0;
    if (currentQuantity > category.min) {
      onQuantityChange(category.id, currentQuantity - 1);
    }
  };

  const handleInputChange = (category: TicketCategoryInput, value: string) => {
    const newQuantity = parseInt(value, 10);
    if (!isNaN(newQuantity)) {
      if (newQuantity >= category.min && newQuantity <= category.max) {
        onQuantityChange(category.id, newQuantity);
      } else if (newQuantity < category.min) {
        onQuantityChange(category.id, category.min);
      } else {
        onQuantityChange(category.id, category.max);
      }
    } else if (value === "") {
      onQuantityChange(category.id, category.min); // Reset to min if input is cleared
    }
  };

  if (!categories || categories.length === 0) {
    return <p className="text-muted-foreground">Tiada jenis tiket tersedia untuk pemilihan.</p>;
    {
      /* Translated */
    }
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const quantity = quantities[category.id] || 0;
        const isSoldOut = category.isSoldOut || category.max === 0;

        return (
          <Card key={category.id} className={`transition-opacity ${isSoldOut ? "opacity-60" : ""}`}>
            <CardHeader className="pb-2 pt-4 px-4 md:px-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <CardTitle className="text-base md:text-lg font-semibold text-foreground">{category.name}</CardTitle>
                <p className="text-base md:text-lg font-semibold text-primary">RM {category.price.toFixed(2)}</p>
              </div>
              {category.description && (
                <CardDescription className="text-xs md:text-sm text-muted-foreground pt-1">{category.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4">
              {isSoldOut ? (
                <div className="flex items-center justify-center p-3 bg-muted rounded-md">
                  <TicketSlash className="w-5 h-5 mr-2 text-destructive" />
                  <span className="text-sm font-medium text-destructive">Habis Dijual</span> {/* Translated */}
                </div>
              ) : (
                <div className="flex items-center justify-between space-x-2 sm:space-x-4 border-t sm:border-t-0 mt-2 pt-2 sm:pt-0 sm:mt-0 border-muted">
                  <div />
                  <div className="flex items-center space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => handleDecrement(category)}
                      disabled={quantity <= category.min}
                      aria-label={`Kurangkan kuantiti untuk ${category.name}`} // Translated
                    >
                      <MinusCircle className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                    <Input
                      type="number"
                      className="w-17 h-10 md:w-16 md:h-10 text-center font-medium"
                      value={quantity.toString()} // Control component with string value
                      onChange={(e) => handleInputChange(category, e.target.value)}
                      onBlur={(e) => {
                        // Ensure value is within bounds on blur
                        const val = parseInt(e.target.value, 10);
                        if (isNaN(val) || val < category.min) onQuantityChange(category.id, category.min);
                        else if (val > category.max) onQuantityChange(category.id, category.max);
                      }}
                      min={category.min}
                      max={category.max}
                      aria-label={`Kuantiti untuk ${category.name}`} // Translated
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => handleIncrement(category)}
                      disabled={quantity >= category.max}
                      aria-label={`Tambah kuantiti untuk ${category.name}`} // Translated
                    >
                      <PlusCircle className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TicketSelector;
