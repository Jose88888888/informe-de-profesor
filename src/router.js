import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import HorasXTrabajo from './views/HorasXTrabajo.vue';
import HorasxActividad from './views/horasxactividad.vue';
import actividadesespe from './views/actividadesespe.vue';
import otrasacti from './views/otrasacti.vue';
import reportefinal from './views/reportefinal.vue';

const routes = [
    { path: '/', component: Home },
    { path: '/horasxtrabajo', component: HorasXTrabajo },
    { path: '/horasxactividad', component: HorasxActividad},
    { path: '/actividadesespe', component: actividadesespe},
    { path: '/otrasacti', component: otrasacti},
    { path: '/reportefinal', component: reportefinal}
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
