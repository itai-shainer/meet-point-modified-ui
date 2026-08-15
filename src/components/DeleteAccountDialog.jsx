import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function DeleteAccountDialog({ open, onOpenChange, darkMode }) {
  const { deleteAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError("");
    try {
      await deleteAccount();
    } catch (err) {
      setError("אירעה שגיאה במחיקת החשבון. אנא נסה שוב.");
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={darkMode ? "bg-gray-800 border-gray-700 text-white" : ""}>
        <AlertDialogHeader>
          <AlertDialogTitle className={darkMode ? "text-white" : ""}>
            מחיקת חשבון
          </AlertDialogTitle>
          <AlertDialogDescription className={darkMode ? "text-gray-300" : ""}>
            האם אתה בטוח שברצונך למחוק לצמיתות את חשבונך? פעולה זו אינה הפיכה וכל הנתונים שלך יימחקו לצמיתות.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        <AlertDialogFooter className="flex-row-reverse gap-2">
          <AlertDialogCancel
            disabled={loading}
            className={darkMode ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600" : ""}
          >
            ביטול
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirmDelete();
            }}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 ml-2 animate-spin" />מוחק...</>
            ) : (
              "אשר מחיקה"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}