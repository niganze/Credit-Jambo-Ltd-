import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getSession, deposit, getUserById, updateLastActivity } from '@/lib/storage';
import { notifyDeposit } from '@/lib/notifications';
import { ArrowLeft, ArrowDownCircle } from 'lucide-react';

const QUICK_AMOUNTS = [5000, 10000, 20000, 50000, 100000];

const Deposit = () => {
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

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    const depositAmount = parseFloat(amount);

    if (!depositAmount || depositAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
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

      const result = deposit(session.userId, depositAmount, description || 'Deposit');

      if (result.success) {
        await notifyDeposit(depositAmount);
        toast({
          title: 'Success',
          description: result.message
        });
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        toast({
          title: 'Deposit Failed',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred during deposit',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-success to-primary mb-4 shadow-[var(--shadow-elevated)]">
              <ArrowDownCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Deposit Funds</h1>
            <p className="text-muted-foreground">
              Current Balance: RWF {currentBalance.toLocaleString()}
            </p>
          </div>

          <form onSubmit={handleDeposit} className="space-y-6">
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
                step="1"
                className="text-2xl h-14 text-center font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label>Quick Select</Label>
              <div className="grid grid-cols-3 gap-2">
                {QUICK_AMOUNTS.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    onClick={() => handleQuickAmount(quickAmount)}
                    className="h-12"
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
                placeholder="e.g., Monthly savings"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-success to-primary text-lg"
              disabled={loading}
            >
              {loading ? 'Processing...' : `Deposit RWF ${amount || '0'}`}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Deposit;
