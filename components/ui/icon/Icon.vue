<script lang="ts">
import type { PropType } from 'vue';

import add from './assets/add.svg?raw';
import angleLeft from './assets/angle-left.svg?raw';
import angleRight from './assets/angle-right.svg?raw';
import ball from './assets/ball.svg?raw';
import check from './assets/check.svg?raw';
import copy from './assets/copy.svg?raw';
import darkMode from './assets/dark-mode.svg?raw';
import lightMode from './assets/light-mode.svg?raw';
import logout from './assets/logout.svg?raw';
import more from './assets/more.svg?raw';
import personAdd from './assets/person-add.svg?raw';
import ranking from './assets/ranking.svg?raw';
import desktop from './assets/desktop.svg?raw';
import drag from './assets/drag.svg?raw';
import edit from './assets/edit.svg?raw';
import expandMore from './assets/expand-more.svg?raw';
import expand from './assets/expand.svg?raw';
import eyeSlash from './assets/eye-slash.svg?raw';
import eye from './assets/eye.svg?raw';
import google from './assets/google.svg?raw';
import height from './assets/height.svg?raw';
import laptop from './assets/laptop.svg?raw';
import redo from './assets/redo.svg?raw';
import remove from './assets/remove.svg?raw';
import save from './assets/save.svg?raw';
import search from './assets/search.svg?raw';
import settings from './assets/settings.svg?raw';
import share from './assets/share.svg?raw';
import shieldSword from './assets/shield-sword.svg?raw';
import shield from './assets/shield.svg?raw';
import smartphone from './assets/smartphone.svg?raw';
import star from './assets/star.svg?raw';
import sword from './assets/sword.svg?raw';
import tablet from './assets/tablet.svg?raw';
import tv from './assets/tv.svg?raw';
import undo from './assets/undo.svg?raw';
import width from './assets/width.svg?raw';
import xmark from './assets/xmark.svg?raw';

const icons = {
  add,
  'angle-left': angleLeft,
  'angle-right': angleRight,
  'dark-mode': darkMode,
  'light-mode': lightMode,
  ball,
  check,
  copy,
  logout,
  more,
  'person-add': personAdd,
  ranking,
  desktop,
  drag,
  edit,
  'expand-more': expandMore,
  expand,
  'eye-slash': eyeSlash,
  eye,
  google,
  height,
  laptop,
  redo,
  remove,
  save,
  search,
  settings,
  share,
  'shield-sword': shieldSword,
  shield,
  smartphone,
  star,
  sword,
  tablet,
  tv,
  undo,
  width,
  xmark
};
export type IconType = keyof typeof icons;
</script>

<script setup lang="ts">
const props = defineProps<{
  type: IconType;
  fill?: boolean;
}>();
</script>

<template>
  <span v-html="icons[props.type]" class="icon"></span>
</template>

<style scoped>
.icon > :deep(svg) {
  width: 1.5em;
  height: 1.5em;
  fill: currentColor;
}
</style>
