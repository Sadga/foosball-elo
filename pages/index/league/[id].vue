<script setup lang="ts">
import type { League, PlayerWithUser } from '../../../db/types';
import { toast } from 'vue-sonner';

const { session } = useAuth();

const $t = useI18n().t;
const $route = useRoute();

const reloadLeagues = inject<() => void>('reload-leagues');
const league = ref<League>();
const leaguePlayers = ref<PlayerWithUser[]>();
const sessionUserPlayer = computed(() => leaguePlayers.value?.find((player) => player.user.id === session.value?.user.id));
const sessionUserIsAdmin = computed(() => !league.value?.id || sessionUserPlayer.value?.admin);
async function loadLeague () {
  league.value = undefined;
  leaguePlayers.value = undefined;
  if (!$route.params.id) { return; }

  if ($route.params.id === 'new') {
    league.value = { name: '', maxPoints: 10, team1Color: '#3b82f6', team2Color: '#dc2626' };
    leaguePlayers.value = [];
  } else {
    [league.value, leaguePlayers.value] = await Promise.all([
      $fetch('/api/get/league', { query: { leagueId: $route.params.id } }),
      $fetch('/api/get/league-players', { query: { leagueId: $route.params.id } })
    ]);
  }
}
watch($route, () => { loadLeague(); }, { immediate: true });

function saveLeague () {
  if (!league.value.id) {
    $fetch('/api/create/league', { method: 'PUT', body: league.value })
      .then((savedLeague) => {
        toast.success($t('leagueSaved'));
        reloadLeagues?.();
        navigateTo({ path: `/league/${savedLeague.id}`, replace: true });
      }).catch(() => {
        toast.error($t('failedSaveLeague'));
      });
  } else {
    $fetch('/api/save/league', { method: 'PUT', body: league.value })
      .then((savedLeague) => {
        toast.success($t('leagueSaved'));
        reloadLeagues?.();
        league.value = savedLeague;
      }).catch(() => {
        toast.error($t('failedSaveLeague'));
      });
  }
}

function deleteLeague () {
  if (!league.value.id) { return; }

  $fetch('/api/delete/league', { method: 'DELETE', body: { leagueId: league.value.id } }).then(() => {
    toast.success($t('leagueDeleted', { name: league.value.name }));
    reloadLeagues?.();
    navigateTo({ path: '/leagues' });
  }).catch(() => {
    toast.error($t('failedDeleteLeague', { name: league.value.name }));
  });
}

function banPlayer (playerId: string) {
  const bannedPlayer = leaguePlayers.value.find((player) => player.id === playerId);
  if (!bannedPlayer) { return; }

  $fetch('/api/player/ban', { method: 'PUT', body: { playerId } }).then((player) => {
    toast.success($t('playerBannedFromLeague', { name: bannedPlayer?.user.name }));
    Object.assign(bannedPlayer, player);
  }).catch(() => {
    toast.error($t('failedBanPlayerFromLeague', { name: bannedPlayer?.user.name }));
  });
}

function unbanPlayer (playerId: string) {
  const bannedPlayer = leaguePlayers.value.find((player) => player.id === playerId);
  if (!bannedPlayer) { return; }

  $fetch('/api/player/unban', { method: 'PUT', body: { playerId } }).then((player) => {
    toast.success($t('playerUnbannedFromLeague', { name: bannedPlayer?.user.name }));
    Object.assign(bannedPlayer, player);
  }).catch(() => {
    toast.error($t('failedUnbanPlayerFromLeague', { name: bannedPlayer?.user.name }));
  });
}

function addAdminPlayer (playerId: string) {
  const adminPlayer = leaguePlayers.value.find((player) => player.id === playerId);

  $fetch('/api/player/add-admin', { method: 'PUT', body: { playerId } }).then((player) => {
    toast.success($t('playerIsNowAdmin', { name: adminPlayer?.user.name }));
    Object.assign(adminPlayer, player);
  }).catch(() => {
    toast.error($t('failedAddingAdminPlayer', { name: adminPlayer?.user.name }));
  });
}

