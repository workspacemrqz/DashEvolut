import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  isLoading?: boolean;
}

export default function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  itemName,
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] container-bg border-border-secondary">
        <DialogHeader>
          <DialogTitle className="text-text-primary">{title}</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Tem certeza que deseja remover <strong>{itemName}</strong>? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-auto"
          >
            {isLoading ? "Removendo..." : "Remover"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
