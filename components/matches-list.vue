<script setup lang="ts">
import type { MatchWithTeamsAndPlayersAndUsers } from '../db/types';
import { DateTime } from 'luxon';

const props = defineProps<{
  matches: MatchWithTeamsAndPlayersAndUsers[];
}>();

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
  return [...res, ...res];
});
</script>

<template>
  <TransitionList>
    <div v-for="group in matchesByDate" :key="group.date">
      <div class="sticky top-14 py-2 z-10 text-sm text-muted-foreground w-full bg-background backdrop-blur-lg">{{ group.date }}</div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="match in group.matches"
          :key="match.id"
          class="flex items-center gap-2 p-1 border rounded-lg text-card-foreground"
          :style="{
            'background': match.score1 > match.score2
              ? 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--card)) 60%)'
              : 'linear-gradient(90deg, hsl(var(--card)) 40%, hsl(var(--primary)) 100%)'
          }"
        >
          <div class="w-full p-1 rounded-md bg-card/80">
            <div class="w-full flex gap-1 items-center" >
              <div class="flex flex-col gap-1 w-1/3 flex-grow">
                <div class="flex gap-2 items-center justify-start w-full">
                  <UserAvatar :user="match.team1.back.user" icon="shield"/>
                  <span class="text-ellipsis whitespace-nowrap overflow-hidden shrink-1">{{ match.team1.back.user.name }}</span>
                </div>
                <div class="flex gap-2 items-center justify-start w-full">
                  <UserAvatar :user="match.team1.front.user" icon="sword"/>
                  <span class="text-ellipsis whitespace-nowrap overflow-hidden shrink-1">{{ match.team1.front.user.name }}</span>
                </div>
              </div>
              <div class="text-lg font-bold px-1">{{ match.score1 }}</div>
              -
              <div class="text-lg font-bold px-1">{{ match.score2 }}</div>
              <div class="flex flex-col gap-1 w-1/3 flex-grow">
                <div class="flex gap-2 items-center justify-end w-full">
                  <span class="text-ellipsis whitespace-nowrap overflow-hidden shrink-1">{{ match.team2.back.user.name }}</span>
                  <UserAvatar :user="match.team2.back.user" icon="shield"/>
                </div>
                <div class="flex gap-2 items-center justify-end w-full">
                  <span class="text-ellipsis whitespace-nowrap overflow-hidden shrink-1">{{ match.team2.front.user.name }}</span>
                  <UserAvatar :user="match.team2.front.user" icon="sword"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </TransitionList>
</template>
