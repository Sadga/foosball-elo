<script setup lang="ts">
import DialogContent from '../ui/dialog/DialogContent.vue';
import DrawerContent from '../ui/drawer/DrawerContent.vue';

const isDesktop = inject('isDesktop');
</script>

<template>
  <component :is="isDesktop ? DialogContent : DrawerContent">
    <slot />
  </component>
</template>