class PriorityQueue {
  constructor(higherPriority) {
    this.items = [];
    this.higherPriority = higherPriority;
  }

  get size() {
    return this.items.length;
  }

  push(item) {
    this.items.push(item);
    let index = this.items.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (!this.higherPriority(this.items[index], this.items[parent])) break;
      [this.items[index], this.items[parent]] = [this.items[parent], this.items[index]];
      index = parent;
    }
  }

  pop() {
    if (this.items.length === 0) return undefined;
    const top = this.items[0];
    const last = this.items.pop();
    if (this.items.length > 0) {
      this.items[0] = last;
      let index = 0;
      while (true) {
        let highest = index;
        const left = 2 * index + 1;
        const right = left + 1;
        if (left < this.items.length && this.higherPriority(this.items[left], this.items[highest])) highest = left;
        if (right < this.items.length && this.higherPriority(this.items[right], this.items[highest])) highest = right;
        if (highest === index) break;
        [this.items[index], this.items[highest]] = [this.items[highest], this.items[index]];
        index = highest;
      }
    }
    return top;
  }
}

export function simplifyDebts(balances) {
  let total = 0;
  for (const entry of balances) {
    if (!Number.isSafeInteger(entry.balance)) throw new Error('Balances must be integers (paise)');
    total += entry.balance;
    if (!Number.isSafeInteger(total)) throw new Error('Balance total exceeds the safe integer range');
  }
  if (total !== 0) throw new Error(`Balances do not add up to zero (off by ${total})`);

  const higherPriority = (first, second) => (
    first.amount !== second.amount ? first.amount > second.amount : first.id < second.id
  );
  const creditors = new PriorityQueue(higherPriority);
  const debtors = new PriorityQueue(higherPriority);

  for (const { member, balance } of balances) {
    const id = String(member);
    if (balance > 0) creditors.push({ id, amount: balance });
    if (balance < 0) debtors.push({ id, amount: -balance });
  }

  const transactions = [];
  while (creditors.size > 0 && debtors.size > 0) {
    const creditor = creditors.pop();
    const debtor = debtors.pop();
    const amount = Math.min(creditor.amount, debtor.amount);

    transactions.push({ from: debtor.id, to: creditor.id, amount });
    creditor.amount -= amount;
    debtor.amount -= amount;
    if (creditor.amount > 0) creditors.push(creditor);
    if (debtor.amount > 0) debtors.push(debtor);
  }

  return transactions;
}