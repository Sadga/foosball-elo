<script setup lang="ts">
import DialogFooter from '../ui/dialog/DialogFooter.vue';
import DrawerFooter from '../ui/drawer/DrawerFooter.vue';

const isDesktop = inject('isDesktop');
</script>

<template>
  <component :is="isDesktop ? DialogFooter : DrawerFooter">
    <slot />
  </component>
</template>