function remAdminPlayer (playerId: string) {
  const adminPlayer = leaguePlayers.value.find((player) => player.id === playerId);

  $fetch('/api/player/rem-admin', { method: 'PUT', body: { playerId } }).then((player) => {
    toast.success($t('playerIsNotAdminAnymore', { name: adminPlayer?.user.name }));
    Object.assign(adminPlayer, player);
  }).catch(() => {
    toast.error($t('failedRemovingAdminPlayer', { name: adminPlayer?.user.name }));
  });
}

const confirmModal = ref({ open: false, message: '', onConfirm: () => {}, destructive: false });
const openConfirmModal = (message: string, onConfirm: () => void, { destructive = false } = {}) => {
  confirmModal.value = { open: true, message, onConfirm, destructive };
};

const inviteLink = computed(() => `${window?.location?.origin}/join-league/${league.value?.id}`);
const canShare = computed(() => !!navigator?.share);
const canCopy = computed(() => !!navigator?.clipboard);

function shareInviteLink () {
  if (!navigator.share) { return; }
  navigator.share({ title: $t('joinMyLeague'), text: $t('joinMyLeague'), url: inviteLink.value }).catch(() => {});
}

function copyInviteLink () {
  if (!navigator.clipboard) { return; }
  navigator.clipboard.writeText(inviteLink.value).then(() => {
    toast.success($t('copiedToClipboard'));
  }).catch(() => {
    toast.error($t('failedCopyToClipboard'));
  });
}
</script>

