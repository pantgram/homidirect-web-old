import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  useListingTimeSlots,
  useDeleteTimeSlot,
  timeSlotKeys,
} from "@/hooks";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import TimeSlotForm from "@/components/TimeSlotForm";
import { Calendar as CalendarIcon, Clock, Trash2, Plus, Loader2, List, Video } from "lucide-react";
import { format, isPast, isSameDay, addMonths, subMonths } from "date-fns";

interface TimeSlotsManagerProps {
  listingId: number;
}

const TimeSlotsManager = ({
  listingId,
}: TimeSlotsManagerProps) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: slots = [], isLoading: loading } = useListingTimeSlots(listingId);
  const deleteMutation = useDeleteTimeSlot();
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const refreshSlots = () => {
    queryClient.invalidateQueries({
      queryKey: timeSlotKeys.byListing(listingId),
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget === null) return;
    const id = deleteTarget;
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: t("availabilitySlots.deleted") });
    } catch (err) {
      toast({ title: t("availabilitySlots.deleteFailed"), variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const getSlotsForDate = (date: Date) => {
    return slots.filter((slot) => {
      const slotDate = new Date(slot.startTime);
      return isSameDay(slotDate, date);
    });
  };

  const hasSlots = (date: Date) => {
    return getSlotsForDate(date).length > 0;
  };

  const formatSlotTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = start.toDateString() === today.toDateString();

    return {
      date: isToday ? t("availabilitySlots.today") : format(start, "MMM d, yyyy"),
      time: `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`,
    };
  };

  const renderSlotType = (type: string) => (
    <Badge variant="outline" className="gap-1">
      {type === "REMOTE" && <Video className="h-3 w-3" />}
      {type === "REMOTE"
        ? t("availabilitySlots.typeRemote")
        : t("availabilitySlots.typeOnSite")}
    </Badge>
  );

  const pastSlots = slots.filter((slot) => isPast(new Date(slot.endTime)));
  const upcomingSlots = slots.filter((slot) => !isPast(new Date(slot.endTime)));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          {t("availabilitySlots.title")}
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg p-1">
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
              className="h-8"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "calendar" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("calendar")}
              className="h-8"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("availabilitySlots.addSlot")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("availabilitySlots.noSlots")}</p>
            <p className="text-sm mt-1">
              {t("availabilitySlots.noSlotsDesc")}
            </p>
          </div>
        ) : view === "calendar" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                {t("availabilitySlots.previous")}
              </Button>
              <h3 className="font-semibold">{format(currentMonth, "MMMM yyyy")}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                {t("availabilitySlots.next")}
              </Button>
            </div>
            <Calendar
              mode="single"
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={{
                hasSlots: (date) => hasSlots(date),
              }}
              modifiersStyles={{
                hasSlots: {
                  backgroundColor: "rgba(34, 197, 94, 0.2)",
                  fontWeight: "bold",
                },
              }}
              className="rounded-md border"
            />
            <div className="space-y-3">
              {upcomingSlots.map((slot) => {
                const { date, time } = formatSlotTime(
                  slot.startTime,
                  slot.endTime
                );
                return (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">{time}</p>
                        <p className="text-sm text-muted-foreground">{date}</p>
                      </div>
                    </div>
                        <div className="flex items-center gap-2">
                          {renderSlotType(slot.type)}
                          {slot.isBooked && (
                            <Badge className="bg-yellow-500/10 text-yellow-600">
                              {t("availabilitySlots.booked")}
                            </Badge>
                          )}
                          {!slot.isBooked && (
                            <Badge className="bg-green-500/10 text-green-600">
                              {t("availabilitySlots.available")}
                            </Badge>
                          )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(slot.id)}
                        disabled={(deleteMutation.isPending && deleteMutation.variables === slot.id) || slot.isBooked}
                      >
                        {deleteMutation.isPending && deleteMutation.variables === slot.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {upcomingSlots.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-sm">{t("availabilitySlots.upcoming")}</h4>
                <div className="space-y-2">
                  {upcomingSlots.map((slot) => {
                    const { date, time } = formatSlotTime(
                      slot.startTime,
                      slot.endTime
                    );
                    return (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium">{time}</p>
                            <p className="text-sm text-muted-foreground">{date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderSlotType(slot.type)}
                          {slot.isBooked && (
                            <Badge className="bg-yellow-500/10 text-yellow-600">
                              {t("availabilitySlots.booked")}
                            </Badge>
                          )}
                          {!slot.isBooked && (
                            <Badge className="bg-green-500/10 text-green-600">
                              {t("availabilitySlots.available")}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(slot.id)}
                            disabled={(deleteMutation.isPending && deleteMutation.variables === slot.id) || slot.isBooked}
                          >
                            {deleteMutation.isPending && deleteMutation.variables === slot.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {pastSlots.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3 text-sm">{t("availabilitySlots.past")}</h4>
                <div className="space-y-2">
                  {pastSlots.map((slot) => {
                    const { date, time } = formatSlotTime(
                      slot.startTime,
                      slot.endTime
                    );
                    return (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 border rounded-lg opacity-60"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{time}</p>
                            <p className="text-sm text-muted-foreground">{date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderSlotType(slot.type)}
                          {slot.isBooked && (
                            <Badge className="bg-yellow-500/10 text-yellow-600">
                              {t("availabilitySlots.booked")}
                            </Badge>
                          )}
                          {!slot.isBooked && (
                            <Badge className="bg-gray-500/10 text-gray-600">
                              {t("availabilitySlots.unbooked")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {showForm && (
        <TimeSlotForm
          open={showForm}
          onOpenChange={setShowForm}
          listingId={listingId}
          onSuccess={refreshSlots}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("listingBookings.delete")}
        description={t("listingBookings.deleteSlotConfirm")}
        onConfirm={handleConfirmDelete}
        confirmLabel={t("listingBookings.delete")}
        destructive
        isLoading={deleteMutation.isPending}
      />
    </Card>
  );
};

export default TimeSlotsManager;
