import Vue from 'vue';
import VueKonva from 'vue-konva';
import App from './App.vue';
import './styles/main.css';

Vue.use(VueKonva);

new Vue({
  render: h => h(App)
}).$mount('#app');
