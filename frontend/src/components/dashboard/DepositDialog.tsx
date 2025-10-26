import { useState } from "react";
// import { supabase } from "../integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "..//ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { z } from "zod";

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const depositSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0").max(1000000000, "Amount is too large"),
  description: z.string().trim().max(200, "Description must be less than 200 characters").optional(),
});

const DepositDialog = ({ open, onOpenChange, userId }: DepositDialogProps) => {
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

      // Get current account
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .select("id, balance")
        .eq("user_id", userId)
        .single();

      if (accountError) throw accountError;

      const currentBalance = Number(account.balance) || 0;
      const newBalance = currentBalance + validated.amount;

      // Update balance
      const { error: updateError } = await supabase
        .from("accounts")
        .update({ balance: newBalance })
        .eq("id", account.id);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          account_id: account.id,
          type: "deposit",
          amount: validated.amount,
          balance_before: currentBalance,
          balance_after: newBalance,
          description: validated.description || "Deposit",
          status: "completed",
        });

      if (transactionError) throw transactionError;

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
