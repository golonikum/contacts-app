import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: "success" | "error";
}

export function Toast({ message, isVisible, onClose, type = "success" }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  if (!show) return null;

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg flex items-center gap-2 z-50 ${
      type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
    }`}>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="p-1 rounded-full hover:bg-black/20 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
