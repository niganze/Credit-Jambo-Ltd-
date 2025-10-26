import { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const withdrawSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0").max(1000000000, "Amount is too large"),
  description: z.string().trim().max(200, "Description must be less than 200 characters").optional(),
});

const WithdrawDialog = ({ open, onOpenChange }: WithdrawDialogProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);

  useEffect(() => {
    if (open) {
      fetchBalance();
    }
  }, [open]);

  const fetchBalance = async () => {
    const response = await apiClient.getAccount();
    if (!response.error && response.data) {
      setCurrentBalance(Number(response.data.balance) || 0);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = withdrawSchema.parse({
        amount: parseFloat(amount),
        description: description || undefined,
      });

      // Check if sufficient balance
      if (validated.amount > currentBalance) {
        toast.error("Insufficient balance");
        return;
      }

      const response = await apiClient.createWithdrawal({
        amount: validated.amount,
        description: validated.description,
      });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success(`Successfully withdrew ${validated.amount.toFixed(2)} RWF`);
      setAmount("");
      setDescription("");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Withdraw error:", error);
        toast.error("Failed to process withdrawal");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Money</DialogTitle>
          <DialogDescription>
            Withdraw funds from your savings account
          </DialogDescription>
        </DialogHeader>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Available balance: {currentBalance.toFixed(2)} RWF
          </AlertDescription>
        </Alert>

        <form onSubmit={handleWithdraw} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Amount (RWF)</Label>
            <Input
              id="withdraw-amount"
              type="number"
              step="0.01"
              min="0.01"
              max={currentBalance}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="withdraw-description">Description (Optional)</Label>
            <Textarea
              id="withdraw-description"
              placeholder="Add a note..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Withdraw"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawDialog;
