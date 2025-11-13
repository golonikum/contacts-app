import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventName: string) => void;
}

export function EventDialog({ isOpen, onClose, onSubmit }: EventDialogProps) {
  const [eventName, setEventName] = useState("");

  const handleSubmit = () => {
    if (eventName.trim()) {
      onSubmit(eventName.trim());
      setEventName("");
      onClose();
    }
  };

  const handleClose = () => {
    setEventName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить событие</DialogTitle>
          <DialogDescription>
            Введите название события, которое вы хотите добавить.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="eventName" className="text-right">
              Название
            </Label>
            <Input
              id="eventName"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="col-span-3"
              placeholder="Например: День рождения"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
