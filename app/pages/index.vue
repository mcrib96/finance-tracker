<template>
  <section class="flex items-center justify-between mb-10">
    <h1 class="text-xl font-extrabold">Summary</h1>
    <div>
      <USelectMenu :options="transactionViewOptions" v-model="selectedView" />
    </div>
  </section>
  <section
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 sm:gap-16 mb-10"
  >
    <Trend
      color="green"
      title="Income"
      :amount="incomeTotal"
      :last-amount="previousIncomeTotal"
      :loading="pending"
    />
    <Trend
      color="red"
      title="Expense"
      :amount="expenseTotal"
      :last-amount="previousExpenseTotal"
      :loading="pending"
    />
    <Trend
      color="green"
      title="Investments"
      :amount="4000"
      :last-amount="3000"
      :loading="pending"
    />
    <Trend
      color="red"
      title="Savings"
      :amount="4000"
      :last-amount="4100"
      :loading="pending"
    />
  </section>
  <section v-if="!pending" class="flex justify-between">
    <div>
      <h2 class="text-2xl font-extrabold">Transaction</h2>
      <div class="text-gray-500 dark:text-gray-400">
        You have {{ incomeCount }} incomes and {{ expenseCount }} expenses this
        period.
      </div>
    </div>
    <div>
      <UButton
        icon="i-heroicons-plus-circle"
        color="white"
        variant="solid"
        label="Add"
        @click="isOpen = true"
      />
      <TransactionModal
        v-model="isOpen"
        @saved="refresh()"
        :transaction="currentTransaction"
      />
    </div>
  </section>
  <section v-if="!pending">
    <div
      v-for="(transactionsOnDay, date) in transactionsGroupedByDate"
      :key="date"
    >
      <DailyTransactionSummary :transactions="transactionsOnDay" :date="date" />
      <Transaction
        v-for="transaction in transactionsOnDay"
        :key="transaction.id"
        :transaction="transaction"
        @deleted="refresh()"
        @edit="editTransaction"
      />
    </div>
  </section>
  <section v-else>
    <USkeleton class="h-8 w-full mb-2" v-for="i in 4"></USkeleton>
  </section>
</template>

<script setup>
import { transactionViewOptions } from "~/constants";

const selectedView = ref(transactionViewOptions[1]);
const { current, previous } = useSelectedTimePeriod(selectedView);
const {
  transactions: {
    grouped: { byDate: transactionsGroupedByDate },
  },
  pending,
  incomeCount,
  incomeTotal,
  expenseCount,
  expenseTotal,
  refresh,
} = useFetchTransactions(current);
const {
  incomeTotal: previousIncomeTotal,
  expenseTotal: previousExpenseTotal,
  refresh: refreshPrevious,
} = useFetchTransactions(previous);
await Promise.all([refresh(), refreshPrevious()]);

const isOpen = ref(false);

const currentTransaction = ref(null);
const editTransaction = (transaction) => {
  currentTransaction.value = transaction;
  isOpen.value = true;
};

watch(
  () => isOpen.value,
  () => {
    if (!isOpen.value) {
      currentTransaction.value = null;
    }
  }
);
</script>
