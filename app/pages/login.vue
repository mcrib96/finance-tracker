<template>
  <UCard v-if="!success">
    <template #header>Sign-in to Finance Tracker</template>
    <form @submit.prevent="handleLogin">
      <UFormGroup
        label="Email"
        :required="true"
        name="email"
        class="mb-4"
        help="You will receive an email with the confirmation link"
      >
        <UInput
          type="email"
          placeholder="Email"
          required
          v-model="email"
        ></UInput>
      </UFormGroup>
      <UButton
        type="submit"
        variant="solid"
        color="black"
        :loading="pending"
        :disabled="pending"
        >Sign In</UButton
      >
    </form>
  </UCard>
  <UCard v-else>
    <template #header> Email has been sent </template>
    <div class="text-center">
      <p class="mb-4">
        We have sent an email to <strong>{{ email }}</strong> with a link to
        sign in.
      </p>
      <p>
        <strong>The link will expire in 5 minutes</strong>
      </p>
    </div>
  </UCard>
</template>
<script setup>
const success = ref(false);
const email = ref("");
const pending = ref(false);
const toast = useToast();
const supabase = useSupabaseClient();

useRedirectIfAuthenticated();

const handleLogin = async () => {
  pending.value = true;
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: {
        emailRedirectTo: "http://localhost:3000/confirm",
      },
    });
    if (error) {
      toast.add({
        title: "Error authenticating",
        description: error.message,
        icon: "i-heroicons-exclamation-triangle",
        color: "red",
      });
    } else {
      success.value = true;
    }
  } catch (e) {
    console.error(e);
  } finally {
    pending.value = false;
  }
};
</script>
