<script setup lang="ts">
const props = withDefaults(defineProps<{
  max: number;
}>(), {
  max: 10
});

const score = defineModel<number>({ default: 0 });
const _score = computed({
  get: () => score.value + 1,
  set: (value: number) => score.value = value - 1
});
</script>

<template>
  <div class="overflow-x-auto overflow-y-hidden">
    <div class="flex flex-nowrap gap-2 w-fit bg-muted rounded-lg p-1">
      <UiButton
        v-for="i in props.max + 1"
        :key="i"
        size="icon"
        variant="ghost"
        :class="{
          'bg-background': score === i - 1,
          'hover:bg-background': score === i - 1
        }"
        @click="() => score = i - 1"
      >
        {{ i - 1 }}
      </UiButton>
    </div>
  </div>

</template>
