import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  ChevronRight,
  ShoppingCart,
  User,
  CreditCard,
  ClipboardCheck,
  Trash2,
  XCircle,
  Info as InfoIcon,
  CalendarDays,
  Search,
  Banknote,
  Loader2,
  Gift,
  Minus,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

// API Service and Type imports
import { fetchBankList, placeOrderTicketGroup, placeFreeOrderTicketGroup } from "@/services/paymentService";
import {
  BankDTO,
  PaymentMethodOption,
  FetchBankListResponseDTO,
  OrderTicketGroupRequestBodyDTO,
  FreeOrderTicketGroupRequestBodyDTO,
  PaidOrderTicketGroupResponseDTO,
  FreeOrderTicketGroupResponseDTO,
  ApiErrorDTO,
} from "@/types/api/payment.api";
import { useAuthStore } from "@/store/authStore";
import { UserDTO } from "@/types/api/auth.api";
import { config } from "@/config/env";
import TermsOfServiceTrigger from "../documents/TermsOfServiceTrigger";

// Interface for individual ticket details within a cart item
export interface CartItemTicket {
  category: string;
  quantity: number;
  price: number;
  id: string;
}

// Interface for a cart item, representing a group of tickets for a specific event/date
export interface CartItem {
  id: string;
  groupType?: string;
  name: string;
  date: Date;
  tickets: CartItemTicket[];
  imageUrl?: string;
  ticketGroupId: string;
}

// Defines the possible steps in the checkout process
type CartStep = "items" | "guest-info" | "payment" | "review";

// Props for the Cart component
interface CartProps {
  items: CartItem[];
  onPaymentComplete: (orderID?: number, redirectURL?: string) => void;
  onCancel: () => void;
  isMember?: boolean;
}

// Configuration for the steps displayed in the cart progress indicator
const stepConfig = [
  { id: "items" as CartStep, label: "Troli Anda", icon: ShoppingCart }, // Translated
  { id: "guest-info" as CartStep, label: "Butiran Tetamu", icon: User }, // Translated
  { id: "payment" as CartStep, label: "Pembayaran", icon: CreditCard }, // Translated
  { id: "review" as CartStep, label: "Semak & Sahkan", icon: ClipboardCheck }, // Translated
];

