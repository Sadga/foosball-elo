<script setup lang="ts">
import type { User } from '../../db/types';

const user = inject<Ref<User>>('user');
async function saveUser () {
  if (!user) { return; }

  user.value = await $fetch('/api/save/user', { method: 'PUT', body: user.value });
}
</script>

<template>
  <div class="container flex flex-col items-center gap-3 py-3 max-md:px-3 max-w-screen-2xl" v-if="user">
    <UserAvatar :user="user" size="lg" />
    <div class="flex gap-2">
      <span class="text-3xl font-semibold">{{ user.name }}</span>
      <UiDialog>
        <UiDialogTrigger>
          <UiIcon type="edit" class="text-sm text-muted-foreground"/>
        </UiDialogTrigger>
        <UiDialogContent>
          <UiDialogHeader>
            <UiDialogTitle>{{ $t('editUser') }}</UiDialogTitle>
          </UiDialogHeader>
          <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
              <UiLabel for="user-name" class="text-right">{{ $t('name') }}</UiLabel>
              <UiInput id="user-name" class="col-span-3" v-model="user.name" />
            </div>
          </div>
          <UiDialogFooter>
            <UiDialogClose as-child>
              <UiButton type="submit" @click="saveUser">{{ $t('save') }}</UiButton>
            </UiDialogClose>
          </UiDialogFooter>
        </UiDialogContent>
      </UiDialog>
    </div>
  </div>
</template>
