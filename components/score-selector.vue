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
  <UiPagination
    v-slot="{ page }"
    :total="props.max + 1"
    :items-per-page="1"
    :sibling-count="1"
    show-edges
    v-model:page="_score"
    class="w-0 grow"
  >
    <UiPaginationList v-slot="{ items }" class="flex items-center gap-1">
      <UiPaginationPrev>
        <UiIcon type="remove"/>
      </UiPaginationPrev>

      <template v-for="(item, index) in items">
        <UiPaginationListItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
          <UiButton class="w-10 h-10 p-0" :variant="item.value === page ? 'default' : 'outline'">
            {{ item.value - 1 }}
          </UiButton>
        </UiPaginationListItem>
        <UiPaginationEllipsis v-else :key="item.type" :index="index" />
      </template>

      <UiPaginationNext>
        <UiIcon type="add"/>
      </UiPaginationNext>
    </UiPaginationList>
  </UiPagination>
</template>
