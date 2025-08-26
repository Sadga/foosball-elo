<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '../libs/utils';

const props = withDefaults(defineProps<{
  title?: String;
  class?: HTMLAttributes['class'];
}>(), {});
</script>

<template>
  <div
    :class="cn(`container flex flex-col gap-3 py-3 max-md:px-3 max-w-screen-2xl`, props.class)"
  >
    <div class="flex items-center h-9">
      <span class="w-full shrink-1 text-2xl">{{ props.title }}</span>
      <slot name="actions" class="shrink-0"/>
    </div>
    <slot />
  </div>
</template>
