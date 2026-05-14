import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { bookingsApi } from "@/api/bookings";
import { availabilitySlotsApi } from "@/api/availability-slots";
import type { AvailabilitySlot } from "@/api/types";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { addDays, format, isBefore } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: number;
  listingTitle: string;
  onSuccess?: () => void;
}

const BookingDialog = ({
  open,
  onOpenChange,
  listingId,
  listingTitle,
  onSuccess,
}: BookingDialogProps) => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!listingId) return;

      setLoading(true);
      try {
        const slots = await availabilitySlotsApi.getAvailableSlotsByListingId(listingId);
        setAvailableSlots(slots);
      } catch (err) {
        console.error("Failed to fetch availability slots:", err);
        toast({
          title: t("bookingDialog.failedLoadSlots"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [listingId, toast]);

  const handleSubmit = async () => {
    if (!selectedSlot) {
      toast({
        title: t("bookingDialog.selectSlot"),
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await bookingsApi.create({
        listingId,
        scheduledAt: selectedSlot.startTime,
        availabilitySlotId: selectedSlot.id,
      });

      toast({
        title: t("bookingDialog.sent"),
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to create booking:", err);
      toast({
        title: t("bookingDialog.failed"),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getSlotsForDate = (date: Date | undefined) => {
    if (!date) return [];
    const dateStr = format(date, "yyyy-MM-dd");
    return availableSlots.filter((slot) => {
      const slotDate = new Date(slot.startTime);
      return format(slotDate, "yyyy-MM-dd") === dateStr;
    });
  };

  const filteredSlots = selectedDate ? getSlotsForDate(selectedDate) : [];
  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isBefore(date, today);
  };

  const formatSlotTime = (startTime: string) => {
    const date = new Date(startTime);
    return date.toLocaleTimeString(language === "el" ? "el-GR" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("bookingDialog.title")}: {listingTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {t("bookingDialog.noSlotsAvailable")}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">{t("bookingDialog.selectDate")}</label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disabledDays}
                  fromDate={new Date()}
                  toDate={addDays(new Date(), 90)}
                  className="rounded-md border"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t("bookingDialog.selectTimeSlot")}</label>
                {selectedDate ? (
                  filteredSlots.length > 0 ? (
                    <div className="space-y-2">
                      {filteredSlots.map((slot) => (
                        <div
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedSlot?.id === slot.id
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="font-medium">
                              {formatSlotTime(slot.startTime)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatSlotTime(slot.startTime)} - {formatSlotTime(slot.endTime)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {t("bookingDialog.noSlotsOnDate")}
                    </div>
                  )
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("bookingDialog.selectDateFirst")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedSlot || submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {t("bookingDialog.requestViewing")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
