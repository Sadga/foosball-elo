<script setup lang="ts">
import type { League, PlayerWithUser, MatchWithTeamsAndPlayersAndUsers } from '../../db/types';

const activeLeague = inject<Ref<League>>('active-league');

const matches = ref<MatchWithTeamsAndPlayersAndUsers[]>([]);
const getMatches = async () => {
  matches.value = [];
  if (!activeLeague?.value) { return; }
  matches.value = await $fetch('/api/get/matches', { query: { leagueId: activeLeague.value.id } });
};

const players = ref<PlayerWithUser[]>([]);
const getPlayers = async () => {
  players.value = [];
  if (!activeLeague?.value) { return; }
  players.value = await $fetch('/api/get/players', { query: { leagueId: activeLeague.value.id } });
};

watch(() => activeLeague?.value, () => { getMatches(); getPlayers(); }, { immediate: true });

const newMatch = ref({ team1: { backId: '', frontId: '', score: 0 }, team2: { backId: '', frontId: '', score: 0 } });
const playerOptions = computed(() =>
  players.value.map((player) => ({
    label: player.user.name,
    value: player.id,
    disabled:
      newMatch.value.team1.backId === player.id ||
      newMatch.value.team1.frontId === player.id ||
      newMatch.value.team2.backId === player.id ||
      newMatch.value.team2.frontId === player.id
  }))
);
function newMatchOpen (open: boolean) {
  if (open) {
    newMatch.value = { team1: { backId: '', frontId: '', score: 0 }, team2: { backId: '', frontId: '', score: 0 } };
  }
}

async function createMatch () {
  if (!activeLeague?.value) { return; }

  const match = await $fetch('/api/create/match', {
    method: 'POST',
    body: {
      leagueId: activeLeague.value.id,
      match: newMatch.value
    }
  });

  matches.value.push(match);
}
</script>

<template>
  <div class="container flex flex-col pb-3 max-md:px-3 max-w-screen-2xl">
    <template v-if="matches.length === 0">
      <div class="container flex h-full items-center justify-center">
        <h1 class="text-md pt-16 font-bold text-muted-foreground">{{ $t('noMatchesYet') }}</h1>
      </div>
    </template>
    <template v-else>
      <MatchesList :matches="matches" />
    </template>
    <UiDrawer @update:open="newMatchOpen" should-scale-background>
      <UiDrawerTrigger as-child>
        <UiButton class="fixed z-20 bottom-14 md:bottom-0 right-0 m-4">
          <UiIcon type="add" />
          {{ $t('newMatch') }}
        </UiButton>
      </UiDrawerTrigger>
      <UiDrawerContent>
        <div class="mx-auto w-full max-w-lg">
          <UiDrawerHeader>
            <UiDrawerTitle>{{ $t('newMatch') }}</UiDrawerTitle>
          </UiDrawerHeader>
          <div class="flex gap-4 p-4 overflow-hidden flex-wrap">
            <div class="grid gap-4 w-64 shrink grow">
              <div class="flex gap-4">
                <UiLabel for="team1-back" class="flex items-center justify-end">
                  <UiIcon type="shield" />
                </UiLabel>
                <Select id="team1-back" v-model="newMatch.team1.backId" :options="playerOptions" :placeholder="$t('selectAPlayer')" :label-no-options="$t('noPlayersAvailable')" />
              </div>
              <div class="flex gap-4">
                <UiLabel for="team1-front" class="flex items-center justify-end">
                  <UiIcon type="sword" />
                </UiLabel>
                <Select id="team1-front" v-model="newMatch.team1.frontId" :options="playerOptions" :placeholder="$t('selectAPlayer')" :label-no-options="$t('noPlayersAvailable')" />
              </div>
              <div class="flex gap-4 overflow-hidden">
                <UiLabel for="team1-back" class="flex items-center justify-end">
                  <UiIcon type="ball" />
                </UiLabel>
                <ScoreSelector :max="activeLeague?.maxPoints" v-model="newMatch.team1.score" />
                <!-- <div class="w-full overflow-auto">
                  <UiTabs v-model="newMatch.team1.score" class="w-auto">
                    <UiTabsList class="flex">
                      <UiTabsTrigger class="shrink-0" v-for="i in (activeLeague?.maxPoints || 0) + 1" :key="i" :value="String(i - 1)">{{ i - 1 }}</UiTabsTrigger>
                    </UiTabsList>
                  </UiTabs>
                </div> -->
                <!-- <UiInput id="team1-score" v-model="newMatch.team1.score" type="number" :placeholder="$t('score')" /> -->
              </div>
            </div>
            <div class="flex items-center justify-center w-full">vs</div>
            <div class="grid gap-4 w-64 shrink grow">
              <div class="flex gap-4">
                <UiLabel for="team2-back" class="flex items-center justify-end">
                  <UiIcon type="shield" />
                </UiLabel>
                <Select id="team2-back" v-model="newMatch.team2.backId" :options="playerOptions" :placeholder="$t('selectAPlayer')" :label-no-options="$t('noPlayersAvailable')" />
              </div>
              <div class="flex gap-4">
                <UiLabel for="team2-front" class="flex items-center justify-end">
                  <UiIcon type="sword" />
                </UiLabel>
                <Select id="team2-front" v-model="newMatch.team2.frontId" :options="playerOptions" :placeholder="$t('selectAPlayer')" :label-no-options="$t('noPlayersAvailable')" />
              </div>
              <div class="flex gap-4">
                <UiLabel for="team2-score" class="flex items-center justify-end">
                  <UiIcon type="ball" />
                </UiLabel>
                <ScoreSelector :max="activeLeague?.maxPoints" v-model="newMatch.team2.score" />
                <!-- <UiInput id="team2-score" v-model="newMatch.team2.score" type="number" :placeholder="$t('score')" /> -->
              </div>
            </div>
          </div>
          <UiDrawerFooter>
            <UiDrawerClose as-child>
              <UiButton type="submit" @click="createMatch">{{ $t('confirm') }}</UiButton>
            </UiDrawerClose>
          </UiDrawerFooter>
        </div>
      </UiDrawerContent>
    </UiDrawer>
  </div>
</template>
