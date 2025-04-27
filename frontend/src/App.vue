<template>
  <div class="app">
    <router-view />
    <Toast />
  </div>
</template>

<script setup>
import Toast from "@/components/ui/Toast.vue";
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #1f2937;
  background-color: #f6f8fa;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw;
  max-width: 100vw;
  text-align: left;
  overflow-x: hidden;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  margin-top: 0;
  color: #111827;
}

a {
  color: #4f46e5;
  text-decoration: none;
}

button {
  font-family: inherit;
}
</style>
