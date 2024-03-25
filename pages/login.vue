<script setup lang="ts">
definePageMeta({ middleware: 'guest-only', auth: { authenticatedRedirectTo: '/' } });
const { signIn, signOut, session, status, cookies, getProviders } = useAuth();

const credentials = reactive({ name: 'Test User 1' });

</script>

<template>
  <div class="container relative h-screen flex-col items-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
    <div class="relative hidden h-full flex-col bg-muted p-10 dark:border-r lg:flex">
      <div class="relative flex items-center gap-2 text-lg font-medium">
        <img src="../assets/tf-icon.png" alt="foosball-elo logo" class="w-12 h-12" />
        <p>{{ $t('foosballElo') }}</p>
      </div>
    </div>
    <div class="lg:p-8">
      <div class="mx-auto flex w-full flex-col justify-center space-y-4 sm:w-[350px]">
        <div class="relative flex flex-col items-center gap-2 text-lg font-medium lg:hidden">
          <img src="../assets/tf-icon.png" alt="foosball-elo logo" class="w-24 h-24" />
          <p>{{ $t('foosballElo') }}</p>
        </div>

        <div class="flex flex-col space-y-2 text-center">
          <h1 class="text-2xl font-semibold tracking-tight">Login</h1>
          <p class="text-sm text-muted-foreground">with</p>
        </div>
        <UiInput v-model="credentials.name" placeholder="Username"></UiInput>
        <UiButton @click="signIn('credentials', credentials)">
          <UiIcon type="logout" class="mr-2" />
          Username
        </UiButton>
        <UiSeparator/>
        <UiButton @click="signIn('google')">
          <UiIcon type="google" class="mr-2" />
          Google
        </UiButton>
      </div>
    </div>
  </div>
</template>
