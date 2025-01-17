<template>
  <div
    class="grid grid-cols-3 py-4 border-b border-gray-200 dark:border-gray-800 text-gray-900: dark:text-gray-100"
  >
    <div class="flex items-center justify-between space-x-4 col-span-2">
      <div class="flex items-center space-x-1">
        <UIcon :name="icon" :class="[iconColor]" />
        <div>{{ transaction?.description }}</div>
      </div>
      <div>
        <UBadge color="white">{{ transaction?.category }}</UBadge>
      </div>
    </div>
    <div class="flex items-center justify-end space-x-2">
      <div>{{ currency }}</div>
      <div>
        <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
          <UButton
            color="white"
            variant="ghost"
            trailing-icon="i-heroicons-ellipsis-horizontal"
            :loading="isLoading"
          />
        </UDropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
const currency = computed(() => {
  const { currency } = useCurrency(props?.transaction?.amount) || "";
  return currency;
});
const isIncome = computed(
  () => props.transaction.type?.toLowerCase() === "income"
);
const icon = computed(() =>
  isIncome.value ? "i-heroicons-arrow-up-right" : "i-heroicons-arrow-down-left"
);
const iconColor = computed(() =>
  isIncome.value ? "text-green-600" : "text-red-600"
);
const props = defineProps({
  transaction: Object,
});
const emit = defineEmits(["deleted", "edit"]);
const isLoading = ref(false);
const { toastSuccess, toastError } = useAppToast();
const editTransaction = () => {
  emit("edit", props.transaction);
};
const deleteTransaction = async () => {
  isLoading.value = true;
  try {
    const supabase = useSupabaseClient();
    await supabase.from("transactions").delete().eq("id", props.transaction.id);
    toastSuccess({
      title: "Transaction deleted",
    });
    emit("deleted", props.transaction.id);
  } catch (error) {
    toastError({
      title: "Transaction deleted",
    });
  } finally {
    isLoading.value = false;
  }
};
const items = [
  [
    {
      label: "Edit",
      icon: "i-heroicons-pencil-square-20-solid",
      click: editTransaction,
    },
    {
      label: "Delete",
      icon: "i-heroicons-trash-20-solid",
      click: deleteTransaction,
    },
  ],
];
</script>
