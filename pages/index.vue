<script setup lang="ts">
import { useDark, useToggle, useStorage } from '@vueuse/core';
import type { User } from '../db/types';

definePageMeta({
  middleware: (to, from) => {
    const { session } = useAuth();

    if (!session.value) {
      return navigateTo({ path: '/login', query: { r: to.path } });
    }

    if (to.path === '/') {
      return navigateTo({ path: '/matches' });
    }
  }
});

const { signOut, session } = useAuth();
const isDark = useDark();
const toggleTheme = useToggle(isDark);

const user = ref<User>();
provide('user', user);
async function getUser () {
  user.value = await $fetch('/api/get/user', { query: { userId: session.value?.user.id } });
}
watch(session, () => { getUser(); }, { immediate: true });

const leagues = ref<League[]>([]);
const activeLeagueId = useStorage('active-league', null as string | null);
const activeLeague = computed<League>(() => leagues.value.find((league) => league.id === activeLeagueId.value));
async function getLeagues () {
  leagues.value = await $fetch('/api/get/leagues');
  if (!activeLeague.value && leagues.value.length > 0) {
    activeLeagueId.value = leagues.value[0].id;
  }
}
onMounted(() => { getLeagues(); });

provide('leagues', leagues);
provide('active-league', activeLeague);
provide('reload-leagues', getLeagues);
provide('set-active-league', (leagueId: string) => { activeLeagueId.value = leagueId; });
</script>

<template>
  <div class="max-md:pb-14">
    <div class="sticky z-20 w-full top-0 bg-background/80 backdrop-blur-lg border-b border-border">
      <div class="container max-md:px-3 flex h-14 max-w-screen-2xl items-center">
        <div class="h-full flex gap-6">
          <UiDropdownMenu :modal="false">
            <UiDropdownMenuTrigger class="group h-full flex items-center justify-between text-sm font-medium">
              <h4>{{ activeLeague?.name || $t('selectALeague') }}</h4>
              <UiIcon type="expand-more" class="ml-1 transition-transform group-data-[state=open]:rotate-180" />
            </UiDropdownMenuTrigger>
            <UiDropdownMenuContent align="start" class="min-w-48">
              <UiDropdownMenuItem v-if="leagues.length === 0" disabled>
                {{ $t('noLeaguesYet') }}
              </UiDropdownMenuItem>
              <UiDropdownMenuItem v-for="league in leagues" :key="league.id" @click="activeLeagueId = league.id">
                <span class="w-full shrink-1">{{ league.name }}</span>
                <UiIcon v-if="activeLeagueId === league.id" type="check" />
              </UiDropdownMenuItem>
              <UiDropdownMenuSeparator />
              <NuxtLink to="/leagues">
                <UiDropdownMenuItem>
                  <span class="w-full shrink-1">{{ $t('settings') }}</span>
                  <UiIcon type="settings" />
                </UiDropdownMenuItem>
              </NuxtLink>
            </UiDropdownMenuContent>
          </UiDropdownMenu>
          <!-- <UiSeparator orientation="vertical" class="max-md:hidden" /> -->
          <NuxtLink to="/matches" active-class="text-primary" class="h-full flex-1 flex items-center justify-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary max-md:hidden ">
            {{ $t('matches') }}
          </NuxtLink>
          <NuxtLink to="/rankings" active-class="text-primary" class="h-full flex-1 flex items-center justify-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary max-md:hidden">
            {{ $t('rankings') }}
          </NuxtLink>
        </div>
        <div class="h-full flex flex-1 items-center justify-end">
          <UiDropdownMenu :modal="false">
            <UiDropdownMenuTrigger class="h-full flex items-center">
              <UserAvatar :user="user" />
            </UiDropdownMenuTrigger>
            <UiDropdownMenuContent align="end" class="min-w-48">
              <UiDropdownMenuItem @click="toggleTheme()" class="flex">
                <span class="w-full shrink-1">{{ isDark ? $t('lightMode') : $t('darkMode') }}</span>
                <UiIcon :type="isDark ? 'light-mode' : 'dark-mode'" />
              </UiDropdownMenuItem>
              <NuxtLink to="/profile">
                <UiDropdownMenuItem>
                  <span class="w-full shrink-1">{{ $t('profile') }}</span>
                  <UiIcon type="settings" />
                </UiDropdownMenuItem>
              </NuxtLink>
              <UiDropdownMenuSeparator />
              <UiDropdownMenuItem @click="signOut()">
                <span class="w-full shrink-1">{{ $t('logout') }}</span>
                <UiIcon type="logout" />
              </UiDropdownMenuItem>
            </UiDropdownMenuContent>
          </UiDropdownMenu>
        </div>
      </div>
    </div>

    <template v-if="!activeLeague">
      <div class="container flex h-full items-center justify-center">
        <h1 class="text-md pt-16 font-bold text-muted-foreground">{{ $t('selectALeagueOrCreateANewOneToBegin') }}</h1>
      </div>
    </template>
    <template v-else>
      <NuxtPage />
    </template>

    <div class="fixed z-20 w-full bottom-0 bg-background/80 backdrop-blur-lg border-t border-border md:hidden">
      <div class="container px-2 flex h-14 items-center">
        <NuxtLink to="/matches" active-class="text-primary" class="h-full flex-1 flex gap-2 items-center justify-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
          <UiIcon type="ball" />
          {{ $t('matches') }}
        </NuxtLink>
        <UiSeparator orientation="vertical" />
        <NuxtLink to="/rankings" active-class="text-primary" class="h-full flex-1 flex gap-2 items-center justify-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
          <UiIcon type="ranking" />
          {{ $t('rankings') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
