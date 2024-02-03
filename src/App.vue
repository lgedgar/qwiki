<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { mapStores } from 'pinia'
import { useQordialAuthStore } from 'qordial'
import { useWikiStore } from '@/stores/wiki'
import appsettings from './appsettings'
</script>

<script>
export default {

    data() {
        return {
            appsettings,
            darkMode: false,
        }
    },

    computed: {
        ...mapStores(useQordialAuthStore),
        ...mapStores(useWikiStore),
    },

    mounted() {
        // nb. for some reason the current route does not load automatically
        // in the context of a published q-app, so we do that explicitly
        this.$router.push(window._qdnPath)

        // set dark mode if applicable
        if (window._qdnTheme == 'dark') {
            this.setDarkMode(true)
        }
    },

    methods: {

        async authButtonClick() {
            if (!this.qordialAuthStore.address) {
                await this.$qordial.authenticate()
            } else {
                await qortalRequest({
                    action: 'OPEN_PROFILE',
                    name: this.qordialAuthStore.username,
                })
            }
        },

        setDarkMode(dark) {
            this.darkMode = dark
            const body = document.querySelector('body')
            body.className = dark ? 'dark' : ''
        },
    },
}
</script>

<template>
   <header style="padding: 1rem;">

     <o-notification variant="warning">
       <p class="block">
         NOTE: this app is very much "in progress" - you probably should not use it yet for creating real content...YMMV
       </p>
       <p class="block">
         (the app was published only for sake of testing certain aspects in the "real world")
       </p>
     </o-notification>

     <div style="display: flex; gap: 1rem; align-items: center;">

      <h1 class="is-size-1"
          style="flex-grow: 1;">

        <router-link v-if="wikiStore.authorName || $route.name == 'about'" to="/">
          {{ appsettings.appTitle }}
        </router-link>
        <span v-else>
          {{ appsettings.appTitle }}
        </span>

        <span v-if="wikiStore.authorName">
          &raquo;
          <!-- TODO: link to author wikiList view -->
          <!-- <router-link v-if="wikiStore?.wikiRoot?.title" -->
          <!--              :to="`/${wikiStore.authorName}/`"> -->
          <!--   {{ wikiStore.authorName }} -->
          <!-- </router-link> -->
          <!-- <span v-if="!wikiStore?.wikiRoot?.title"> -->
          <!--   {{ wikiStore.authorName }} -->
          <!-- </span> -->
          <span>
            {{ wikiStore.authorName }}
          </span>
        </span>

        <span v-if="wikiStore?.wikiRoot?.title">
          &raquo;
          <router-link v-if="!wikiStore.pageIdentifier || wikiStore.pageIdentifier != wikiStore.wikiMap.indexPage"
                       :to="`/${wikiStore.authorName}/${wikiStore.wikiIdentifier}/`">
            {{ wikiStore.wikiRoot.title }}
          </router-link>
          <span v-else>
            {{ wikiStore.wikiRoot.title }}
          </span>
        </span>
      </h1>

      <a v-if="!darkMode"
         href="#" @click.prevent="setDarkMode(true)">
        <o-icon icon="moon" size="large" />
      </a>
      <a v-if="darkMode"
         href="#" @click.prevent="setDarkMode(false)">
        <o-icon icon="sun" size="large" />
      </a>

      <o-button icon-left="user"
                @click="authButtonClick">
        {{ qordialAuthStore.username || "not authenticated" }}
      </o-button>

    </div>
  </header>

  <div style="padding: 0 1rem; min-height: 80vh;">
    <router-view v-slot="{Component}">
      <keep-alive>
        <component :is="Component"
                   />
      </keep-alive>
    </router-view>
  </div>

  <div class="has-text-centered">
    <RouterLink to="/about">about the app</RouterLink>
  </div>

</template>
