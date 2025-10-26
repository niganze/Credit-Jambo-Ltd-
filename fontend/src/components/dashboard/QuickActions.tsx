import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import DepositDialog from "./DepositDialog";
import WithdrawDialog from "./WithdrawDialog";

const QuickActions = () => {
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          size="lg"
          className="h-20 bg-gradient-success hover:bg-success/90 text-success-foreground"
          onClick={() => setShowDeposit(true)}
        >
          <Plus className="w-6 h-6 mr-2" />
          Deposit Money
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-20 border-2"
          onClick={() => setShowWithdraw(true)}
        >
          <Minus className="w-6 h-6 mr-2" />
          Withdraw Money
        </Button>
      </div>

      <DepositDialog
        open={showDeposit}
        onOpenChange={setShowDeposit}
      />
      <WithdrawDialog
        open={showWithdraw}
        onOpenChange={setShowWithdraw}
      />
    </>
  );
};

export default QuickActions;
