<script setup lang="ts">
</script>

<template>
  <TransitionGroup name="transition-list">
    <slot />
  </TransitionGroup>
</template>

<style>
.transition-list-move, /* apply transition to moving elements */
.transition-list-enter-active,
.transition-list-leave-active {
  transition: all 0.15s ease;
}

.transition-list-enter-from,
.transition-list-leave-to {
  opacity: 0;
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.transition-list-leave-active {
  position: absolute;
}
</style>
