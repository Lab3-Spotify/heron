import { createRouter, createWebHistory } from 'vue-router'
import Welcome from '@/views/Welcome.vue'
import ExperimentStart from '@/views/ExperimentStart.vue'
import ExperimentStart2 from '@/views/ExperimentStart2.vue'
import SpotifyCallback from '@/views/SpotifyCallback.vue'
import PlaylistPlayer from '@/views/PlaylistPlayer.vue'
import PlaylistSatisfaction from '@/views/PlaylistSatisfaction.vue'
import ThankYou from '@/views/ThankYou.vue'
import SpotifyIframe from '@/views/SpotifyIframe.vue'
import SpotifyPreAuth from '@/views/SpotifyPreAuth.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/welcome'
    },
    {
      path: '/welcome',
      name: 'welcome',
      component: Welcome
    },
    {
      path: '/spotify-callback',
      name: 'spotify-callback',
      component: SpotifyCallback
    },
    {
      path: '/experiment-start',
      name: 'experiment-start',
      component: ExperimentStart
    },
    {
      path: '/experiment-start-2',
      name: 'experiment-start-2',
      component: ExperimentStart2
    },
    {
      path: '/playlist-player',
      name: 'playlist-player',
      component: PlaylistPlayer
    },
    {
      path: '/playlist-satisfaction',
      name: 'playlist-satisfaction',
      component: PlaylistSatisfaction
    },
    {
      path: '/thank-you',
      name: 'thank-you',
      component: ThankYou
    },
    {
      path: '/spotify-iframe',
      name: 'spotify-iframe',
      component: SpotifyIframe
    },
    {
      path: '/spotify-pre-auth',
      name: 'spotify-pre-auth',
      component: SpotifyPreAuth
    }
  ]
})

export default router
