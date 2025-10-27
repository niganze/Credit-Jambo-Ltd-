import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getSession, withdraw, getUserById, updateLastActivity } from '@/lib/storage';
import { notifyWithdrawal, notifyLowBalance } from '@/lib/notifications';
import { ArrowLeft, ArrowUpCircle, AlertTriangle } from 'lucide-react';

const QUICK_AMOUNTS = [5000, 10000, 20000, 50000];

const Withdraw = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    const user = getUserById(session.userId);
    if (user) {
      setCurrentBalance(user.balance);
    }

    updateLastActivity();
  }, [navigate]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive'
      });
      return;
    }

    if (withdrawAmount > currentBalance) {
      toast({
        title: 'Insufficient Balance',
        description: 'You cannot withdraw more than your current balance',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const session = getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const result = withdraw(session.userId, withdrawAmount, description || 'Withdrawal');

      if (result.success) {
        await notifyWithdrawal(withdrawAmount);
        
        // Check if balance is low after withdrawal
        if (result.newBalance && result.newBalance < 10000) {
          await notifyLowBalance(result.newBalance);
        }

        toast({
          title: 'Success',
          description: result.message
        });
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        toast({
          title: 'Withdrawal Failed',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred during withdrawal',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    if (quickAmount <= currentBalance) {
      setAmount(quickAmount.toString());
    } else {
      toast({
        title: 'Amount Too High',
        description: 'Selected amount exceeds your balance',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background p-4">
      <div className="max-w-md mx-auto pt-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="p-6 shadow-[var(--shadow-card)]">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-destructive to-warning mb-4 shadow-[var(--shadow-elevated)]">
              <ArrowUpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Withdraw Funds</h1>
            <p className="text-muted-foreground">
              Available Balance: RWF {currentBalance.toLocaleString()}
            </p>
          </div>

          {currentBalance === 0 && (
            <Card className="p-4 mb-6 bg-warning/10 border-warning">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <div>
                  <p className="font-medium text-warning">No Balance</p>
                  <p className="text-sm text-muted-foreground">
                    Please deposit funds before making a withdrawal
                  </p>
                </div>
              </div>
            </Card>
          )}

          <form onSubmit={handleWithdraw} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (RWF)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
                max={currentBalance}
                step="1"
                className="text-2xl h-14 text-center font-bold"
                disabled={currentBalance === 0}
              />
            </div>

            <div className="space-y-2">
              <Label>Quick Select</Label>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_AMOUNTS.filter(amt => amt <= currentBalance).map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    onClick={() => handleQuickAmount(quickAmount)}
                    className="h-12"
                    disabled={currentBalance === 0}
                  >
                    {(quickAmount / 1000).toFixed(0)}K
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="e.g., Emergency expense"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={currentBalance === 0}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-destructive to-warning text-lg"
              disabled={loading || currentBalance === 0}
            >
              {loading ? 'Processing...' : `Withdraw RWF ${amount || '0'}`}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Withdraw;
