import { createRouter, createWebHistory } from 'vue-router';
import { isActiveSession } from './middelware';
import login from './views/login.vue';
import Home from './views/Home.vue';
import HorasXTrabajo from './views/horasXTrabajo.vue';
import HorasxActividad from './views/horasxactividad.vue';
import parcial from './views/inicioinforme.vue';
import actividadesespe from './views/actividadesespe.vue';
import otrasacti from './views/otrasacti.vue';
import reportefinal from './views/reportefinal.vue';

const routes = [
    { path: '/', component: login },
    { path: '/Home', component: Home },
    { path: '/inicioinforme', component: parcial},
    { path: '/horasxtrabajo', component: HorasXTrabajo, beforeEnter: (from, next) =>{
        if(isActiveSession()){
            next();
        }
    }},
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
