import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSession, getUserById, getTransactions, checkSessionTimeout, updateLastActivity } from '@/lib/storage';
import { Wallet, ArrowUpCircle, ArrowDownCircle, History, LogOut, User, AlertTriangle } from 'lucide-react';
import type { User as UserType, Transaction } from '@/lib/storage';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showLowBalanceAlert, setShowLowBalanceAlert] = useState(false);

  useEffect(() => {
    // Check session on mount
    const session = getSession();
    if (!session || checkSessionTimeout()) {
      navigate('/login');
      return;
    }

    // Load user data
    const userData = getUserById(session.userId);
    if (userData) {
      setUser(userData);
      setTransactions(getTransactions(session.userId));
      
      // Check for low balance
      if (userData.balance < 10000) {
        setShowLowBalanceAlert(true);
      }
    }

    // Set up activity tracker
    const activityInterval = setInterval(() => {
      if (checkSessionTimeout()) {
        navigate('/login');
      } else {
        updateLastActivity();
      }
    }, 60000); // Check every minute

    // Track user activity
    const handleActivity = () => updateLastActivity();
    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      clearInterval(activityInterval);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('credit_jambo_session');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground p-6 rounded-b-[2rem] shadow-[var(--shadow-elevated)]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm opacity-90">Welcome back</p>
            <h1 className="text-2xl font-bold">{user.fullName}</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            className="text-primary-foreground hover:bg-white/10"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>

        {/* Balance Card */}
        <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-5 h-5" />
            <p className="text-sm opacity-90">Total Balance</p>
          </div>
          <p className="text-4xl font-bold">RWF {user.balance.toLocaleString()}</p>
        </Card>
      </div>

      {/* Low Balance Alert */}
      {showLowBalanceAlert && (
        <div className="mx-4 mt-4">
          <Card className="p-4 bg-warning/10 border-warning">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <div>
                <p className="font-medium text-warning">Low Balance Alert</p>
                <p className="text-sm text-muted-foreground">
                  Your balance is below RWF 10,000. Consider making a deposit.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-6 grid grid-cols-2 gap-4">
        <Button
          onClick={() => navigate('/deposit')}
          className="h-24 flex-col gap-2 bg-gradient-to-br from-success to-primary hover:opacity-90"
          size="lg"
        >
          <ArrowDownCircle className="w-6 h-6" />
          <span>Deposit</span>
        </Button>
        <Button
          onClick={() => navigate('/withdraw')}
          className="h-24 flex-col gap-2 bg-gradient-to-br from-destructive to-warning hover:opacity-90"
          size="lg"
        >
          <ArrowUpCircle className="w-6 h-6" />
          <span>Withdraw</span>
        </Button>
      </div>

      {/* Recent Transactions */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Transactions
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/transactions')}
          >
            View All
          </Button>
        </div>

        {transactions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start by making your first deposit
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <Card key={transaction.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'deposit'
                          ? 'bg-success/10'
                          : 'bg-destructive/10'
                      }`}
                    >
                      {transaction.type === 'deposit' ? (
                        <ArrowDownCircle className="w-5 h-5 text-success" />
                      ) : (
                        <ArrowUpCircle className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{transaction.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        transaction.type === 'deposit'
                          ? 'text-success'
                          : 'text-destructive'
                      }`}
                    >
                      {transaction.type === 'deposit' ? '+' : '-'}
                      RWF {transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Balance: {transaction.balanceAfter.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-inset-bottom">
        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
          <Button
            variant="ghost"
            className="flex-col h-auto py-3"
            onClick={() => navigate('/dashboard')}
          >
            <Wallet className="w-5 h-5 mb-1 text-primary" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col h-auto py-3"
            onClick={() => navigate('/transactions')}
          >
            <History className="w-5 h-5 mb-1" />
            <span className="text-xs">History</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col h-auto py-3"
            onClick={() => navigate('/profile')}
          >
            <User className="w-5 h-5 mb-1" />
            <span className="text-xs">Profile</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col h-auto py-3"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mb-1" />
            <span className="text-xs">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
