import Vue from "vue";
import Router from "vue-router";
import { CAdminTablePage, CAdminEditorPage } from "coalesce-vue-vuetify/lib";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("./views/Home.vue"),
    },
    {
      path: "/coalesce-example",
      name: "coalesce-example",
      component: () => import("./views/CoalesceExample.vue"),
      props: { title: "Coalesce Example" },
    },
    {
      path: "/pendulum",
      name: "pendulum",
      component: () => import("./views/Pendulum.vue"),
      props: { title: "Pendulum" },
      beforeEnter(to, from, next) {
        console.log('entering')
        next();
      },
    },
    {
      path: "/physicsball",
      name: "physicsball",
      component: () => import("./views/PhysicsBall.vue"),
      props: { title: "Physics Ball" },
      beforeEnter(to, from, next) {
        console.log('entering')
        next();
      },
    },

    // Coalesce admin routes
    {
      path: "/admin/:type",
      name: "coalesce-admin-list",
      component: CAdminTablePage,
      props: (r) => ({
        type: r.params.type,
      }),
    },
    {
      path: "/admin/:type/edit/:id?",
      name: "coalesce-admin-item",
      component: CAdminEditorPage,
      props: (r) => ({
        type: r.params.type,
        id: r.params.id,
      }),
    },
  ],
});
