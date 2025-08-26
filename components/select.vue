<script setup lang="ts">

defineOptions({ inheritAttrs: false });
const props = defineProps<{
  options: Array<{ label: string; value: string, disabled?: boolean }>;
  placeholder?: string;
  labelNoOptions?: string;
}>();
const value = defineModel<string>();

</script>

<template>
  <UiSelect v-model="value">
    <UiSelectTrigger v-bind="$attrs">
      <UiSelectValue :placeholder="props.placeholder">{{ props.options.find((opt) => opt.value === value)?.label }}</UiSelectValue>
    </UiSelectTrigger>
    <UiSelectContent>
      <template v-if="props.options.length === 0">
        <span class="text-sm text-muted-foreground px-2">{{ props.labelNoOptions ?? $t('noAvailableOptions') }}</span>
      </template>
      <template v-else>
        <UiSelectItem v-for="opt in props.options" :key="opt.value" :value="opt.value" :disabled="opt.disabled">{{ opt.label }}</UiSelectItem>
      </template>
    </UiSelectContent>
  </UiSelect>
</template>
