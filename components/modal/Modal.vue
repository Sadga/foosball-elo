<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';
import Dialog from '../ui/dialog/Dialog.vue';
import Drawer from '../ui/drawer/Drawer.vue';

const isDesktop = useMediaQuery('(min-width: 768px)');
const open = defineModel<boolean>({ prop: 'open' });

provide('isDesktop', isDesktop);
</script>

<template>
  <component :is="isDesktop ? Dialog : Drawer" v-model:open="open">
    <slot />
  </component>
</template>
