<script setup lang="ts">
import DialogDescription from '../ui/dialog/DialogDescription.vue';
import DrawerDescription from '../ui/drawer/DrawerDescription.vue';

const isDesktop = inject('isDesktop');
</script>

<template>
  <component :is="isDesktop ? DialogDescription : DrawerDescription">
    <slot />
  </component>
</template>
