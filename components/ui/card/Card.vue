<script setup lang="ts">
import { cn } from '../../../libs/utils';

const props = defineProps({
  class: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <div
    :class="
      cn(
        'rounded-lg border bg-card/80 text-card-foreground shadow backdrop-blur-xl',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
