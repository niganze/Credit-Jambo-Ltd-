// LocalStorage-based API Client for frontend-only demo
// This simulates a backend using localStorage

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
}

interface Account {
  id: string;
  balance: number;
  currency: string;
  user_id: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
  status: string;
  balance_before: number;
  balance_after: number;
}

class ApiClient {
  private getStorageKey(key: string): string {
    return `credit_jambo_${key}`;
  }

  private getCurrentUserId(): string | null {
    return localStorage.getItem(this.getStorageKey("current_user_id"));
  }

  private setCurrentUserId(userId: string): void {
    localStorage.setItem(this.getStorageKey("current_user_id"), userId);
  }

  private removeCurrentUserId(): void {
    localStorage.removeItem(this.getStorageKey("current_user_id"));
  }

  private getUsers(): User[] {
    const usersJson = localStorage.getItem(this.getStorageKey("users"));
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.getStorageKey("users"), JSON.stringify(users));
  }

  private getAccounts(): Account[] {
    const accountsJson = localStorage.getItem(this.getStorageKey("accounts"));
    return accountsJson ? JSON.parse(accountsJson) : [];
  }

  private saveAccounts(accounts: Account[]): void {
    localStorage.setItem(this.getStorageKey("accounts"), JSON.stringify(accounts));
  }

  private getStoredTransactions(): Transaction[] {
    const transactionsJson = localStorage.getItem(this.getStorageKey("transactions"));
    return transactionsJson ? JSON.parse(transactionsJson) : [];
  }

  private saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(this.getStorageKey("transactions"), JSON.stringify(transactions));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Auth endpoints
  async signUp(userData: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    const users = this.getUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === userData.email)) {
      return { error: "Email already registered" };
    }

    const newUser: User = {
      id: this.generateId(),
      email: userData.email,
      fullName: userData.fullName,
      phone: userData.phone,
    };

    users.push(newUser);
    this.saveUsers(users);

    // Create account for user
    const accounts = this.getAccounts();
    accounts.push({
      id: this.generateId(),
      balance: 0,
      currency: "RWF",
      user_id: newUser.id,
    });
    this.saveAccounts(accounts);

    this.setCurrentUserId(newUser.id);

    return {
      data: {
        user: newUser,
        token: `mock_token_${newUser.id}`,
      },
    };
  }

  async signIn(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    const users = this.getUsers();
    const user = users.find(u => u.email === credentials.email);

    if (!user) {
      return { error: "Invalid email or password" };
    }

    this.setCurrentUserId(user.id);

    return {
      data: {
        user,
        token: `mock_token_${user.id}`,
      },
    };
  }

  async signOut(): Promise<void> {
    this.removeCurrentUserId();
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return { error: "Not authenticated" };
    }

    const users = this.getUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      return { error: "User not found" };
    }

    return { data: user };
  }

  // Account endpoints
  async getAccount(): Promise<ApiResponse<Account>> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return { error: "Not authenticated" };
    }

    const accounts = this.getAccounts();
    const account = accounts.find(a => a.user_id === userId);

    if (!account) {
      return { error: "Account not found" };
    }

    return { data: account };
  }

  // Transaction endpoints
  async getTransactions(limit = 20): Promise<ApiResponse<Transaction[]>> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return { error: "Not authenticated" };
    }

    const transactions = this.getStoredTransactions();
    const userTransactions = transactions
      .filter(t => {
        const accounts = this.getAccounts();
        const account = accounts.find(a => a.user_id === userId);
        return account && t.status === "completed";
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);

    return { data: userTransactions };
  }

  async createDeposit(data: {
    amount: number;
    description?: string;
  }): Promise<ApiResponse<Transaction>> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return { error: "Not authenticated" };
    }

    const accounts = this.getAccounts();
    const accountIndex = accounts.findIndex(a => a.user_id === userId);

    if (accountIndex === -1) {
      return { error: "Account not found" };
    }

    const account = accounts[accountIndex];
    const balanceBefore = account.balance;
    const balanceAfter = balanceBefore + data.amount;

    // Update account balance
    accounts[accountIndex].balance = balanceAfter;
    this.saveAccounts(accounts);

    // Create transaction
    const transaction: Transaction = {
      id: this.generateId(),
      type: "deposit",
      amount: data.amount,
      description: data.description || null,
      created_at: new Date().toISOString(),
      status: "completed",
      balance_before: balanceBefore,
      balance_after: balanceAfter,
    };

    const transactions = this.getStoredTransactions();
    transactions.push(transaction);
    this.saveTransactions(transactions);

    return { data: transaction };
  }

  async createWithdrawal(data: {
    amount: number;
    description?: string;
  }): Promise<ApiResponse<Transaction>> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return { error: "Not authenticated" };
    }

    const accounts = this.getAccounts();
    const accountIndex = accounts.findIndex(a => a.user_id === userId);

    if (accountIndex === -1) {
      return { error: "Account not found" };
    }

    const account = accounts[accountIndex];

    if (account.balance < data.amount) {
      return { error: "Insufficient balance" };
    }

    const balanceBefore = account.balance;
    const balanceAfter = balanceBefore - data.amount;

    // Update account balance
    accounts[accountIndex].balance = balanceAfter;
    this.saveAccounts(accounts);

    // Create transaction
    const transaction: Transaction = {
      id: this.generateId(),
      type: "withdrawal",
      amount: data.amount,
      description: data.description || null,
      created_at: new Date().toISOString(),
      status: "completed",
      balance_before: balanceBefore,
      balance_after: balanceAfter,
    };

    const transactions = this.getStoredTransactions();
    transactions.push(transaction);
    this.saveTransactions(transactions);

    return { data: transaction };
  }
}

export const apiClient = new ApiClient();
