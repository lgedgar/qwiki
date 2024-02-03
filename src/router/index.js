import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import WikiListView from '../views/WikiListView.vue'
import WikiPageView from '../views/WikiPageView.vue'
import WikiPageEditView from '../views/WikiPageEditView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/:name/',
            name: 'wikiList',
            component: WikiListView,
        },
        {
            path: '/:name/:wikiIdentifier/',
            name: 'wikiIndex',
            component: WikiPageView,
        },
        {
            path: '/:name/:wikiIdentifier/:pageIdentifier',
            name: 'wikiPage',
            component: WikiPageView,
        },
        {
            path: '/:name/:wikiIdentifier/:pageIdentifier/edit',
            name: 'wikiPageEdit',
            component: WikiPageEditView,
        },
        {
            path: '/about',
            name: 'about',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/AboutView.vue')
        }
    ]
})

export default router
