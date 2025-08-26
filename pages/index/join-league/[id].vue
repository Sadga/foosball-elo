<script setup lang="ts">
import type { League } from '../../../db/types';
import { toast } from 'vue-sonner';

const reloadLeagues = inject<() => void>('reload-leagues');
const setActiveLeague = inject<() => void>('set-active-league');

const $t = useI18n().t;
const $route = useRoute();

const error = ref<string>('');
const league = ref<League>();
async function loadLeague () {
  league.value = undefined;
  if (!$route.params.id) { return; }

  league.value = await $fetch('/api/get/league', { query: { leagueId: $route.params.id } });
}
watch($route, () => { loadLeague(); }, { immediate: true });

async function joinLeague () {
  await $fetch('/api/join/league', { method: 'POST', body: { leagueId: $route.params.id } })
    .then(() => {
      toast.success($t('youJoinedTheLeagueSuccessfully'));
      reloadLeagues?.();
      setActiveLeague?.($route.params.id);
      navigateTo('/');
    })
    .catch(() => {
      error.value = $t('failedJoiningTheLeague');
    });
}

function goToHome () {
  navigateTo('/');
}
</script>

<template>
  <div class="container max-w-96 flex flex-col gap-3 items-center pt-16">
    <span>{{ $t('youWhereInvitedToJoinTheLeague') }}</span>
    <span class="text-3xl font-bold py-6">{{ league?.name }}</span>
    <UiButton variant="secondary" class="w-full" @click="goToHome()">{{ $t('cancel') }}</UiButton>
    <UiButton class="w-full" @click="joinLeague()">{{ $t('join') }}</UiButton>
    <span v-if="error" class="text-destructive">{{ error }}</span>
  </div>
</template>
