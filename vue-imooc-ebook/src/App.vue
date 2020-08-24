<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {}
//rem实现自适应布局
document.addEventListener('DOMContentLoaded', () => {
    let fontSize = window.innerWidth / 10
    fontSize = fontSize > 50 ? 50 : fontSize
    const html = document.querySelector('html')
    html.style.fontSize = fontSize + 'px'
  })
</script>

<style lang='scss' scoped>
  #app {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #7d8188;

  }
</style>
