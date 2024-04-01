<script setup lang="ts">
import DialogClose from '../ui/dialog/DialogClose.vue';
import DrawerClose from '../ui/drawer/DrawerClose.vue';

const isDesktop = inject('isDesktop');
</script>

<template>
  <component :is="isDesktop ? DialogClose : DrawerClose">
    <slot />
  </component>
</template>
