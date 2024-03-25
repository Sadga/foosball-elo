<script setup lang="ts">
import { nextTick, ref } from 'vue';

const value = defineModel({ type: String, default: '' });
const editable = ref<boolean>(false);
const span = ref<HTMLElement | null>(null);

function startEdit () {
  editable.value = true;
  nextTick(() => {
    if (span.value) {
      span.value.focus();
      moveCursorToEnd(span.value);
    }
  });
}

function stopEdit () {
  editable.value = false;
  nextTick(() => {
    if (span.value) {
      span.value.scrollLeft = 0;
    }
  });
}

function moveCursorToEnd (element: HTMLElement) {
  const range = document.createRange();
  const selection = window.getSelection();
  range.setStart(element, 0);
  range.setEnd(element, element.childNodes.length);
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
</script>

<template>
  <span
    ref="span"
    @dblclick="startEdit"
    @blur="stopEdit"
    @keydown.enter.prevent="stopEdit"
    @keyup="(e) => { if (editable) { value = e.target.textContent } }"
    :contentEditable="editable"
    :data-editable="editable"
    :title="value"
    class="w-full overflow-hidden text-nowrap data-[editable=false]:text-ellipsis"
    style="height: 1.5em;"
  >
    {{ value }}
  </span>
</template>
