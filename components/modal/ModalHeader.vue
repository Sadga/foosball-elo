<script setup lang="ts">
import DialogHeader from '../ui/dialog/DialogHeader.vue';
import DrawerHeader from '../ui/drawer/DrawerHeader.vue';

const isDesktop = inject('isDesktop');
</script>

<template>
  <component :is="isDesktop ? DialogHeader : DrawerHeader">
    <slot />
  </component>
</template>
