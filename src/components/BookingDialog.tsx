import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/lib/toast";
import {
  useAvailableTimeSlots,
  useClaimTimeSlot,
  useProposeTimeSlot,
} from "@/hooks";
import type { TimeSlot, TimeSlotType } from "@/types";
import { Calendar as CalendarIcon, Clock, Loader2, Plus } from "lucide-react";
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
  const { t, language } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [proposeMode, setProposeMode] = useState(false);
  const [proposeDate, setProposeDate] = useState("");
  const [proposeTime, setProposeTime] = useState("");
  const [proposeType, setProposeType] = useState<TimeSlotType>("ON_SITE");
  const [meetLink, setMeetLink] = useState("");

  const { data: availableSlots = [], isLoading: loading, error } =
    useAvailableTimeSlots(listingId, { enabled: open });
  const claimMutation = useClaimTimeSlot();
  const proposeMutation = useProposeTimeSlot();

  // Reset the custom-time form each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setSelectedSlot(null);
    setProposeMode(false);
    setProposeDate("");
    setProposeTime("");
    setProposeType("ON_SITE");
    setMeetLink("");
  }, [open]);

  // With no open windows, proposing a custom time is the only option.
  useEffect(() => {
    if (open && availableSlots.length === 0) setProposeMode(true);
  }, [open, availableSlots.length]);

  const handleClaim = async () => {
    if (!selectedSlot) {
      toast({
        title: t("bookingDialog.selectSlot"),
        variant: "destructive",
      });
      return;
    }

    try {
      await claimMutation.mutateAsync({ id: selectedSlot.id });
      toast({
        title: t("bookingDialog.sent"),
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast({
        title: t("bookingDialog.failed"),
        variant: "destructive",
      });
    }
  };

  const handlePropose = async () => {
    if (!proposeDate || !proposeTime) {
      toast({
        title: t("availabilitySlots.fillAll"),
        variant: "destructive",
      });
      return;
    }

    try {
      await proposeMutation.mutateAsync({
        listingId,
        startTime: new Date(`${proposeDate}T${proposeTime}`).toISOString(),
        type: proposeType,
        meetLink: proposeType === "REMOTE" && meetLink ? meetLink : null,
      });
      toast({
        title: t("bookingDialog.proposed"),
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast({
        title: t("bookingDialog.proposeFailed"),
        variant: "destructive",
      });
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

  const submitting = claimMutation.isPending || proposeMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("bookingDialog.title")}: {listingTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!proposeMode &&
            (error ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {t("bookingDialog.failedLoadSlots")}
                </p>
              </div>
            ) : loading ? (
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
            ))}

          {proposeMode && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="proposeDate">{t("bookingDialog.proposeDate")}</Label>
                  <Input
                    id="proposeDate"
                    type="date"
                    value={proposeDate}
                    onChange={(e) => setProposeDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="proposeTime">{t("bookingDialog.proposeTime")}</Label>
                  <Input
                    id="proposeTime"
                    type="time"
                    value={proposeTime}
                    onChange={(e) => setProposeTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>{t("availabilitySlots.slotType")}</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    type="button"
                    variant={proposeType === "ON_SITE" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setProposeType("ON_SITE")}
                  >
                    {t("availabilitySlots.typeOnSite")}
                  </Button>
                  <Button
                    type="button"
                    variant={proposeType === "REMOTE" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setProposeType("REMOTE")}
                  >
                    {t("availabilitySlots.typeRemote")}
                  </Button>
                </div>
              </div>

              {proposeType === "REMOTE" && (
                <div>
                  <Label htmlFor="proposeMeetLink">{t("availabilitySlots.meetLink")}</Label>
                  <Input
                    id="proposeMeetLink"
                    type="url"
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("availabilitySlots.meetLinkHint")}
                  </p>
                </div>
              )}
            </div>
          )}

          {availableSlots.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {proposeMode ? (
                <button
                  type="button"
                  className="underline text-primary"
                  onClick={() => setProposeMode(false)}
                >
                  {t("bookingDialog.backToOpenSlots")}
                </button>
              ) : (
                <>
                  {t("bookingDialog.orProposeDifferent")}{" "}
                  <button
                    type="button"
                    className="underline text-primary inline-flex items-center gap-1"
                    onClick={() => setProposeMode(true)}
                  >
                    <Plus className="h-3 w-3" />
                    {t("bookingDialog.proposeViewing")}
                  </button>
                </>
              )}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          {proposeMode ? (
            <Button
              onClick={handlePropose}
              disabled={submitting || !proposeDate || !proposeTime}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t("bookingDialog.proposeSubmit")}
            </Button>
          ) : (
            <Button
              onClick={handleClaim}
              disabled={!selectedSlot || submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t("bookingDialog.requestViewing")}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
