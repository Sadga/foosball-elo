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
  <div :class="cn('p-6 pt-0', props.class)">
    <slot />
  </div>
</template>
