<script lang="ts">
import { type VariantProps, cva } from 'class-variance-authority';
import type { HTMLAttributes } from 'vue';
import { AvatarRoot } from 'radix-vue';
import { cn } from '../../../libs/utils';

export const avatarVariant = cva(
  'inline-flex items-center justify-center font-normal text-foreground select-none shrink-0 bg-secondary overflow-hidden',
  {
    variants: {
      size: {
        sm: 'h-10 w-10 text-xs',
        base: 'h-16 w-16 text-2xl',
        lg: 'h-32 w-32 text-5xl'
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-md'
      }
    }
  }
);

export type AvatarVariants = VariantProps<typeof avatarVariant>
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  size?: AvatarVariants['size']
  shape?: AvatarVariants['shape']
}>(), {
  size: 'sm',
  shape: 'circle'
});
</script>

<template>
  <AvatarRoot :class="cn(avatarVariant({ size, shape }), props.class)">
    <slot />
  </AvatarRoot>
</template>
