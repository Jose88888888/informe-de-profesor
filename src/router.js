import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import HorasXTrabajo from './views/HorasXTrabajo.vue';
import HorasxActividad from './views/horasxactividad.vue';

const routes = [
    { path: '/', component: Home },
    { path: '/horasxtrabajo', component: HorasXTrabajo },
    { path: '/horasxactividad', component: HorasxActividad}
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
