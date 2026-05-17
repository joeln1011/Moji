import { useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TriangleAlert } from 'lucide-react';

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
}

const DeleteAccountModal = ({ open, onClose }: DeleteAccountModalProps) => {
  const { deleteAccount, loading } = useAuthStore();
  const [confirmation, setConfirmation] = useState('');

  const handleClose = () => {
    setConfirmation('');
    onClose();
  };

  const handleDelete = async () => {
    await deleteAccount();
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <TriangleAlert className="size-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription className="space-y-2 pt-1">
            <span className="block">
              This action is <strong>permanent and cannot be undone</strong>.
              Your account, messages, and all associated data will be deleted.
            </span>
            <span className="block">
              Type <strong>DELETE</strong> to confirm.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Label htmlFor="delete-confirm" className="sr-only">
            Confirmation
          </Label>
          <Input
            id="delete-confirm"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="Type DELETE here"
            className="font-mono"
            autoComplete="off"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmation !== 'DELETE' || loading}
          >
            {loading ? 'Deleting…' : 'Delete Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountModal;