<template>
  <Page :title="league.id ? $t('leagueSettings') : $t('newLeague')" v-if="league">
    <template #actions>
      <UiDropdownMenu :modal="false" v-if="league.id && sessionUserIsAdmin">
        <UiDropdownMenuTrigger>
          <UiButton size="icon" variant="secondary">
            <UiIcon type="more" />
          </UiButton>
        </UiDropdownMenuTrigger>
        <UiDropdownMenuContent align="end" class="min-w-48">
          <UiDropdownMenuItem
            class="text-destructive"
            @click="openConfirmModal(
              $t('sureDeleteLeague', { name: league.name }),
              () => deleteLeague(),
              { destructive: true }
            )"
          >
            <span class="w-full shrink-1">{{ $t('deleteLeague') }}</span>
            <UiIcon type="xmark" />
          </UiDropdownMenuItem>
        </UiDropdownMenuContent>
      </UiDropdownMenu>
    </template>

    <div class="flex flex-col gap-2">
      <UiLabel for="league-name">{{ $t('name') }}</UiLabel>
      <UiInput id="league-name" :placeholder="$t('chooseANameForTheLeague')" class="col-span-3" v-model="league.name" :disabled="!sessionUserIsAdmin"/>
      <UiLabel for="league-max-points">{{ $t('maxPoints') }}</UiLabel>
      <UiInput id="league-max-points" type="number" placeholder="10" class="col-span-3" v-model="league.maxPoints" :disabled="!sessionUserIsAdmin"/>
      <UiLabel>{{ $t('team1Color') }}</UiLabel>
      <ColorSelector v-model="league.team1Color" :disabled="!sessionUserIsAdmin"/>
      <UiLabel>{{ $t('team2Color') }}</UiLabel>
      <ColorSelector v-model="league.team2Color" :disabled="!sessionUserIsAdmin"/>
    </div>

    <div class="flex justify-end">
      <UiButton @click="saveLeague" v-if="sessionUserIsAdmin">
        <UiIcon :type="league.id ? 'save' : 'add'"/>
        {{ league.id ? $t('save') : $t('createLeague') }}
      </UiButton>
    </div>

    <template v-if="league.id">
      <UiSeparator/>

      <div class="flex items-center">
        <span class="w-full shrink-1 text-xl">{{ $t('players') }}</span>
        <Modal>
          <ModalTrigger as-child>
            <UiButton size="icon" class="shrink-0">
              <UiIcon type="person-add"/>
            </UiButton>
          </ModalTrigger>
          <ModalContent>
            <div class="mx-auto w-full max-w-lg p-3">
              <ModalHeader>
                <ModalTitle>{{ $t('invitePlayers') }}</ModalTitle>
              </ModalHeader>
              <div class="flex gap-3">
                <UiInput class="shrink-1" readonly :model-value="inviteLink"/>
                <template v-if="canShare">
                  <UiButton @click="shareInviteLink" class="shrink-0" size="icon" variant="secondary">
                    <UiIcon type="share"/>
                  </UiButton>
                </template>
                <template v-else-if="canCopy">
                  <UiButton @click="copyInviteLink" class="shrink-0" size="icon" variant="secondary">
                    <UiIcon type="copy"/>
                  </UiButton>
                </template>
              </div>
              <ModalFooter/>
            </div>
          </ModalContent>
        </Modal>
      </div>

      <div class="flex flex-col gap-2">
        <div v-for="player in leaguePlayers" :key="player.id" class="flex gap-2 items-center" :class="{ 'opacity-50': player.banned }">
          <UserAvatar
            :user="player.user"
            class="shrink-0"
            :icon="player.banned ? 'xmark' : (player.admin ? 'star' : undefined)"
          />
          <span class="w-full shrink-1">{{ player.user.name }}</span>

          <UiDropdownMenu :modal="false" v-if="league.id && sessionUserIsAdmin && player.id !== sessionUserPlayer.id">
            <UiDropdownMenuTrigger>
              <UiButton size="icon" variant="secondary">
                <UiIcon type="more" />
              </UiButton>
            </UiDropdownMenuTrigger>
            <UiDropdownMenuContent align="end" class="min-w-48">
              <UiDropdownMenuItem
                v-if="!player.banned && !player.admin"
                @click="openConfirmModal(
                  $t('sureAddPlayerAdmin', { name: player.user.name }),
                  () => addAdminPlayer(player.id)
                )"
              >
                <span class="w-full shrink-1">{{ $t('addAdmin') }}</span>
                <UiIcon type="star" />
              </UiDropdownMenuItem>
              <UiDropdownMenuItem
                v-if="!player.banned && player.admin"
                @click="openConfirmModal(
                  $t('sureRemPlayerAdmin', { name: player.user.name }),
                  () => remAdminPlayer(player.id)
                )"
              >
                <span class="w-full shrink-1">{{ $t('remAdmin') }}</span>
                <!-- <UiIcon type="star" /> -->
              </UiDropdownMenuItem>
              <UiDropdownMenuItem
                v-if="!player.banned"
                class="text-destructive"
                @click="openConfirmModal(
                  $t('sureBanPlayer', { name: player.user.name }),
                  () => banPlayer(player.id),
                  { destructive: true }
                )"
              >
                <span class="w-full shrink-1">{{ $t('banPlayer') }}</span>
                <UiIcon type="xmark" />
              </UiDropdownMenuItem>
              <UiDropdownMenuItem
                v-if="player.banned"
                class="text-destructive"
                @click="openConfirmModal(
                  $t('sureUnanPlayer', { name: player.user.name }),
                  () => unbanPlayer(player.id)
                )"
              >
                <span class="w-full shrink-1">{{ $t('unbanPlayer') }}</span>
                <!-- <UiIcon type="xmark" /> -->
              </UiDropdownMenuItem>
            </UiDropdownMenuContent>
          </UiDropdownMenu>
        </div>
      </div>
    </template>

    <Modal v-model:open="confirmModal.open">
      <ModalContent>
        <div class="mx-auto w-full max-w-lg p-3">
          <ModalHeader>
            <ModalTitle>{{ confirmModal.message }}</ModalTitle>
          </ModalHeader>
          <ModalFooter>
            <ModalClose as-child>
              <UiButton variant="secondary">{{ $t('cancel') }}</UiButton>
            </ModalClose>
            <ModalClose as-child>
              <UiButton :variant="confirmModal.destructive ? 'destructive' : 'default'" @click="confirmModal.onConfirm">{{ $t('confirm') }}</UiButton>
            </ModalClose>
          </ModalFooter>
        </div>
      </ModalContent>
    </Modal>
  </Page>
</template>
