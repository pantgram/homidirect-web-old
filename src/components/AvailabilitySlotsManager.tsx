import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { availabilitySlotsApi } from "@/api/availability-slots";
import type { AvailabilitySlot } from "@/types";
import AvailabilitySlotForm from "@/components/AvailabilitySlotForm";
import { Calendar as CalendarIcon, Clock, Trash2, Plus, Loader2, List } from "lucide-react";
import { format, isPast, isSameDay, addMonths, subMonths } from "date-fns";

interface AvailabilitySlotsManagerProps {
  listingId: number;
}

const AvailabilitySlotsManager = ({
  listingId,
}: AvailabilitySlotsManagerProps) => {
  const { t } = useLanguage();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const data = await availabilitySlotsApi.getByListingId(listingId);
      setSlots(data);
    } catch (err) {
      toast({
        title: t("availabilitySlots.loadingSlots"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [listingId, t]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this slot?")) {
      return;
    }

    setDeletingId(id);
    try {
      await availabilitySlotsApi.delete(id);
      setSlots((prev) => prev.filter((s) => s.id !== id));
      toast({
        title: t("availabilitySlots.deleted"),
      });
    } catch (err) {
      toast({
        title: t("availabilitySlots.deleteFailed"),
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
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
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day}>{day}</div>
              ))}
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
                        onClick={() => handleDelete(slot.id)}
                        disabled={deletingId === slot.id || slot.isBooked}
                      >
                        {deletingId === slot.id ? (
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
                            onClick={() => handleDelete(slot.id)}
                            disabled={deletingId === slot.id || slot.isBooked}
                          >
                            {deletingId === slot.id ? (
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
        <AvailabilitySlotForm
          open={showForm}
          onOpenChange={setShowForm}
          listingId={listingId}
          onSuccess={fetchSlots}
        />
      )}
    </Card>
  );
};

export default AvailabilitySlotsManager;
