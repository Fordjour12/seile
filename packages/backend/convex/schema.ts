import { defineSchema } from "convex/server";

import { accountsTable } from "./schema/accounts";
import { categoriesTable } from "./schema/categories";
import { recurringTransactionsTable } from "./schema/recurring_transactions";
import { requestNoncesTable } from "./schema/request_nonces";
import { transactionsTable } from "./schema/transactions";

export {
  accountStatusValidator,
  accountTypeValidator,
} from "./schema/validators";
export {
  recurringKindValidator,
  scheduleTypeValidator,
  subscriptionStatusValidator,
} from "./schema/recurring_transactions";
export { transactionKindValidator } from "./schema/transactions";

export default defineSchema({
  accounts: accountsTable,
  categories: categoriesTable,
  requestNonces: requestNoncesTable,
  transactions: transactionsTable,
  recurringTransactions: recurringTransactionsTable,
});
