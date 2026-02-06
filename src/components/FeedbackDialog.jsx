import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, Loader2, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function FeedbackDialog({ 
  triggerText = "שלח לנו משוב", 
  title = "נשמח לשמוע ממך",
  description = "ספר לנו מה אפשר לשפר או אם נתקלת בבעיה",
  darkMode = false,
  routeInfo = null,
  variant = "outline",
  hideIcon = false
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.email) {
          setEmail(user.email);
        }
      } catch (error) {
        console.log("User not authenticated");
      }
    };
    fetchUserEmail();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    setSending(true);
    setError(false);
    try {
      const user = await base44.auth.me();
      
      let emailBody = `משוב מהאפליקציה Meet Point\n\n${message}\n\n---\n`;
      if (email && email !== user.email) {
        emailBody += `מייל ליצירת קשר: ${email}\n`;
      }
      emailBody += `נשלח על ידי: ${user.email}\n`;
      if (routeInfo) {
        emailBody += `\nפרטי מסלול:\n`;
        emailBody += `מוצא נהג: ${routeInfo.driverOrigin}\n`;
        emailBody += `מוצא נוסע: ${routeInfo.passengerOrigin}\n`;
        emailBody += `יעד: ${routeInfo.destination}\n`;
      }

      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: routeInfo ? "משוב על חישוב מסלול - Meet Point" : "הודעת משוב כללית - Meet Point",
        body: emailBody,
      });

      setSent(true);
      setTimeout(() => {
        setOpen(false);
        setSent(false);
        setMessage("");
        setError(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to send feedback:", error);
      setError(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={`${darkMode ? "border-gray-700" : ""} ${hideIcon ? "w-full justify-start" : ""}`}>
          {!hideIcon && <MessageSquare className="w-4 h-4 ml-2" />}
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className={darkMode ? "bg-gray-800 border-gray-700 text-white" : ""}>
        {sent ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">תודה רבה!</h3>
            <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
              קיבלנו את המשוב שלך ונחזור אליך בהקדם
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">שגיאה בשליחה</h3>
            <p className={`mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              לא הצלחנו לשלוח את ההודעה. אנא נסה שוב.
            </p>
            <Button
              onClick={() => setError(false)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              נסה שוב
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className={darkMode ? "text-gray-400" : ""}>
                {description}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`text-sm font-medium mb-2 block ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  אימייל (אופציונלי - אם תרצו שנחזור אליכם)
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={darkMode ? "bg-gray-700 border-gray-600 text-white" : ""}
                />
              </div>
              <div>
                <label className={`text-sm font-medium mb-2 block ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  ההודעה שלך
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="ספר לנו מה קרה או מה אפשר לשפר..."
                  className={`min-h-[120px] ${darkMode ? "bg-gray-700 border-gray-600 text-white" : ""}`}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={sending || !message.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    שולח...
                  </>
                ) : (
                  "שלח משוב"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}