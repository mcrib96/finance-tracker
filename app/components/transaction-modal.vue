<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>Add Transaction</template>
      <UForm :state="state" :schema="schema" ref="form">
        <UFormGroup label="Amount" :required="true" name="amount" class="mb-4">
          <UInput
            type="number"
            placeholder="Amount"
            v-model.number="state.amount"
          />
        </UFormGroup>
        <UFormGroup
          label="Transaction Date"
          :required="true"
          name="created_at"
          class="mb-4"
        >
          <UInput
            type="date"
            icon="i-heroicons-calendar-days-20-solid"
            v-model="state.created_at"
          />
        </UFormGroup>
        <UFormGroup
          label="Transaction Type"
          :required="true"
          name="type"
          class="mb-4"
        >
          <USelect
            :required="true"
            placeholder="Select a transaction type"
            :options="typeOptions"
            v-model="state.type"
          />
        </UFormGroup>
        <UFormGroup
          label="Description"
          hint="Optional"
          name="description"
          class="mb-4"
        >
          <UInput placeholder="Description" v-model="state.description" />
        </UFormGroup>
        <UFormGroup
          label="Category"
          :required="true"
          name="category"
          class="mb-4"
          v-if="state.type?.toLowerCase() === 'expense'"
        >
          <USelect
            :required="true"
            placeholder="Category"
            :options="categoryOptions"
            v-model="state.category"
          />
        </UFormGroup>
        <UButton
          type="submit"
          color="black"
          variant="solid"
          @click="save"
          :loading="isLoading"
          >Save</UButton
        >
      </UForm>
    </UCard>
  </UModal>
</template>
<script setup>
import { categoryOptions, typeOptions } from "~/constants";
import { z } from "zod";

const emit = defineEmits(["update:modelValue", "saved"]);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  transaction: {
    type: Object,
    default: null,
  },
});
const initialState = {
  type: undefined,
  category: undefined,
  amount: 0,
  created_at: undefined,
  description: undefined,
};
const state = ref({
  ...initialState,
});
const defaultSchema = z.object({
  created_at: z.string(),
  description: z.string().optional(),
  amount: z.number().positive("Amount needs to be greater than 0"),
});
const incomeSchema = z.object({
  type: z.literal("Income"),
});
const expenseSchema = z.object({
  type: z.literal("Expense"),
  category: z.enum(categoryOptions),
});
const investmentSchema = z.object({
  type: z.literal("Investment"),
});
const savingSchema = z.object({
  type: z.literal("Saving"),
});
const schema = z.intersection(
  z.discriminatedUnion("type", [
    incomeSchema,
    expenseSchema,
    investmentSchema,
    savingSchema,
  ]),
  defaultSchema
);
const form = ref();
const supabase = useSupabaseClient();
const toast = useToast();
const isLoading = ref(false);
const save = async () => {
  if (form.value.errors.length) {
    return;
  }
  isLoading.value = true;
  try {
    const { error } = await supabase
      .from("transactions")
      .upsert({ ...state.value });
    if (!error) {
      toast.add({
        title: "Transaction saved",
        icon: "i-heroicons-check-circle",
      });
      isOpen.value = false;
      emit("saved");
    }
  } catch (error) {
    toast.add({
      title: "Transaction not saved",
      description: error.message,
      icon: "i-heroicons-exclamation-circle",
    });
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  if (props.transaction !== null) {
    Object.assign(state.value, {
      ...props.transaction,
      created_at: props.transaction.created_at.split("T")[0],
    });
  } else {
    Object.assign(state.value, initialState);
  }
  form.value?.clear();
};
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (!value) {
      resetForm();
    }
    emit("update:modelValue", value);
  },
});
watch(
  () => props.transaction,
  () => resetForm()
);
</script>
