<template>
  <div>
    <UForm :state="state" :schema="schema" @submit="saveProfile">
      <UFormGroup class="mb-4" label="Full Name" name="name">
        <UInput v-model="state.name"></UInput>
      </UFormGroup>
      <UFormGroup
        class="mb-4"
        label="Email"
        name="email"
        help="You will receive a confirmation email on the old and new addresses if you modify the email address"
      >
        <UInput v-model="state.email"></UInput>
      </UFormGroup>
      <UButton
        type="submit"
        color="black"
        variant="solid"
        :loading="pending"
        :disabled="pending"
        label="Save"
      />
    </UForm>
  </div>
</template>
<script setup>
import { z } from "zod";

const user = useSupabaseUser();
const supabase = useSupabaseClient();
console.log("user", user);

const { toastSuccess, toastError } = useAppToast();
const pending = ref(false);

const state = ref({
  name: user.value?.user_metadata?.full_name || "",
  email: user.value?.email,
});

const schema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
});

const saveProfile = async () => {
  pending.value = true;
  try {
    const data = {
      data: {
        full_name: state.value.name,
      },
    };
    if (state.email !== user.value.email) {
      data.email = state.email;
    }
    const { error } = await supabase.auth.updateUser(data);
    if (error) {
      throw error;
    }
    toastSuccess({
      title: "Profile updated",
      description: "Your profile has been updated",
    });
  } catch (e) {
    toastError({
      title: "Error updating profile",
      description: e.mssage,
    });
  } finally {
    pending.value = false;
  }
};
</script>
