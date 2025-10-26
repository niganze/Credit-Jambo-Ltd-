import { useEffect, useState } from "react";
// import { supabase } from "../integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowDown, ArrowUp, Clock } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
  status: string;
}

interface TransactionHistoryProps {
  userId: string;
}

const TransactionHistory = ({ userId }: TransactionHistoryProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching transactions:", error);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();

    // Set up realtime subscription
    const channel = supabase
      .channel("transaction-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No transactions yet</p>
            <p className="text-sm mt-2">Start by making a deposit!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "deposit"
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {transaction.type === "deposit" ? (
                      <ArrowDown className="w-5 h-5" />
                    ) : (
                      <ArrowUp className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{transaction.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.description || "No description"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(transaction.created_at), "PPp")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      transaction.type === "deposit"
                        ? "text-success"
                        : "text-destructive"
                    }`}
                  >
                    {transaction.type === "deposit" ? "+" : "-"}
                    {formatCurrency(Number(transaction.amount))} RWF
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
