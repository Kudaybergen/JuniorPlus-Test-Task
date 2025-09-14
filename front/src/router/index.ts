import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'dashboard',
            component: () => import('@/views/DashboardView.vue'),
            meta: {
                title: 'Dashboard'
            }
        },
        {
            path: '/notes',
            name: 'notes',
            component: () => import('@/views/NotesView.vue'),
            meta: {
                title: 'Notes'
            }
        },
        {
            path: '/notes/create',
            name: 'create-note',
            component: () => import('@/views/CreateNoteView.vue'),
            meta: {
                title: 'Create Note'
            }
        },
        {
            path: '/notes/:id',
            name: 'view-note',
            component: () => import('@/views/ViewNoteView.vue'),
            meta: {
                title: 'View Note'
            },
            props: true
        },
        {
            path: '/notes/:id/edit',
            name: 'edit-note',
            component: () => import('@/views/EditNoteView.vue'),
            meta: {
                title: 'Edit Note'
            },
            props: true
        },
        {
            path: '/categories',
            name: 'categories',
            component: () => import('@/views/CategoriesView.vue'),
            meta: {
                title: 'Categories'
            }
        },
        {
            path: '/categories/create',
            name: 'create-category',
            component: () => import('@/views/CreateCategoryView.vue'),
            meta: {
                title: 'Create Category'
            }
        },
        {
            path: '/categories/:id/notes',
            name: 'category-notes',
            component: () => import('@/views/CategoryNotesView.vue'),
            meta: {
                title: 'Category Notes'
            },
            props: true
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () => import('@/views/NotFoundView.vue'),
            meta: {
                title: 'Page Not Found'
            }
        }
    ]
})

// Global navigation guard to set page title
router.beforeEach((to, from, next) => {
    const title = to.meta?.title as string
    if (title) {
        document.title = `${title} | Notes App`
    }
    next()
})

export default router