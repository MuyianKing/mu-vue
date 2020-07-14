<template>
    <transition name="fade">
        <router-view/>
    </transition>
</template>

<style lang="scss">
    html, body {
        height: 100%;
        width: 100%;
        padding: 0;
        margin: 0;
    }

    body {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
    }
</style>
