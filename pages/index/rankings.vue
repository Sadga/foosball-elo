<script setup lang="ts">
const page = ref('teams');
const route = useRoute();
watch(() => route.path, () => {
  if (route.path === '/rankings/teams') {
    page.value = 'teams';
  } else if (route.path === '/rankings/players') {
    page.value = 'players';
  }
}, { immediate: true });

definePageMeta({
  middleware: (to, from) => {
    if (to.path === '/rankings') {
      return navigateTo('/rankings/teams');
    }
  }
});
</script>

<template>
  <div class="container flex flex-col gap-3 py-3 max-md:px-3 max-w-screen-2xl">
    <div class="flex items-center justify-center">
      <UiTabs :model-value="page" class="w-full max-w-lg">
        <UiTabsList class="grid w-full grid-cols-2">
          <UiTabsTrigger value="teams">
            <NuxtLink to="/rankings/teams" class="w-full h-full">
              {{ $t('teams') }}
            </NuxtLink>
          </UiTabsTrigger>
          <UiTabsTrigger value="players">
            <NuxtLink to="/rankings/players" class="w-full h-full">
              {{ $t('players') }}
            </NuxtLink>
          </UiTabsTrigger>
        </UiTabsList>
      </UiTabs>
    </div>
    <NuxtPage />
  </div>
</template>
