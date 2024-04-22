<script setup lang="ts">
import type { MatchWithTeamsAndPlayersAndUsers } from '../../db/types';
import { DateTime } from 'luxon';

const props = withDefaults(defineProps<{
  matches: MatchWithTeamsAndPlayersAndUsers[];
  team1Color?: string;
  team2Color?: string;
}>(), {
  team1Color: 'hsl(var(--primary))',
  team2Color: 'hsl(var(--primary))'
});

const emit = defineEmits(['match:delete']);

const matchesByDate = computed(() => {
  const res: { date: string, matches: MatchWithTeamsAndPlayersAndUsers[] }[] = [];
  let curDate = '';
  props.matches
    .toSorted((a, b) => DateTime.fromISO(b.date).toMillis() - DateTime.fromISO(a.date).toMillis())
    .forEach((match) => {
      const date = DateTime.fromISO(match.date).toLocaleString({ weekday: 'short', month: 'long', day: '2-digit', year: 'numeric' });
      if (date !== curDate) {
        curDate = date;
        res.push({ date, matches: [] });
      }
      res[res.length - 1].matches.push(match);
    });
  return [...res];
});
</script>

<template>
  <TransitionList>
    <div v-for="(group, i) in matchesByDate" :key="group.date">
      <div class="sticky top-14 py-2 z-10 text-sm text-muted-foreground w-full bg-background backdrop-blur-lg">{{ group.date }}</div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <template v-for="(match, j) in group.matches" :key="match.id">
          <template v-if="i === 0 && j === 0">
            <UiDropdownMenu :modal="false">
              <UiDropdownMenuTrigger as-child>
                <MatchesListMatch :match="match" :team1-color="props.team1Color" :team2-color="props.team2Color" />
              </UiDropdownMenuTrigger>
              <UiDropdownMenuContent align="center" class="min-w-48">
                <UiDropdownMenuItem class="text-destructive" @click="emit('match:delete', match.id)">
                  <span class="w-full shrink-1">{{ $t('deleteMatch') }}</span>
                  <UiIcon type="xmark" />
                </UiDropdownMenuItem>
              </UiDropdownMenuContent>
            </UiDropdownMenu>
          </template>
          <template v-else>
            <MatchesListMatch :match="match" :team1-color="props.team1Color" :team2-color="props.team2Color" />
          </template>
        </template>
      </div>
    </div>
  </TransitionList>
</template>
