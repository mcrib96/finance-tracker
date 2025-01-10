export const useRedirectIfAuthenticated = (redirectTo = "/") => {
  const user = useSupabaseUser();
  watch(
    user,
    (user) => {
      if (user) {
        return navigateTo(redirectTo);
      }
    },
    { immediate: true }
  );
  return {
    user,
  };
};
