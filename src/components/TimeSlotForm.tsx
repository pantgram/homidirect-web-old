import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/lib/toast";
import { useCreateTimeSlot, useListingTimeSlots } from "@/hooks";
import { Loader2, Clock } from "lucide-react";
import { format, isSameDay } from "date-fns";

import type { TimeSlotType } from "@/types";

interface TimeSlotFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: number;
  onSuccess?: () => void;
}

const TimeSlotForm = ({
  open,
  onOpenChange,
  listingId,
  onSuccess,
}: TimeSlotFormProps) => {
  const { t, language } = useLanguage();
  const [date, setDate] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("");
  const [slotType, setSlotType] = useState<TimeSlotType>("ON_SITE");
  const [meetLink, setMeetLink] = useState("");
  const { data: existingSlots = [] } = useListingTimeSlots(listingId);
  const createMutation = useCreateTimeSlot();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !startTime) {
      toast({
        title: t("availabilitySlots.fillAll"),
        variant: "destructive",
      });
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}`);

    try {
      // The API only takes the start time; the end time is derived server-side.
      await createMutation.mutateAsync({
        listingId,
        startTime: startDateTime.toISOString(),
        type: slotType,
        meetLink: slotType === "REMOTE" && meetLink ? meetLink : null,
      });

      toast({
        title: t("availabilitySlots.added"),
      });

      setDate("");
      setStartTime("");
      setMeetLink("");
      setSelectedDate(new Date());
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast({
        title: t("availabilitySlots.addFailed"),
        variant: "destructive",
      });
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
  const submitting = createMutation.isPending;

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
                <Label>{t("availabilitySlots.slotType")}</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    type="button"
                    variant={slotType === "ON_SITE" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSlotType("ON_SITE")}
                  >
                    {t("availabilitySlots.typeOnSite")}
                  </Button>
                  <Button
                    type="button"
                    variant={slotType === "REMOTE" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSlotType("REMOTE")}
                  >
                    {t("availabilitySlots.typeRemote")}
                  </Button>
                </div>
              </div>

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

              {slotType === "REMOTE" && (
                <div>
                  <Label htmlFor="meetLink">{t("availabilitySlots.meetLink")}</Label>
                  <Input
                    id="meetLink"
                    type="url"
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("availabilitySlots.meetLinkHint")}
                  </p>
                </div>
              )}
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

export default TimeSlotForm;
