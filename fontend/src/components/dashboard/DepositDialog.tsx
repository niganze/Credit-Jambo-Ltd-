import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const depositSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0").max(1000000000, "Amount is too large"),
  description: z.string().trim().max(200, "Description must be less than 200 characters").optional(),
});

const DepositDialog = ({ open, onOpenChange }: DepositDialogProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = depositSchema.parse({
        amount: parseFloat(amount),
        description: description || undefined,
      });

      const response = await apiClient.createDeposit({
        amount: validated.amount,
        description: validated.description,
      });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success(`Successfully deposited ${validated.amount.toFixed(2)} RWF`);
      setAmount("");
      setDescription("");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Deposit error:", error);
        toast.error("Failed to process deposit");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit Money</DialogTitle>
          <DialogDescription>
            Add funds to your savings account
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleDeposit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-amount">Amount (RWF)</Label>
            <Input
              id="deposit-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deposit-description">Description (Optional)</Label>
            <Textarea
              id="deposit-description"
              placeholder="Add a note..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Deposit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepositDialog;
