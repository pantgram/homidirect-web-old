import { useState } from "react";
import { Loader2, Send, User, Mail, Phone, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/lib/toast";
import { listingsApi } from "@/api/listings";

interface ContactOwnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingTitle: string;
  listingId: number;
}

const ContactOwnerDialog = ({
  open,
  onOpenChange,
  listingTitle,
  listingId,
}: ContactOwnerDialogProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user ? `${user.firstName} ${user.lastName}`.trim() : "",
    email: user?.email || "",
    phone: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: t("contactOwner.error"),
        description: t("contactOwner.fillRequired"),
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      await listingsApi.contactOwner(listingId, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        message: formData.message,
      });

      setSent(true);
      toast({
        title: t("contactOwner.sent"),
        description: t("contactOwner.sentDesc"),
      });

      // Reset form after delay and close
      setTimeout(() => {
        setSent(false);
        setFormData({
          name: user ? `${user.firstName} ${user.lastName}`.trim() : "",
          email: user?.email || "",
          phone: "",
          message: "",
        });
        onOpenChange(false);
      }, 2000);
    } catch {
      toast({
        title: t("contactOwner.error"),
        description: t("contactOwner.sendFailed"),
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      onOpenChange(false);
      setSent(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {t("contactOwner.title")}
          </DialogTitle>
          <DialogDescription>
            {t("contactOwner.subtitle")} <strong>{listingTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t("contactOwner.sent")}
            </h3>
            <p className="text-muted-foreground">
              {t("contactOwner.sentDesc")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t("contactOwner.name")} *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t("contactOwner.namePlaceholder")}
                  disabled={sending}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {t("contactOwner.email")} *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t("contactOwner.emailPlaceholder")}
                  disabled={sending}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {t("contactOwner.phone")}
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder={t("contactOwner.phonePlaceholder")}
                disabled={sending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {t("contactOwner.message")} *
              </Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder={t("contactOwner.messagePlaceholder")}
                rows={4}
                disabled={sending}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={sending}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={sending}>
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("contactOwner.sending")}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {t("contactOwner.send")}
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {t("contactOwner.privacyNote")}
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContactOwnerDialog;
