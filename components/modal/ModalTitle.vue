<script setup lang="ts">
import DialogTitle from '../ui/dialog/DialogTitle.vue';
import DrawerTitle from '../ui/drawer/DrawerTitle.vue';

const isDesktop = inject('isDesktop');
</script>

<template>
  <component :is="isDesktop ? DialogTitle : DrawerTitle">
    <slot />
  </component>
</template>
