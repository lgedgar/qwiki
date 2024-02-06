<script setup>
import { mapStores } from 'pinia'
import { useQordialAuthStore } from 'qordial'
import { useWikiStore } from '@/stores/wiki'
</script>

<script>
export default {

    data() {
        return {
            wikiLoaded: false,
            jumpToPage: null,

            newPageShowDialog: false,
            newPageIdentifier: null,
        }
    },

    computed: {
        ...mapStores(useQordialAuthStore),
        ...mapStores(useWikiStore),
    },

    async activated() {
        await this.setWikiPage()
   },

    watch: {

        async '$route' (to, from) {

            if (from && to && ['wikiIndex', 'wikiPage'].includes(to.name)) {

                // changing to presumably a new page context
                await this.setWikiPage(to)
            }
        },
    },

    methods: {

        async setWikiPage(route) {
            this.wikiLoaded = false

            if (!route) {
                route = this.$route
            }

            await this.$qwiki.setWiki(this.$qordial,
                                      route.params.name,
                                      route.params.wikiIdentifier)

            let pageIdentifier = route.params.pageIdentifier
            if (!pageIdentifier) {
                pageIdentifier = this.wikiStore.wikiMap.indexPage
            }

            await this.$qwiki.setPage(this.$qordial, pageIdentifier)

            this.pageContent = this.wikiStore.pageContent || "no content yet!"
            this.wikiLoaded = true

            this.$nextTick(() => {

                // add click event handlers to force router use
                this.$refs.previewWrapper.querySelectorAll('a.qwiki').forEach(a => {
                    a.addEventListener('click', event => {
                        event.preventDefault()
                        const page = event.target.pathname.replace(/^(?:\/render\/APP\/qwiki)?\//, '')
                        this.$router.push(`/${this.wikiStore.authorName}/${this.wikiStore.wikiIdentifier}/${page}`)
                    })
                })
            })
        },

        jumpToPageUpdated(page) {
            if (page) {
                this.$router.push(`/${this.wikiStore.authorName}/${this.wikiStore.wikiIdentifier}/${page}`)
                this.$nextTick(() => {
                    this.jumpToPage = null
                })
            }
        },

        newPageInit() {
            this.newPageIdentifier = null
            this.newPageShowDialog = true
        },

        newPageEdit() {
            this.newPageShowDialog = false
            this.$router.push(`/${this.wikiStore.authorName}/${this.wikiStore.wikiIdentifier}/${this.newPageIdentifier}/edit`)
        },
    },
}
</script>

<template>
  <div class="wiki">

    <div class="block"
         style="display: flex; align-items: center; gap: 1rem;">
      <span>viewing page:</span>
      <span class="has-text-weight-bold">{{ $route.params.pageIdentifier || wikiStore.wikiMap?.indexPage }}</span>
      <span style="width: 10rem;" />
      <div v-if="wikiLoaded" style="display: flex; align-items: center; gap: 1rem;">

        <o-button v-if="qordialAuthStore.username && qordialAuthStore.username == $route.params.name"
                  variant="primary"
                  icon-left="edit"
                  @click="$router.push(`/${$route.params.name}/${wikiStore.wikiIdentifier}/${wikiStore.pageIdentifier}/edit`)">
          Edit This Page
        </o-button>

        <o-button v-if="qordialAuthStore.username && qordialAuthStore.username == $route.params.name"
                  variant="primary"
                  icon-left="plus"
                  @click="newPageInit()">
          Add New Page
        </o-button>

        <span class="has-text-weight-bold"
              style="margin-left: 3rem;">
          Jump to page:
        </span>
        <o-select v-model="jumpToPage"
                  @update:model-value="jumpToPageUpdated">
          <option :value="null">...choose...</option>
          <option v-for="(pageKey, pageValue) of wikiStore.wikiMap?.pages || []"
                  :key="pageKey">
            {{ pageKey }}
          </option>
        </o-select>

      </div>
    </div>

    <div v-if="wikiLoaded"
         ref="previewWrapper">
      <v-md-preview :text="wikiStore.pageContent || ''" />
    </div>

    <div v-else>
      <p class="block">
        Fetching data from QDN, please wait...
      </p>
    </div>

    <o-modal v-model:active="newPageShowDialog">
      <div class="card">

        <div class="card-header">
          <div class="card-header-title">
            Add Wiki Page
          </div>
        </div>

        <div class="card-content">

          <div v-if="wikiLoaded">
            <o-field grouped>
              <o-field label="Page Identifier">
                <o-input v-model="newPageIdentifier" />
              </o-field>
            </o-field>
          </div>

          <div class="card-footer">
            <div class="card-footer-item buttons">
              <o-button variant="primary"
                        @click="newPageEdit()"
                        icon-left="save"
                        >
                Edit My New Page
              </o-button>
              <o-button @click="newPageShowDialog = false">
                Cancel
              </o-button>
            </div>
          </div>

        </div>
      </div>
    </o-modal>

  </div>
</template>
