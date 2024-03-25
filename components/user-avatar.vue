<script lang="ts">
import { type VariantProps, cva } from 'class-variance-authority';
import type { HTMLAttributes } from 'vue';
import type { User } from '../db/types';
import type { IconType } from './ui/icon/Icon.vue';
import { cn, initials } from '../libs/utils';

export const userAvatarVariant = cva(
  'relative',
  {
    variants: {
      size: {
        sm: 'h-10 w-10 text-xs',
        base: 'h-16 w-16 text-2xl',
        lg: 'h-32 w-32 text-5xl'
      }
    }
  }
);

export type UserAvatarVariants = VariantProps<typeof userAvatarVariant>
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  user?: User;
  icon?: IconType;
  class?: HTMLAttributes['class'];
  size?: UserAvatarVariants['size'],
}>(), {
  size: 'sm'
});

const userInitials = computed(() => initials(props.user?.name || ''));
</script>

<template>
  <div :class="cn(userAvatarVariant({ size: props.size }), props.class)">
    <UiIcon v-if="props.icon" :type="props.icon" class="absolute bottom-0 right-0 -mx-1.5 -my-0.5 rounded-full p-1 bg-secondary text-foreground shadow" style="font-size: 0.5rem;" />
    <UiAvatar class="w-full h-full" :class="props.class" :size="props.size">
      <UiAvatarImage v-if="props.user?.image" :src="props.user.image" :alt="props.user.name" referrerpolicy="no-referrer" />
      <UiAvatarFallback>{{ userInitials }}</UiAvatarFallback>
    </UiAvatar>
  </div>
</template>
