import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/lib/toast";
import { availabilitySlotsApi } from "@/api/availability-slots";
import { Loader2, Clock } from "lucide-react";
import { format, isSameDay } from "date-fns";

import type { AvailabilitySlot } from "@/types";

interface AvailabilitySlotFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: number;
  onSuccess?: () => void;
}

const AvailabilitySlotForm = ({
  open,
  onOpenChange,
  listingId,
  onSuccess,
}: AvailabilitySlotFormProps) => {
  const { t, language } = useLanguage();
  const [date, setDate] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [, setLoadingSlots] = useState(false);
  const [existingSlots, setExistingSlots] = useState<AvailabilitySlot[]>([]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!listingId || !open) return;

      setLoadingSlots(true);
      try {
        const slots = await availabilitySlotsApi.getByListingId(listingId);
        setExistingSlots(slots);
      } catch {
        // ignore — existing slots are non-critical
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [listingId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !startTime || !endTime) {
      toast({
        title: t("availabilitySlots.fillAll"),
        variant: "destructive",
      });
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (endDateTime <= startDateTime) {
      toast({
        title: t("availabilitySlots.endAfterStart"),
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await availabilitySlotsApi.create({
        listingId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });

      toast({
        title: t("availabilitySlots.added"),
      });

      setDate("");
      setStartTime("");
      setEndTime("");
      setSelectedDate(new Date());
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast({
        title: t("availabilitySlots.addFailed"),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getSlotsForDate = (date: Date | undefined) => {
    if (!date) return [];
    return existingSlots.filter((slot) => {
      const slotDate = new Date(slot.startTime);
      return isSameDay(slotDate, date);
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setDate(format(date, "yyyy-MM-dd"));
    }
  };

  const formatSlotTime = (startTime: string) => {
    const d = new Date(startTime);
    return d.toLocaleTimeString(language === "el" ? "el-GR" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const slotsForSelectedDate = getSlotsForDate(selectedDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("availabilitySlots.addTitle")}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <label className="text-sm font-medium block">{t("availabilitySlots.selectDate")}</label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              fromDate={new Date()}
              className="rounded-md border"
            />
          </div>

          <div className="space-y-4">
            {slotsForSelectedDate.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">{t("availabilitySlots.existingSlots")} {format(selectedDate!, "MMM d, yyyy")}</label>
                <div className="space-y-2">
                  {slotsForSelectedDate.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3 border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">
                            {formatSlotTime(slot.startTime)} - {formatSlotTime(slot.endTime)}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            slot.isBooked
                              ? "bg-yellow-500/10 text-yellow-600"
                              : "bg-green-500/10 text-green-600"
                          }`}
                        >
                          {slot.isBooked ? t("availabilitySlots.booked") : t("availabilitySlots.available")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="date">{t("availabilitySlots.date")}</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">{t("availabilitySlots.startTime")}</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">{t("availabilitySlots.endTime")}</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("availabilitySlots.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {t("availabilitySlots.addSlot")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvailabilitySlotForm;
