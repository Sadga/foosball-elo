<script setup lang="ts">
import type { League, PlayerWithUser } from '../../../db/types';
import type { IconType } from '../../../components/ui/icon/Icon.vue';

const activeLeague = inject<Ref<League>>('active-league');

const search = ref('');
const eloType = ref<'eloTotal'|'eloBack'|'eloFront'>('eloTotal');
const ICON_BY_ELO_TYPE: { [key: string]: IconType } = {
  eloTotal: 'shield-sword',
  eloBack: 'shield',
  eloFront: 'sword'
};

const players = ref<PlayerWithUser[]>([]);
const getPlayers = async () => {
  players.value = [];
  if (!activeLeague?.value) { return; }
  players.value = (await $fetch('/api/get/league-players', { query: { leagueId: activeLeague.value.id } })) || [];
};

const displayPlayers = computed(() =>
  players.value
    .sort((a, b) => {
      if (a[eloType.value] === b[eloType.value]) {
        return a.user.name.localeCompare(b.user.name);
      }
      return b[eloType.value] - a[eloType.value];
    })
    .map((player, i) => ({ ...player, rank: i + 1 }))
    .filter(player => {
      if (!search.value) { return true; }
      return player.user.name.toLowerCase().includes(search.value.toLowerCase());
    })
);

watch(() => activeLeague?.value, () => { getPlayers(); }, { immediate: true });
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex gap-2 bg-background">
      <UiInput v-model="search" placeholder="Search" class="w-full" />
      <UiTabs v-model="eloType" class="max-w-lg">
        <UiTabsList class="grid w-full grid-cols-3">
          <UiTabsTrigger value="eloTotal">
            <UiIcon :type="ICON_BY_ELO_TYPE.eloTotal"/>
          </UiTabsTrigger>
          <UiTabsTrigger value="eloBack">
            <UiIcon :type="ICON_BY_ELO_TYPE.eloBack"/>
          </UiTabsTrigger>
          <UiTabsTrigger value="eloFront">
            <UiIcon :type="ICON_BY_ELO_TYPE.eloFront"/>
          </UiTabsTrigger>
        </UiTabsList>
      </UiTabs>
    </div>
    <template v-if="displayPlayers.length === 0">
      <div class="container flex h-full items-center justify-center">
        <h1 class="text-md pt-16 font-bold text-muted-foreground">{{ $t('noPlayersYet') }}</h1>
      </div>
    </template>
    <template v-else>
      <TransitionList>
        <div
          v-for="player in displayPlayers"
          :key="player.id"
          class="p-1 border rounded-lg text-card-foreground"
          :class="{ 'opacity-40': player.banned, 'saturate-0': player.banned }"
          :style="{
            'background': player.rank === 1
              ? 'linear-gradient(90deg, #ffd700 0%, hsl(var(--card)) 95%)'
              : player.rank === 2
                ? 'linear-gradient(90deg, #C0C0C0 0%, hsl(var(--card)) 95%)'
                : player.rank === 3
                  ? 'linear-gradient(90deg, #CD7F32 0%, hsl(var(--card)) 95%)'
                  : 'transparent'
          }"
        >
          <div class="w-full flex items-center gap-2 p-1 rounded-md bg-card/80" :class="{ 'opacity-60': player.deleted }">
            <span class="text-sm font-semibold">{{ player.rank }}.</span>
            <UserAvatar :user="player.user" class="shrink-0" />
            <span class="w-full shrink-1 overflow-ellipsis">{{ player.user.name }}</span>
            <span class="font-semibold">{{ Math.round(player[eloType]) }}</span>
            <UiIcon :type="ICON_BY_ELO_TYPE[eloType]"/>
          </div>
        </div>
      </TransitionList>
    </template>
  </div>
</template>
