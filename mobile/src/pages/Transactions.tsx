import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getSession, getTransactions, updateLastActivity } from '@/lib/storage';
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, Filter } from 'lucide-react';
import type { Transaction } from '@/lib/storage';

const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdraw'>('all');

  useEffect(() => {
    const session = getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    const allTransactions = getTransactions(session.userId);
    setTransactions(allTransactions);
    updateLastActivity();
  }, [navigate]);

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const totalDeposits = transactions
    .filter((t) => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === 'withdraw')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background pb-24">
      <div className="p-4 bg-gradient-to-r from-primary to-primary-light text-primary-foreground rounded-b-[2rem] shadow-[var(--shadow-elevated)]">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4 text-primary-foreground hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-2xl font-bold mb-6">Transaction History</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
            <p className="text-sm opacity-90 mb-1">Total Deposits</p>
            <p className="text-xl font-bold">+RWF {totalDeposits.toLocaleString()}</p>
          </Card>
          <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
            <p className="text-sm opacity-90 mb-1">Total Withdrawals</p>
            <p className="text-xl font-bold">-RWF {totalWithdrawals.toLocaleString()}</p>
          </Card>
        </div>
      </div>

      <div className="p-4">
        {/* Filter Buttons */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'deposit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('deposit')}
            >
              Deposits
            </Button>
            <Button
              variant={filter === 'withdraw' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('withdraw')}
            >
              Withdrawals
            </Button>
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No transactions found</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
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
                        {transaction.description}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-bold text-lg ${
                      transaction.type === 'deposit'
                        ? 'text-success'
                        : 'text-destructive'
                    }`}
                  >
                    {transaction.type === 'deposit' ? '+' : '-'}
                    {transaction.amount.toLocaleString()}
                  </p>
                </div>

                <div className="flex justify-between text-sm border-t border-border pt-3">
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Balance After</p>
                    <p className="font-medium">
                      RWF {transaction.balanceAfter.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
