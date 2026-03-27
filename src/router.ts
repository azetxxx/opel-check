import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './pages/HomePage.vue';
import MaintenancePage from './pages/MaintenancePage.vue';
import MapPage from './pages/MapPage.vue';
import MusicPage from './pages/MusicPage.vue';
import SettingsPage from './pages/SettingsPage.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/home', redirect: '/' },
    { path: '/map', name: 'map', component: MapPage },
    { path: '/maintenance', name: 'maintenance', component: MaintenancePage },
    { path: '/wartung', redirect: '/maintenance' },
    { path: '/music', name: 'music', component: MusicPage },
    { path: '/musik', redirect: '/music' },
    { path: '/settings', name: 'settings', component: SettingsPage },
    { path: '/einstellungen', redirect: '/settings' }
  ]
});
