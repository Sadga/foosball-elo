<script setup lang="ts">
import type { MatchWithTeamsAndPlayersAndUsers } from '../../db/types';

const props = withDefaults(defineProps<{
  match: MatchWithTeamsAndPlayersAndUsers;
  team1Color?: string;
  team2Color?: string;
}>(), {
  team1Color: 'hsl(var(--primary))',
  team2Color: 'hsl(var(--primary))'
});
</script>

<template>
  <div
    class="relative flex items-center gap-2 p-1 border rounded-lg text-card-foreground"
    :style="{
      'background': props.match.score1 === props.match.score2
        ? `linear-gradient(90deg, ${props.team1Color} 0%, hsl(var(--card)) 50%, ${props.team2Color} 100%)`
        : props.match.score1 > props.match.score2
          ? `linear-gradient(90deg, ${props.team1Color} 0%, hsl(var(--card)) 60%)`
          : `linear-gradient(90deg, hsl(var(--card)) 40%, ${props.team2Color} 100%)`
    }"
  >
    <div class="w-full p-1 rounded-md bg-card/80">
      <div class="w-full flex gap-1 items-center" >
        <div class="flex flex-col gap-1 w-1/3 flex-grow">
          <div class="flex gap-2 items-center justify-start w-full" :class="{ 'opacity-40': props.match.team1.back.banned, 'saturate-0': props.match.team1.back.banned }">
            <UserAvatar :user="props.match.team1.back.user" icon="shield" class="shrink-0"/>
            <span class="text-ellipsis whitespace-nowrap overflow-hidden shrink-1">{{ props.match.team1.back.user.name }}</span>
          </div>
          <div class="flex gap-2 items-center justify-start w-full" :class="{ 'opacity-40': props.match.team1.front.banned, 'saturate-0': props.match.team1.front.banned }">
            <UserAvatar :user="props.match.team1.front.user" icon="sword" class="shrink-0"/>
            <span class="text-ellipsis whitespace-nowrap overflow-hidden shrink-1">{{ props.match.team1.front.user.name }}</span>
          </div>
        </div>
        <div class="text-lg font-bold px-1">{{ props.match.score1 }}</div>
        -
        <div class="text-lg font-bold px-1">{{ props.match.score2 }}</div>
        <div class="flex flex-col gap-1 w-1/3 flex-grow">
          <div class="flex gap-2 items-center justify-end w-full" :class="{ 'opacity-40': props.match.team2.back.banned, 'saturate-0': props.match.team2.back.banned }">
            <span class="text-ellipsis whitespace-nowrap overflow-hidden shrink-1">{{ props.match.team2.back.user.name }}</span>
            <UserAvatar :user="props.match.team2.back.user" icon="shield" class="shrink-0"/>
          </div>
          <div class="flex gap-2 items-center justify-end w-full" :class="{ 'opacity-40': props.match.team2.front.banned, 'saturate-0': props.match.team2.front.banned }">
            <span class="text-ellipsis whitespace-nowrap overflow-hidden shrink-1">{{ props.match.team2.front.user.name }}</span>
            <UserAvatar :user="props.match.team2.front.user" icon="sword" class="shrink-0"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
