import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/subject/:type', name: 'SubjectMap', component: () => import('../views/SubjectMap.vue') },
  { path: '/pinyin/:lessonId', name: 'PinyinLesson', component: () => import('../views/PinyinLesson.vue') },
  { path: '/math/:lessonId', name: 'MathLesson', component: () => import('../views/MathLesson.vue') },
  { path: '/english/:lessonId', name: 'EnglishLesson', component: () => import('../views/EnglishLesson.vue') },
  { path: '/weiqi/:lessonId', name: 'WeiqiLesson', component: () => import('../views/WeiqiLesson.vue') },
  { path: '/store', name: 'Store', component: () => import('../views/Store.vue') },
  { path: '/growth', name: 'Growth', component: () => import('../views/Growth.vue') },
  { path: '/profile', name: 'Profile', component: () => import('../views/Profile.vue') },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