const Cart = ({ items: initialItems, onPaymentComplete, onCancel, isMember = false }: CartProps) => {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState<CartStep>("items");
  const [couponCode, setCouponCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "", phone: "", identificationNo: "" });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodOption>("card");
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [fpxMode, setFpxMode] = useState<"01" | "02" | null>(null);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const authenticatedUser = useAuthStore((state) => state.user as UserDTO | null);

  // Effect to update cart items and selected items when `initialItems` prop changes
  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      const allItemIds = new Set(initialItems.map((item) => item.id));
      setSelectedItems(allItemIds);
    } else {
      setSelectedItems(new Set());
    }
    setItems(initialItems);
  }, [initialItems]);

  // React Query hook to fetch the list of banks for FPX payment
  const {
    data: bankListApiResponse,
    isLoading: isLoadingBankList,
    error: bankListError,
  } = useQuery<FetchBankListResponseDTO, Error>({
    queryKey: ["bankList", fpxMode],
    queryFn: () => {
      if (!fpxMode) {
        return Promise.resolve({ banks: [], success: false, respCode: 0, respDesc: "Mod FPX tidak dipilih" }); // Translated
      }
      return fetchBankList(fpxMode);
    },
    enabled: !!fpxMode,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Memoized list of enabled banks, filtered from the API response
  const enabledBanks = useMemo(() => {
    if (
      bankListApiResponse?.success &&
      bankListApiResponse.banks &&
      (bankListApiResponse.respCode === 2000 || bankListApiResponse.respCode === undefined)
    ) {
      return bankListApiResponse.banks.filter((bank) => bank.enabled === 1);
    }
    return [];
  }, [bankListApiResponse]);

  // Function to calculate the subtotal for a single cart item
  const calculateSubtotalForItem = (item: CartItem) => {
    return item.tickets.reduce((sum, ticket) => sum + ticket.price * ticket.quantity, 0);
  };

  // Memoized calculation of the subtotal for all selected items
  const subtotalForSelectedItems = useMemo(() => {
    return items.reduce((sum, item) => {
      if (selectedItems.has(item.id)) {
        return sum + calculateSubtotalForItem(item);
      }
      return sum;
    }, 0);
  }, [items, selectedItems]);

  // Memoized calculation of the final total amount after applying discounts
  const totalAmount = useMemo(() => {
    const calculatedTotal = subtotalForSelectedItems - discountAmount;
    return Math.max(0, calculatedTotal);
  }, [subtotalForSelectedItems, discountAmount]);

  // Handler for applying a coupon code
  const handleApplyCoupon = () => {
    // if (!couponCode) {
    //   toast({ title: "Tiada Kod Kupon", description: "Sila masukkan kod kupon untuk digunakan.", variant: "destructive" }); // Translated
    //   return;
    // }
    // if (subtotalForSelectedItems === 0 && couponCode) {
    //     toast({ title: "Tiada item dipilih untuk diskaun", description: "Sila pilih item sebelum menggunakan kupon.", variant: "destructive" }); // Translated
    //     return;
    // }
    // let appliedDiscount = 0;
    // if (couponCode.toUpperCase() === "WELCOME10") {
    //   appliedDiscount = subtotalForSelectedItems * 0.1;
    //   setDiscountApplied(true);
    //   toast({ title: "Kupon Digunakan!", description: "Diskaun 10% telah digunakan." }); // Translated
    // } else if (couponCode.toUpperCase() === "SAVE20") {
    //   appliedDiscount = subtotalForSelectedItems * 0.2;
    //   setDiscountApplied(true);
    //   toast({ title: "Kupon Digunakan!", description: "Diskaun 20% telah digunakan." }); // Translated
    // } else if (couponCode.toUpperCase() === "FREEJOY") {
    //   appliedDiscount = subtotalForSelectedItems;
    //   setDiscountApplied(true);
    //   toast({ title: "Kupon Digunakan!", description: "Pesanan anda kini percuma!" }); // Translated
    // } else if (couponCode) {
    //   toast({ title: "Kupon Tidak Sah", description: "Kod kupon yang dimasukkan tidak sah.", variant: "destructive" }); // Translated
    //   setDiscountApplied(false);
    // } else {
    //   setDiscountApplied(false);
    // }
    // setDiscountAmount(appliedDiscount);
  };

  // Effect to re-apply coupon if selected items change and a discount was previously applied
  useEffect(() => {
    if (discountApplied) {
      handleApplyCoupon();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems, items, discountApplied]);

  // Handler for guest information input changes
  const handleGuestInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handler to toggle the selection state of a single cart item
  const toggleSelectItem = (itemId: string) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    setSelectedItems(newSelectedItems);
  };

  // Handler to toggle the selection state of all cart items
  const toggleSelectAll = () => {
    if (selectedItems.size === items.length && items.length > 0) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  };

  // Handler to delete all currently selected items from the cart
  const deleteSelectedItems = () => {
    if (selectedItems.size === 0) {
      toast({ title: "Tiada item dipilih", description: "Sila pilih item untuk dipadam.", variant: "default" }); // Translated
      return;
    }
    const updatedItems = items.filter((item) => !selectedItems.has(item.id));
    setItems(updatedItems);
    setSelectedItems(new Set());
    toast({ title: "Item Dibuang", description: `${selectedItems.size} item telah dibuang dari troli.` }); // Translated
  };

  // Handler to remove a single specific item from the cart
  const removeItemFromCart = (itemIdToRemove: string) => {
    const updatedItems = items.filter((item) => item.id !== itemIdToRemove);
    setItems(updatedItems);
    const newSelectedItems = new Set(selectedItems);
    newSelectedItems.delete(itemIdToRemove);
    setSelectedItems(newSelectedItems);
    toast({ title: "Item Dibuang", description: "Item tersebut telah dibuang dari troli anda." }); // Translated
  };

  // Handler to change the quantity of a specific ticket within a cart item
  const handleTicketQuantityChange = (cartItemId: string, ticketId: string, newQuantity: number) => {
    const updatedQuantity = Math.max(0, newQuantity);

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === cartItemId) {
          const updatedTickets = item.tickets.map((ticket) => {
            if (ticket.id === ticketId) {
              return { ...ticket, quantity: updatedQuantity };
            }
            return ticket;
          });
          return { ...item, tickets: updatedTickets };
        }
        return item;
      })
    );
  };

  // Determines the checkout steps based on user type and order total
  const getCartSteps = () => {
    let steps = [...stepConfig];
    if (isMember) {
      // If member, always remove guest-info
      steps = steps.filter((step) => step.id !== "guest-info");
    }
    if (totalAmount === 0) {
      // If total is 0, always remove payment
      steps = steps.filter((step) => step.id !== "payment");
    }
    return steps;
  };
  const activeCartSteps = getCartSteps();
  const currentStepIndex = activeCartSteps.findIndex((step) => step.id === currentStep);

  // Handler for changing the selected payment method
  const handlePaymentMethodChange = (value: PaymentMethodOption) => {
    setPaymentMethod(value);
    setSelectedBankCode("");
    let newFpxMode: "01" | "02" | null = null;
    if (value === "fpx-individual") {
      newFpxMode = "01";
    } else if (value === "fpx-corporate") {
      newFpxMode = "02";
    }
    setFpxMode(newFpxMode);
    if (newFpxMode) {
      queryClient.invalidateQueries({ queryKey: ["bankList", newFpxMode] });
    }
  };

  // React Query mutation for placing PAID orders
  const placeOrderMutation = useMutation<PaidOrderTicketGroupResponseDTO, AxiosError<ApiErrorDTO>, OrderTicketGroupRequestBodyDTO>({
    mutationFn: placeOrderTicketGroup,
    onSuccess: (data) => {
      if (data.respCode === 2000) {
        toast({ title: "Pesanan Dimulakan!", description: data.respDesc || "Mengarahkan ke gerbang pembayaran..." }); // Translated
        let finalRedirectUrl = data.result?.redirectURL;
        if (finalRedirectUrl && finalRedirectUrl.startsWith("/")) {
          finalRedirectUrl = `${config.paymentGatewayBaseUrl}${finalRedirectUrl}`;
        }
        onPaymentComplete(data.result?.orderID, finalRedirectUrl);
        queryClient.invalidateQueries({ queryKey: ["orderHistory"] });
      } else {
        toast({ title: "Penempatan Pesanan Gagal", description: data.respDesc || "Tidak dapat membuat pesanan.", variant: "destructive" }); // Translated
      }
    },
    onError: (error: AxiosError<ApiErrorDTO>) => {
      const errorDesc = error.response?.data?.respDesc || error.message || "Ralat tidak dijangka berlaku."; // Translated
      toast({ title: "Ralat Pesanan", description: errorDesc, variant: "destructive" }); // Translated
    },
  });

  // React Query mutation for placing FREE orders
  const placeFreeOrderMutation = useMutation<FreeOrderTicketGroupResponseDTO, AxiosError<ApiErrorDTO>, FreeOrderTicketGroupRequestBodyDTO>({
    mutationFn: placeFreeOrderTicketGroup,
    onSuccess: (data) => {
      if (data.respCode === 2000 && data.result) {
        toast({
          title: "Pesanan Percuma Disahkan!", // Translated
          description: `No Pesanan: ${data.result.orderNo} - Status: ${data.result.transactionStatus}. Tiket anda telah diproses.`, // Translated
        });
        // Construct redirect URL for PaymentRedirectPage
        const redirectUrlForFreeOrder = `/paymentRedirect?orderTicketGroupId=${data.result.orderTicketGroupId}&transactionStatus=${data.result.transactionStatus}&orderNo=${data.result.orderNo}`;
        onPaymentComplete(data.result.orderTicketGroupId, redirectUrlForFreeOrder);
        queryClient.invalidateQueries({ queryKey: ["orderHistory"] });
      } else {
        toast({ title: "Pesanan Percuma Gagal", description: data.respDesc || "Tidak dapat memproses pesanan percuma.", variant: "destructive" }); // Translated
      }
    },
    onError: (error: AxiosError<ApiErrorDTO>) => {
      const errorDesc = error.response?.data?.respDesc || error.message || "Ralat tidak dijangka berlaku."; // Translated
      toast({ title: "Ralat Pesanan Percuma", description: errorDesc, variant: "destructive" }); // Translated
    },
  });

  // Handler for completing the order (called from the review step)
  const handleCompleteOrder = () => {
    if (items.length === 0 || selectedItems.size === 0) {
      toast({ title: "Tiada Item untuk Dipesan", description: "Troli anda kosong atau tiada item dipilih.", variant: "destructive" }); // Translated
      return;
    }
    if (!termsAccepted) {
      toast({ title: "Persetujuan Diperlukan", description: "Sila terima terma dan syarat.", variant: "destructive" }); // Translated
      return;
    }

    const firstSelectedItem = items.find((item) => selectedItems.has(item.id));

    if (!firstSelectedItem || !firstSelectedItem.ticketGroupId) {
      toast({
        title: "Ralat", // Translated
        description: "Maklumat tiket penting (ID Kumpulan Tiket) tiada daripada item yang dipilih.", // Translated
        variant: "destructive",
      });
      console.error("Maklumat tiket penting tiada. firstSelectedItem:", firstSelectedItem); // Translated
      return;
    }

    const basePayload: FreeOrderTicketGroupRequestBodyDTO = {
      ticketGroupId: parseInt(firstSelectedItem.ticketGroupId, 10),
      date: format(firstSelectedItem.date, "yyyy-MM-dd"),
      tickets: items
        .filter(
          (item) =>
            selectedItems.has(item.id) &&
            item.ticketGroupId === firstSelectedItem.ticketGroupId &&
            item.date.toISOString().split("T")[0] === firstSelectedItem.date.toISOString().split("T")[0]
        )
        .flatMap((item) => item.tickets)
        .filter((ticket) => ticket.quantity > 0)
        .map((ticket) => ({ ticketId: ticket.id, qty: ticket.quantity })),
    };

    if (basePayload.tickets.length === 0) {
      toast({
        title: "Tiada Tiket Dipilih", // Translated
        description: "Sila pilih sekurang-kurangnya satu jenis tiket dengan kuantiti lebih daripada sifar.", // Translated
        variant: "destructive",
      });
      return;
    }

    // Populate user details based on member status or guest input
    if (isMember && authenticatedUser) {
      basePayload.fullName = authenticatedUser.fullName;
      basePayload.email = authenticatedUser.email;
      basePayload.contactNo = authenticatedUser.contactNo;
      basePayload.identificationNo = authenticatedUser.identificationNo;
    } else if (!isMember) {
      // Guest user details are always required if not a member
      basePayload.fullName = guestInfo.name;
      basePayload.email = guestInfo.email;
      basePayload.contactNo = guestInfo.phone;
      basePayload.identificationNo = guestInfo.identificationNo;
    }
    // No 'else if (isMember && !authenticatedUser)' needed here if guestInfo is always required for !isMember

    // Call the appropriate mutation based on totalAmount
    if (totalAmount === 0) {
      // console.log("Placing FREE order with payload:", basePayload);
      placeFreeOrderMutation.mutate(basePayload);
    } else {
      const paidOrderPayload: OrderTicketGroupRequestBodyDTO = {
        ...basePayload,
        paymentType: paymentMethod.startsWith("fpx") ? "fpx" : "credit/debit",
      };
      if (paymentMethod === "fpx-individual") {
        paidOrderPayload.mode = "individual";
        paidOrderPayload.bankCode = selectedBankCode;
      } else if (paymentMethod === "fpx-corporate") {
        paidOrderPayload.mode = "corporate";
        paidOrderPayload.bankCode = selectedBankCode;
      }
      // console.log("Placing PAID order with payload:", paidOrderPayload);
      placeOrderMutation.mutate(paidOrderPayload);
    }
  };

  // --- Render Functions for Each Step ---

  // Render "Your Cart Items" step
  const renderCartItemsStep = () => (
    <Card className="shadow-0 sm:shadow-lg rounded-none sm:rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl">Item Troli Anda</CardTitle> {/* Translated */}
        <CardDescription>Semak item dalam troli anda. Pilih item yang ingin dibeli dan laraskan kuantiti.</CardDescription> {/* Translated */}
      </CardHeader>
      <CardContent className="space-y-6">
        {items.length === 0 ? (
          <div className="text-center py-10">
            <ShoppingCart className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Troli anda kosong.</p> {/* Translated */}
            <Button size="sm" onClick={onCancel} className="mt-4 ">
              <Search size={16} className="mr-2" /> Kembali Semak Imbas {/* Translated */}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="select-all"
                  checked={selectedItems.size === items.length && items.length > 0}
                  onCheckedChange={toggleSelectAll}
                  disabled={items.length === 0}
                  aria-label="Pilih semua item" // Translated
                />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  Pilih Semua ({selectedItems.size}/{items.length}) {/* Translated */}
                </label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={deleteSelectedItems}
                disabled={selectedItems.size === 0}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50 px-3 py-1.5"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="pb-3 min-h-[250px]">
              <div className="space-y-4">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className={cn(
                      "transition-all hover:shadow-md",
                      selectedItems.has(item.id) ? "border-primary ring-1 ring-primary" : "border-border"
                    )}
                  >
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-start gap-3 md:gap-4">
                        <Checkbox
                          id={`select-item-${item.id}`}
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={() => toggleSelectItem(item.id)}
                          className="mt-1 flex-shrink-0"
                          aria-label={`Pilih item ${item.name}`} // Translated
                        />
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h3 className="font-semibold text-sm md:text-base leading-tight">{item.name}</h3>
                              <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                                <CalendarDays size={12} className="mr-1.5" />
                                {format(item.date, "dd MMM yy")}
                              </div>
                            </div>
                          </div>
                          <div className="-ml-6 mt-2 space-y-2">
                            {item.tickets.map((ticket) => (
                              <div
                                key={ticket.id}
                                className="flex flex-col  justify-between  text-xs md:text-sm py-2 border-b border-dashed last:border-b-0"
                              >
                                <span className="text-muted-foreground mb-1 sm:mb-0 flex-1">
                                  {ticket.category}
                                  <span className="text-xs"> (RM {ticket.price.toFixed(2)} setiap satu)</span> {/* Translated */}
                                </span>

                                <div className="flex flex-col sm:flex-row justify-between gap-1 sm:my-2">
                                  <div className="flex items-center space-x-1.5 sm:space-x-2 mt-1 sm:my-0">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-7 w-7 shrink-0"
                                      onClick={() => handleTicketQuantityChange(item.id, ticket.id, ticket.quantity - 1)}
                                      disabled={ticket.quantity <= 0}
                                      aria-label={`Kurangkan kuantiti untuk ${ticket.category}`} // Translated
                                    >
                                      <Minus className="h-3.5 w-3.5" />
                                    </Button>
                                    <Input
                                      type="number"
                                      value={ticket.quantity}
                                      onChange={(e) => {
                                        const newQuantityStr = e.target.value;
                                        const numValue = parseInt(newQuantityStr, 10);
                                        if (!isNaN(numValue)) {
                                          handleTicketQuantityChange(item.id, ticket.id, numValue);
                                        } else if (newQuantityStr === "") {
                                          // If user clears input, treat as 0 or wait for blur
                                          handleTicketQuantityChange(item.id, ticket.id, 0);
                                        }
                                      }}
                                      onBlur={(e) => {
                                        // Ensure if input is empty on blur, it's set to 0
                                        if (e.target.value === "") {
                                          handleTicketQuantityChange(item.id, ticket.id, 0);
                                        }
                                      }}
                                      className="h-7 w-12 text-center px-1 text-sm"
                                      min={0}
                                      aria-label={`Kuantiti untuk ${ticket.category}`} // Translated
                                    />
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-7 w-7 shrink-0"
                                      onClick={() => handleTicketQuantityChange(item.id, ticket.id, ticket.quantity + 1)}
                                      // Example: disabled={ticket.quantity >= MAX_TICKET_QUANTITY}
                                      aria-label={`Tambah kuantiti untuk ${ticket.category}`} // Translated
                                    >
                                      <Plus className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                  <span className="font-bold text-right mt-auto sm:w-20  shrink-0">
                                    RM {(ticket.price * ticket.quantity).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-semibold text-sm md:text-base mb-1 pt-3 border-t">
                        Subjumlah: RM {calculateSubtotalForItem(item).toFixed(2)} {/* Translated */}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4 pt-6 border-t">
        <div className="w-full">
          <h3 className="text-sm font-medium mb-1.5">Gunakan Kod Diskaun</h3> {/* Translated */}
          <div className="flex gap-2">
            <Input
              placeholder="Masukkan kod kupon" // Translated
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-grow h-10 text-sm"
              disabled={items.length === 0 || selectedItems.size === 0}
            />
            <Button
              onClick={handleApplyCoupon}
              variant="outline"
              size="default"
              disabled={!couponCode || items.length === 0 || selectedItems.size === 0}
            >
              Guna {/* Translated */}
            </Button>
          </div>
          {discountApplied && discountAmount > 0 && (
            <p className="text-xs text-green-600 mt-1.5">Diskaun sebanyak RM {discountAmount.toFixed(2)} telah digunakan!</p> 
          )}
        </div>
        <div className="w-full space-y-1.5 text-sm pt-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subjumlah Item Dipilih:</span> {/* Translated */}
            <span>RM {subtotalForSelectedItems.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="text-muted-foreground">Diskaun:</span> {/* Translated */}
              <span>- RM {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
            <span>Jumlah:</span> {/* Translated */}
            <span>RM {totalAmount.toFixed(2)}</span>
          </div>
        </div>
        <div className="w-full flex flex-col-reverse xs:flex-row justify-between mt-4 gap-2">
          <Button variant="outline" onClick={onCancel} className="w-full xs:w-auto">
            Batal & Kosongkan {/* Translated */}
          </Button>
          <Button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              if (items.length === 0 || selectedItems.size === 0) {
                toast({ title: "Troli Kosong atau Tiada Pilihan", description: "Sila tambah dan pilih item.", variant: "destructive" }); // Translated
                return;
              }
              if (isMember) {
                setCurrentStep(totalAmount === 0 ? "review" : "payment");
              } else {
                setCurrentStep("guest-info");
              }
            }}
            disabled={
              items.length === 0 ||
              selectedItems.size === 0 ||
              items.reduce((acc, item) => acc + item.tickets.reduce((tAcc, t) => tAcc + t.quantity, 0), 0) === 0
            }
            className="w-full xs:w-auto"
          >
            Teruskan {/* Translated */}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  // Render "Guest Information" step
  const renderGuestInfoStep = () => (
    <Card className="shadow-0 sm:shadow-lg rounded-none sm:rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl">Maklumat Tetamu</CardTitle> {/* Translated */}
        <CardDescription>Sila berikan butiran anda untuk tempahan.</CardDescription> {/* Translated */}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nama Penuh <span className="text-destructive">*</span> {/* Translated */}
          </label>
          <Input id="name" name="name" value={guestInfo.name} onChange={handleGuestInfoChange} placeholder="cth., Jane Doe" required /> {/* Translated placeholder */}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Alamat Emel <span className="text-destructive">*</span> {/* Translated */}
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={guestInfo.email}
            onChange={handleGuestInfoChange}
            placeholder="emel@contoh.com" // Translated placeholder
            required
          />
          <p className="text-xs text-muted-foreground mt-1">E-tiket anda akan dihantar ke emel ini.</p> {/* Translated */}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombor Telefon <span className="text-destructive">*</span> {/* Translated */}
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={guestInfo.phone}
            onChange={handleGuestInfoChange}
            placeholder="cth., 0123456789" // Translated placeholder
            required
          />
        </div>
        <div>
          <label htmlFor="identificationNo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            No. KP / Pasport <span className="text-destructive">*</span> {/* Translated */}
          </label>
          <Input
            id="identificationNo"
            name="identificationNo"
            value={guestInfo.identificationNo}
            onChange={handleGuestInfoChange}
            placeholder="cth., 950101-10-5678 atau A1234567" // Translated placeholder
            required
          />
        </div>
      </CardContent>
      <CardFooter className={cn("flex flex-col-reverse xs:flex-row justify-between border-t pt-6 gap-2")}>
        <Button
          variant="outline"
          className="w-full xs:w-auto"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            setCurrentStep("items");
          }}
        >
          Kembali ke Troli {/* Translated */}
        </Button>
        <Button
          className="w-full xs:w-auto"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            if (!guestInfo.name.trim() || !guestInfo.email.trim() || !guestInfo.phone.trim() || !guestInfo.identificationNo.trim()) {
              toast({
                title: "Maklumat Tetamu Tidak Lengkap", // Translated
                description: "Sila isi semua butiran tetamu yang diperlukan, termasuk No. KP/Pasport.", // Translated
                variant: "destructive",
              });
              return;
            }
            setCurrentStep(totalAmount === 0 ? "review" : "payment");
          }}
        >
          {totalAmount === 0 ? "Teruskan ke Semakan" : "Teruskan ke Pembayaran"} <ChevronRight className="ml-2 h-4 w-4" /> {/* Translated */}
        </Button>
      </CardFooter>
    </Card>
  );

  // Render "Payment Method" step
  const renderPaymentStep = () => {
    // This step is skipped if totalAmount is 0, handled by getCartSteps and navigation logic
    if (totalAmount === 0) return null;

    return (
      <Card className="shadow-0 sm:shadow-lg rounded-none sm:rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl">Kaedah Pembayaran</CardTitle> {/* Translated */}
          <CardDescription>Pilih kaedah pembayaran pilihan anda. Jumlah: RM {totalAmount.toFixed(2)}</CardDescription> {/* Translated */}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg text-sm text-blue-700 dark:text-blue-300">
            <InfoIcon className="inline h-4 w-4 mr-1.5 align-text-bottom" />
            Anda akan diarahkan ke gerbang pembayaran JohorPay untuk melengkapkan pembayaran anda dengan selamat. {/* Translated */}
          </div>
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Kaedah Pembayaran <span className="text-destructive">*</span> {/* Translated */}
            </label>
            <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
              <SelectTrigger id="paymentMethod" className="w-full">
                <SelectValue placeholder="Pilih kaedah pembayaran" /> {/* Translated */}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Kad Debit/Kredit</SelectItem> {/* Translated */}
                <SelectItem value="fpx-individual">FPX - Akaun Individu</SelectItem> {/* Translated */}
                <SelectItem value="fpx-corporate">FPX - Akaun Korporat</SelectItem> {/* Translated */}
              </SelectContent>
            </Select>
          </div>

          {(paymentMethod === "fpx-individual" || paymentMethod === "fpx-corporate") && (
            <div className="space-y-2">
              <label htmlFor="bank" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Pilih Bank <span className="text-destructive">*</span> {/* Translated */}
              </label>
              {isLoadingBankList && (
                <div className="flex items-center text-sm text-muted-foreground p-3 border rounded-md bg-muted/50">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mendapatkan senarai bank yang tersedia... {/* Translated */}
                </div>
              )}
              {bankListError && !isLoadingBankList && (
                <p className="text-sm text-destructive p-3 border border-destructive/50 rounded-md">Ralat mendapatkan senarai bank: {bankListError.message}</p> 
              )}
              {!isLoadingBankList && !bankListError && bankListApiResponse && (
                <Select value={selectedBankCode} onValueChange={setSelectedBankCode} disabled={enabledBanks.length === 0}>
                  <SelectTrigger id="bank" className="w-full">
                    <SelectValue placeholder={enabledBanks.length === 0 ? "Tiada bank tersedia untuk jenis FPX ini" : "Pilih bank anda"} /> {/* Translated */}
                  </SelectTrigger>
                  <SelectContent>
                    {enabledBanks.length > 0 ? (
                      enabledBanks.map((bank: BankDTO) => (
                        <SelectItem key={bank.value} value={bank.value} disabled={bank.enabled === 0}>
                          {bank.name} {bank.enabled === 0 ? "(Luar Talian)" : ""} {/* Translated */}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-banks-placeholder" disabled>
                        {bankListApiResponse && !bankListApiResponse.success ? "Senarai bank tidak tersedia" : "Tiada bank yang diaktifkan ditemui"} {/* Translated */}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
              {bankListApiResponse && !bankListApiResponse.success && !isLoadingBankList && enabledBanks.length === 0 && (
                <p className="text-xs text-destructive mt-1">
                  Tidak dapat mengambil senarai bank yang lengkap. Sila cuba lagi atau pilih kaedah pembayaran lain. {/* Translated */}
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className={cn("flex flex-col-reverse xs:flex-row justify-between border-t pt-6 gap-2")}>
          <Button
            variant="outline"
            className="w-full xs:w-auto"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setCurrentStep(isMember ? "items" : "guest-info");
            }}
          >
            Kembali {/* Translated */}
          </Button>
          <Button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              if (totalAmount > 0 && paymentMethod.startsWith("fpx") && !selectedBankCode) {
                toast({ title: "Pemilihan Bank Diperlukan", description: "Sila pilih bank anda untuk pembayaran FPX.", variant: "destructive" }); // Translated
                return;
              }
              setCurrentStep("review");
            }}
            disabled={
              (totalAmount > 0 && paymentMethod.startsWith("fpx") && !selectedBankCode) || // Condition for paid FPX
              placeOrderMutation.isPending ||
              isLoadingBankList
            }
            className="w-full xs:w-auto"
          >
            {placeOrderMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Semak Pesanan {/* Translated */}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Render "Review & Confirm" step
  const renderReviewStep = () => (
    <Card className="shadow-0 sm:shadow-lg rounded-none sm:rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl">Semak Pesanan Anda</CardTitle> {/* Translated */}
        <CardDescription>Sila sahkan butiran sebelum membuat pesanan anda.</CardDescription> {/* Translated */}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-b pb-4 mb-4">
          <p className="text-xl font-semibold mb-2">Maklumat Pelanggan</p> {/* Translated */}
          <div className="space-y-1 text-sm">
            {isMember && authenticatedUser ? (
              <>
                <p>
                  <span className="font-medium">Nama:</span> {authenticatedUser.fullName} {/* Translated */}
                </p>
                <p>
                  <span className="font-medium">Emel:</span> {authenticatedUser.email} {/* Translated */}
                </p>
                <p>
                  <span className="font-medium">Telefon:</span> {authenticatedUser.contactNo} {/* Translated */}
                </p>
                <p>
                  <span className="font-medium">KP/Pasport:</span> {authenticatedUser.identificationNo} {/* Translated */}
                </p>
              </>
            ) : (
              <>
                <p>
                  <span className="font-medium">Nama:</span> {guestInfo.name} {/* Translated */}
                </p>
                <p>
                  <span className="font-medium">Emel:</span> {guestInfo.email} {/* Translated */}
                </p>
                <p>
                  <span className="font-medium">Telefon:</span> {guestInfo.phone} {/* Translated */}
                </p>
                <p>
                  <span className="font-medium">KP/Pasport:</span> {guestInfo.identificationNo} {/* Translated */}
                </p>
              </>
            )}
          </div>
        </div>

        {totalAmount > 0 && (
          <div className="border-b pb-4 mb-4">
            <p className="text-xl font-semibold mb-2">Kaedah Pembayaran</p> {/* Translated */}
            <p className="text-sm">
              {paymentMethod === "card" && "Kad Debit/Kredit"} {/* Translated */}
              {paymentMethod === "fpx-individual" &&
                `FPX - Individu (${enabledBanks.find((b) => b.value === selectedBankCode)?.name || selectedBankCode || "T/B"})`} {/* Translated */}
              {paymentMethod === "fpx-corporate" &&
                `FPX - Korporat (${enabledBanks.find((b) => b.value === selectedBankCode)?.name || selectedBankCode || "T/B"})`} {/* Translated */}
            </p>
          </div>
        )}

        <div>
          <p className="text-xl font-semibold mb-2">Ringkasan Pesanan</p> {/* Translated */}
          <ScrollArea className="pr-3 border rounded-md p-3 bg-muted/30">
            {items
              .filter((item) => selectedItems.has(item.id))
              .map((item, index) => (
                <div key={index} className="mb-3 px-1 pb-2 last:mb-0 last:pb-0 border-b last:border-b-0">
                  <p className="font-semibold mb-1">{item.name}</p>
                  <p className="text-sm text-muted-foreground mb-2">Lawatan: {format(item.date, "PPP")}</p> {/* Translated */}
                  <div className="border-b border-muted-foreground/30 my-3" />
                  <ul className="list-disc list-inside m-2 text-sm">
                    {item.tickets
                      .filter((ticket) => ticket.quantity > 0)
                      .map((ticket) => (
                        <li
                          key={ticket.id}
                          className="flex justify-between items-start sm:items-center flex-col sm:flex-row mt-4 align-center mb-3 sm:mb-2"
                        >
                          <span className={cn("mr-2 flex w-full", "sm:block", "justify-between", "sm:justify-start")}>
                            <span>
                              <span className="font-black mr-1">- </span>
                              <span className="font-medium mr-1">{ticket.category}</span>
                            </span>
                            <span className="inline-block bg-primary/10 text-primary px-3 py-0.5 rounded-full text-[12px] font-semibold ml-2 whitespace-nowrap">
                              × {ticket.quantity}
                            </span>
                          </span>
                          <span className="whitespace-nowrap -mt-1 sm:-mt-0 text-muted-foreground/80 font-semibold">
                            RM {(ticket.price * ticket.quantity).toFixed(2)}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
          </ScrollArea>
          <div className="mt-4 pt-3 border-t">
            <div className="flex justify-between text-sm">
              <span>Subjumlah:</span> {/* Translated */}
              <span>RM {subtotalForSelectedItems.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Diskaun:</span> {/* Translated */}
                <span>- RM {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg mt-1.5">
              <span>Jumlah Keseluruhan:</span> {/* Translated */}
              <span>RM {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-start space-x-3 pt-3">
          <Checkbox id="terms-review" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked === true)} className="mt-0.5" />
          <label htmlFor="terms-review" className="text-sm text-muted-foreground">
            Saya telah membaca dan bersetuju dengan{" "} {/* Translated */}
            <TermsOfServiceTrigger>
              <span className="text-primary cursor-pointer mr-1">Syarat Perkhidmatan</span> {/* Translated */}
            </TermsOfServiceTrigger>
            dan Perjanjian Pembelian. {/* Translated */}
          </label>
        </div>
      </CardContent>
      <CardFooter className={cn("flex flex-col-reverse xs:flex-row justify-between border-t pt-6 gap-2")}>
        <Button
          variant="outline"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            if (totalAmount === 0) {
              setCurrentStep(isMember ? "items" : "guest-info");
            } else {
              setCurrentStep("payment");
            }
          }}
          className="w-full xs:w-auto"
        >
          Kembali {/* Translated */}
        </Button>
        <Button
          onClick={handleCompleteOrder}
          disabled={
            !termsAccepted ||
            (totalAmount > 0 && items.reduce((acc, item) => acc + item.tickets.reduce((tAcc, t) => tAcc + t.quantity, 0), 0) === 0) ||
            placeOrderMutation.isPending ||
            placeFreeOrderMutation.isPending
          }
          className="w-full xs:w-auto"
        >
          {(placeOrderMutation.isPending || placeFreeOrderMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {totalAmount === 0 ? "Sahkan Pesanan Percuma" : "Buat Pesanan & Teruskan ke JohorPay"} {/* Translated */}
          {totalAmount > 0 && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );

  // Main switch for rendering current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "items":
        return renderCartItemsStep();
      case "guest-info":
        // Guest info step is always shown if not a member, regardless of totalAmount
        return !isMember ? renderGuestInfoStep() : null;
      case "payment":
        // Payment step is skipped if totalAmount is 0
        return totalAmount > 0 ? renderPaymentStep() : null;
      case "review":
        return renderReviewStep();
      default:
        return <p className="text-center text-destructive">Ralat: Langkah troli tidak diketahui.</p>; // Translated
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-start justify-between mb-6 md:mb-14 relative px-2 md:px-0">
        {activeCartSteps.map((step, index) => (
          <div key={step.id} style={{ display: "contents" }}>
            <div className="flex flex-col items-center text-center flex-1 min-w-0 px-1">
              <div
                className={cn(
                  "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ease-in-out",
                  currentStepIndex === index
                    ? "bg-primary border-primary text-primary-foreground scale-110 shadow-lg"
                    : currentStepIndex > index
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-card border-border text-muted-foreground"
                )}
              >
                {currentStepIndex > index ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
              </div>
              <p
                className={cn(
                  "mt-2 text-xs md:text-sm font-medium transition-colors duration-300",
                  currentStepIndex === index ? "text-primary" : currentStepIndex > index ? "text-green-600" : "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
            </div>
            {index < activeCartSteps.length - 1 && (
              <div
                className={cn("flex-auto h-1 mt-5 md:mt-6 transition-colors duration-300", currentStepIndex > index ? "bg-green-500" : "bg-border")}
              />
            )}
          </div>
        ))}
      </div>
      {renderStepContent()}
    </div>
  );
};

export default Cart;
