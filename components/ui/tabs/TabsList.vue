<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue';
import { TabsList, type TabsListProps, useForwardProps } from 'radix-vue';
import { cn } from '../../../libs/utils';

const props = defineProps<TabsListProps & { class?: HTMLAttributes['class'] }>();

const forwarded = useForwardProps(props);
const realForwarded = computed(() => {
  const { class: _, ...delegated } = forwarded.value;
  return delegated;
});
</script>

<template>
  <TabsList
    v-bind="realForwarded"
    :class="cn(
      'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
      props.class,
    )"
  >
    <slot />
  </TabsList>
</template>
