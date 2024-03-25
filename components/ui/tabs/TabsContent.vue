<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue';
import { TabsContent, type TabsContentProps, useForwardProps } from 'radix-vue';
import { cn } from '../../../libs/utils';

const props = defineProps<TabsContentProps & { class?: HTMLAttributes['class'] }>();

const forwarded = useForwardProps(props);
const realForwarded = computed(() => {
  const { class: _, ...delegated } = forwarded.value;
  return delegated;
});
</script>

<template>
  <TabsContent
    v-bind="realForwarded"
    :class="cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      props.class
    )"
  >
    <slot />
  </TabsContent>
</template>
