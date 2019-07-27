<template>
  <div id="app">
    <Home />
    <footer id="footer">
      <div class="inner">
          <div class="flex">
              <ul class="icons">
                  <li><a href="mailto:ibarz.jean@gmail.com" target="_blank" class="icon fa-mail-forward"><span class="label">Email</span></a></li>
                  <li><a href="https://www.linkedin.com/in/jeanibarz/" target="_blank" class="icon fa-linkedin"><span class="label">linkedIn</span></a></li>
              </ul>
          </div>
      </div>
    </footer>
  </div>
</template>

<script>
  import Home from './components/Home.vue'
  
  export default {
    name: 'app',
    components: {
      Home
    }
  }
</script>

<style src="./../assets/css/main.css"></style>