import { createRouter, createWebHistory } from 'vue-router';
import { isActiveSession, isProfesor, isAdmin } from './middelware';

// Vistas compartidas
import login from './views/login.vue';

// Vistas de profesor
import Home from './views/Home.vue';
import HorasXTrabajo from './views/horasXTrabajo.vue';
import HorasxActividad from './views/horasxactividad.vue';
import parcial from './views/inicioinforme.vue';
import actividadesespe from './views/actividadesespe.vue';
import otrasacti from './views/otrasacti.vue';
import reportefinal from './views/reportefinal.vue';

// Vistas de administrador 
import HomeAdmin from './views/admin/homeadmin.vue'; // Asegúrate de crear este componente
import adminuser from './views/admin/adminuser.vue';
import adminacti from './views/admin/adminacti.vue';
import Inicioinforme from './views/inicioinforme.vue';

const routes = [
    { 
        path: '/', 
        name: 'login',
        component: () => import('./views/Login.vue')
    },

    
    // Rutas de profesor
    {
        path: '/Home',
        name: 'Home',
        component: () => import('./views/Home.vue'),
        beforeEnter: (to, from, next) => {
          if (isActiveSession() && isProfesor()) {
            next();
          } else {
            next('/');
          }
        }
      },

    { 
        path: '/inicioinforme', 
        name: 'Inicioinforme',
        component: () => import('./views/inicioinforme.vue'),
        beforeEnter: (to, from, next) => {
          if (isActiveSession() && isProfesor()) {
            next();
          } else {
            next('/');
          }
        }
      },

      {
        path: '/horasxtrabajo', 
        name: 'HorasXTrabajo',
        component: () => import('./views/horasxtrabajo.vue'),
        beforeEnter: (to, from, next) => {
          if (isActiveSession() && isProfesor()) {
            next();
          } else {
            next('/');
          }
        }
      },

    { 
        path: '/horasxactividad', 
        name: 'HorasxActividad',
        component: () => import('./views/horasxactividad.vue'),
        beforeEnter: (to, from, next) => {
          if (isActiveSession() && isProfesor()) {
            next();
          } else {
            next('/');
          }
        }
      },

    { 
        path: '/actividadesespe', 
        name: 'actividadesespe',
        component: () => import('./views/actividadesespe.vue'),
        beforeEnter: (to, from, next) => {
          if (isActiveSession() && isProfesor()) {
            next();
          } else {
            next('/');
          }
        }
      },

    { 
        path: '/otrasacti', 
        name: 'otrasacti',
        component: () => import('./views/otrasacti.vue'),
        beforeEnter: (to, from, next) => {
          if (isActiveSession() && isProfesor()) {
            next();
          } else {
            next('/');
          }
        }
      },

    { 
        path: '/reportefinal', 
        name: 'reportefinal',
        component: () => import('./views/reportefinal.vue'),
        beforeEnter: (to, from, next) => {
          if (isActiveSession() && isProfesor()) {
            next();
          } else {
            next('/');
          }
        }
      },
    
    // Rutas de administrador
    {
        path: '/homeadmin',
        name: 'HomeAdmin',
        component: () => import('./views/admin/homeadmin.vue'),
        beforeEnter: (to, from, next) => {
          if (isActiveSession() && isAdmin()) {
            next();
          } else {
            next('/');
          }
        }
      },
    
    
     {
            path: '/adminuser',
            name: 'adminuser',
            component: () => import('./views/admin/adminuser.vue'),
            beforeEnter: (to, from, next) => {
              if (isActiveSession() && isAdmin()) {
                next();
              } else {
                next('/');
              }
            }
          },

          {
            path: '/adminacti',
            name: 'adminacti',
            component: () => import('./views/admin/adminacti.vue'),
            beforeEnter: (to, from, next) => {
              if (isActiveSession() && isAdmin()) {
                next();
              } else {
                next('/');
              }
            }
          },
          
    // Ruta para página no encontrada
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
  });
  
  // Navegación global para verificar sesión
  router.beforeEach((to, from, next) => {
    console.log("Navegando a:", to.path);
    console.log("isActiveSession:", isActiveSession());
    console.log("isProfesor:", isProfesor());
    console.log("isAdmin:", isAdmin());
    console.log("localStorage userrol:", localStorage.getItem("userrol"));
    if (to.path !== '/' && !isActiveSession()) {
      next('/');
    } else {
      next();
    }
  });
  
  export default router;