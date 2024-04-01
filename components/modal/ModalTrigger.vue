<script setup lang="ts">
import DialogTrigger from '../ui/dialog/DialogTrigger.vue';
import DrawerTrigger from '../ui/drawer/DrawerTrigger.vue';

const isDesktop = inject('isDesktop');
</script>

<template>
  <component :is="isDesktop ? DialogTrigger : DrawerTrigger">
    <slot />
  </component>
</template>
