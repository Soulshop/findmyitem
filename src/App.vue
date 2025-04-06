<script setup>
import FindItem from "./components/FindItem.vue";
import viteLogoUrl from "./assets/vite.svg";
import vueLogoUrl from "./assets/vue.svg";

</script>

<template>
  <div
    class="row no-wrap justify-start items-center content-start q-gutter-xs"
    style="padding: 5px;max-width: 330px;"
  >
    <FindItem v-bind:msg="x" />
  </div>
</template>

<style scoped>
</style>
