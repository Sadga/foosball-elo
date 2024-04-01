<script setup lang="ts">
import tinycolor from 'tinycolor2';

const props = withDefaults(defineProps<{
  colors?: String[],
  disabled?: Boolean
}>(), {
  colors: () => ['#FAFAFA', '#212121', '#9E9E9E', '#3b82f6', '#dc2626', '#22c55e', '#ea580c', '#facc15', '#6d28d9']
});

const value = defineModel({ type: String, default: 'red' });
const options = computed(() => props.colors.map((color) => ({
  color,
  contrast: tinycolor(color).isLight() ? '#000' : '#FFF'
})));
</script>

<template>
  <div class="overflow-x-auto overflow-y-hidden">
    <div class="flex flex-nowrap gap-2 w-fit bg-muted rounded-full p-1">
      <template v-for="opt in options" :key="opt.color">
        <button
          class="group rounded-full p-0.5 border-2 w-10 h-10 cursor-pointer shrink-0 disabled:cursor-not-allowed"
          :style="{
            'border-color': opt.color === value ? opt.color : 'transparent',
            color: opt.contrast
          }"
          :disabled="props.disabled"
          @click="() => {
            if (props.disabled) return;
            value = opt.color
          }"
        >
          <div class="flex items-center justify-center rounded-full w-full h-full border" :style="{ 'background-color': opt.color }">
            <UiIcon v-if="opt.color === value" type="check" />
          </div>
        </button>
      </template>
    </div>
  </div>
</template>
