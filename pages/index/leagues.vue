<script setup lang="ts">
import type { League } from '../../db/types';

const leagues = inject<Ref<League[]>>('leagues');
</script>

<template>
  <Page :title="$t('leagues')">
    <template #actions>
      <NuxtLink to="/league/new">
        <UiButton size="icon" variant="secondary">
          <UiIcon type="add" />
        </UiButton>
      </NuxtLink>
    </template>

    <template v-if="leagues?.length === 0">
      <div class="container flex h-full items-center justify-center">
        <h1 class="text-md pt-16 font-bold text-muted-foreground">{{ $t('noLeaguesYet') }}</h1>
      </div>
    </template>
    <template v-else>
      <template v-for="league in leagues" :key="league.id">
        <NuxtLink :to="`/league/${league.id}`">
          <div class="w-full flex items-center p-2 border rounded-xl hover:bg-muted">
            <span class="w-full shrink-1">{{ league.name }}</span>
            <UiIcon type="settings" class="shrink-0"/>
          </div>
        </NuxtLink>
      </template>
    </template>
  </Page>
</template>
