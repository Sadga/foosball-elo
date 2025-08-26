<script setup lang="ts">
import type { League, TeamWithPlayersAndUsers } from '../../../db/types';

const activeLeague = inject<Ref<League>>('active-league');

const search = ref('');

const teams = ref<TeamWithPlayersAndUsers[]>([]);
const getTeams = async () => {
  teams.value = [];
  if (!activeLeague?.value) { return; }
  teams.value = (await $fetch('/api/get/league-teams', { query: { leagueId: activeLeague.value.id } })) || [];
};

const displayTeams = computed(() =>
  teams.value
    .sort((a, b) => b.eloTotal - a.eloTotal)
    .map((team, i) => ({ ...team, rank: i + 1 }))
    .filter(team => {
      if (!search.value) { return true; }
      return team.front.user.name.toLowerCase().includes(search.value.toLowerCase()) ||
            team.back.user.name.toLowerCase().includes(search.value.toLowerCase());
    })
);

watch(() => activeLeague?.value, () => { getTeams(); }, { immediate: true });
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex gap-2 bg-background">
      <UiInput v-model="search" placeholder="Search" class="w-full" />
    </div>
    <template v-if="displayTeams.length === 0">
      <div class="container flex h-full items-center justify-center">
        <h1 class="text-md pt-16 font-bold text-muted-foreground">{{ $t('noTeamsYet') }}</h1>
      </div>
    </template>
    <template v-else>
      <TransitionList>
        <div
          v-for="team in displayTeams"
          :key="team.id"
          class="p-1 border rounded-lg text-card-foreground"
          :style="{
            'background': team.rank === 1
              ? 'linear-gradient(90deg, #ffd700 0%, hsl(var(--card)) 95%)'
              : team.rank === 2
                ? 'linear-gradient(90deg, #C0C0C0 0%, hsl(var(--card)) 95%)'
                : team.rank === 3
                  ? 'linear-gradient(90deg, #CD7F32 0%, hsl(var(--card)) 95%)'
                  : 'transparent'
          }"
        >
          <div class="w-full flex items-center gap-2 p-1 rounded-md bg-card/80">
            <span class="text-sm font-semibold">{{ team.rank }}.</span>
            <div class="flex flex-col w-full shrink-1 gap-1">
              <div class="flex gap-2 items-center" :class="{ 'opacity-40': team.back.banned, 'saturate-0': team.back.banned }">
                <!-- <UiIcon type="shield"/> -->
                <UserAvatar :user="team.back.user" icon="shield" class="shrink-0"/>
                <span class="overflow-ellipsis">{{ team.back.user.name }}</span>
              </div>
              <div class="flex gap-2 items-center" :class="{ 'opacity-40': team.front.banned, 'saturate-0': team.front.banned }">
                <!-- <UiIcon type="sword"/> -->
                <UserAvatar :user="team.front.user" icon="sword" class="shrink-0"/>
                <span class="overflow-ellipsis">{{ team.front.user.name }}</span>
              </div>
            </div>
            <span class="font-semibold">{{ Math.round(team.eloTotal) }}</span>
            <UiIcon type="shield-sword"/>
          </div>
        </div>
      </TransitionList>
    </template>
  </div>
</template>
