<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue';
import { TabsTrigger, type TabsTriggerProps, useForwardProps } from 'radix-vue';
import { cn } from '../../../libs/utils';

const props = defineProps<TabsTriggerProps & { class?: HTMLAttributes['class'] }>();

const forwarded = useForwardProps(props);
const realForwarded = computed(() => {
  const { class: _, ...delegated } = forwarded.value;
  return delegated;
});
</script>

<template>
  <TabsTrigger
    v-bind="realForwarded"
    :class="cn(
      `
        inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50
        data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow
      `,
      props.class,
    )"
  >
    <slot />
  </TabsTrigger>
</template>
