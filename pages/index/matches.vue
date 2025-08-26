<script setup lang="ts">
import type { League, PlayerWithUser, MatchWithTeamsAndPlayersAndUsers, NewMatch } from '../../db/types';
import { toast } from 'vue-sonner';

const $t = useI18n().t;

const activeLeague = inject<Ref<League>>('active-league');

const matches = ref<MatchWithTeamsAndPlayersAndUsers[]>([]);
const getMatches = async () => {
  matches.value = [];
  if (!activeLeague?.value) { return; }
  matches.value = await $fetch('/api/get/league-matches', { query: { leagueId: activeLeague.value.id } });
};

const players = ref<PlayerWithUser[]>([]);
const getPlayers = async () => {
  players.value = [];
  if (!activeLeague?.value) { return; }
  players.value = await $fetch('/api/get/league-players', { query: { leagueId: activeLeague.value.id } });
};

watch(() => activeLeague?.value, () => { getMatches(); getPlayers(); }, { immediate: true });

const editMatchDialogOpen = ref<boolean>(false);
const editMatchSaveError = ref<string>('');
const editMatch = ref<NewMatch>({ team1: { backId: '', frontId: '', score: 0 }, team2: { backId: '', frontId: '', score: 0 } });
const playerOptions = computed(() =>
  players.value.filter((player) => !player.banned).map((player) => ({
    label: player.user.name,
    value: player.id,
    disabled:
      editMatch.value.team1.backId === player.id ||
      editMatch.value.team1.frontId === player.id ||
      editMatch.value.team2.backId === player.id ||
      editMatch.value.team2.frontId === player.id
  }))
);
function openNewMatchDialog () {
  editMatch.value = { team1: { backId: '', frontId: '', score: 0 }, team2: { backId: '', frontId: '', score: 0 } };
  editMatchSaveError.value = '';
  editMatchDialogOpen.value = true;
}

async function saveMatch () {
  if (!activeLeague?.value) { return; }

  if (editMatch.value.team1.score === editMatch.value.team2.score) {
    editMatchSaveError.value = $t('matchCannotBeADraw');
    return;
  }

  if (!editMatch.value.team1.backId || !editMatch.value.team1.frontId || !editMatch.value.team2.backId || !editMatch.value.team2.frontId) {
    editMatchSaveError.value = $t('allPlayersMustBeSelected');
    return;
  }

  editMatchDialogOpen.value = false;

  await $fetch<MatchWithTeamsAndPlayersAndUsers>('/api/create/match', {
    method: 'POST',
    body: {
      leagueId: activeLeague.value.id,
      match: editMatch.value
    }
  })
    .then((newMatch) => {
      toast.success($t('matchSavedSuccessfully'));
      matches.value.push(newMatch);
    }).catch(() => {
      toast.error($t('failedToSaveMatch'));
    });
}

async function deleteMatch (matchId: string) {
  await $fetch('/api/delete/match', { method: 'POST', body: { matchId } })
    .then(() => {
      toast.success($t('matchDeletedSuccessfully'));
      matches.value = matches.value.filter((match) => match.id !== matchId);
    }).catch(() => {
      toast.error($t('failedToDeleteMatch'));
    });
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
      <MatchesList :matches="matches" :team1-color="activeLeague?.team1Color" :team2-color="activeLeague?.team2Color" @match:delete="(matchId: string) => deleteMatch(matchId)"/>
    </template>
    <UiButton class="fixed z-20 bottom-14 md:bottom-0 right-0 m-4" @click="openNewMatchDialog">
      <UiIcon type="add" />
      {{ $t('newMatch') }}
    </UiButton>

    <Modal v-model:open="editMatchDialogOpen">
      <ModalContent>
        <div class="mx-auto w-full max-w-lg">
          <ModalHeader>
            <ModalTitle>{{ $t('newMatch') }}</ModalTitle>
          </ModalHeader>
          <div class="flex gap-4 p-4 overflow-hidden flex-wrap">
            <div class="grid gap-2 w-full rounded-lg p-2 border-4" :style="{ 'border-color': activeLeague?.team1Color }">
              <div class="flex gap-2">
                <UiLabel for="team1-back" class="flex items-center justify-end">
                  <UiIcon type="shield" />
                </UiLabel>
                <Select id="team1-back" v-model="editMatch.team1.backId" :options="playerOptions" :placeholder="$t('selectAPlayer')" :label-no-options="$t('noPlayersAvailable')" />
              </div>
              <div class="flex gap-2">
                <UiLabel for="team1-front" class="flex items-center justify-end">
                  <UiIcon type="sword" />
                </UiLabel>
                <Select id="team1-front" v-model="editMatch.team1.frontId" :options="playerOptions" :placeholder="$t('selectAPlayer')" :label-no-options="$t('noPlayersAvailable')" />
              </div>
              <div class="flex gap-2 overflow-hidden">
                <UiLabel for="team1-back" class="flex items-center justify-end">
                  <UiIcon type="ball" />
                </UiLabel>
                <ScoreSelector :max="activeLeague?.maxPoints" v-model="editMatch.team1.score" />
              </div>
            </div>
            <div class="flex items-center justify-center w-full">vs</div>
            <div class="grid gap-2 w-full rounded-lg p-2 border-4" :style="{ 'border-color': activeLeague?.team2Color }">
              <div class="flex gap-2">
                <UiLabel for="team2-back" class="flex items-center justify-end">
                  <UiIcon type="shield" />
                </UiLabel>
                <Select id="team2-back" v-model="editMatch.team2.backId" :options="playerOptions" :placeholder="$t('selectAPlayer')" :label-no-options="$t('noPlayersAvailable')" />
              </div>
              <div class="flex gap-2">
                <UiLabel for="team2-front" class="flex items-center justify-end">
                  <UiIcon type="sword" />
                </UiLabel>
                <Select id="team2-front" v-model="editMatch.team2.frontId" :options="playerOptions" :placeholder="$t('selectAPlayer')" :label-no-options="$t('noPlayersAvailable')" />
              </div>
              <div class="flex gap-2 overflow-hidden">
                <UiLabel for="team2-score" class="flex items-center justify-end">
                  <UiIcon type="ball" />
                </UiLabel>
                <ScoreSelector :max="activeLeague?.maxPoints" v-model="editMatch.team2.score" />
              </div>
            </div>
          </div>
          <ModalFooter>
            <span class="text-destructive">{{ editMatchSaveError }}</span>
            <UiButton type="submit" @click="saveMatch">{{ $t('confirm') }}</UiButton>
          </ModalFooter>
        </div>
      </ModalContent>
    </Modal>
  </div>
</template>
