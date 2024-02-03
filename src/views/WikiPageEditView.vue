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
            pageContent: null,
            publishing: false,
        }
    },

    computed: {
        ...mapStores(useQordialAuthStore),
        ...mapStores(useWikiStore),
    },

    async activated() {
        this.wikiLoaded = false

        // authenticated user must own wiki/page to edit
        if (this.$route.params.name != this.qordialAuthStore.username) {
            return this.viewInstead()
        }

        await this.$qwiki.setWiki(this.$qordial,
                                  this.$route.params.name,
                                  this.$route.params.wikiIdentifier)

        await this.$qwiki.setPage(this.$qordial,
                                  this.$route.params.pageIdentifier)

        this.pageContent = this.wikiStore.pageContent || "no content yet!"
        this.wikiLoaded = true
    },

    methods: {

        viewInstead(pageIdentifier) {
            this.$router.push(`/${this.wikiStore.authorName}/${this.wikiStore.wikiIdentifier}/${pageIdentifier || this.wikiStore.pageIdentifier}`)
        },

        async publishSubmit() {
            this.publishing = true

            const pageParams = {
                service: 'DOCUMENT',
                name: this.qordialAuthStore.username,
                identifier: `qwiki_page_${this.wikiStore.wikiIdentifier}_${this.wikiStore.pageIdentifier}`,
                data64: await this.$qordial.stringToBase64(this.pageContent),
            }

            let params
            if (this.wikiStore.pageIsListed) {
                params = {
                    action: 'PUBLISH_QDN_RESOURCE',
                    ...pageParams,
                }

            } else {
                const wikiMap = this.wikiStore.wikiMap
                wikiMap.pages[this.wikiStore.pageidentifier] = this.wikiStore.pageIdentifier

                params = {
                    action: 'PUBLISH_MULTIPLE_QDN_RESOURCES',
                    resources: [
                        pageParams,
                        {
                            service: 'DOCUMENT',
                            name: this.qordialAuthStore.username,
                            identifier: `qwiki_map_${this.wikiStore.wikiIdentifier}`,
                            data64: await this.$qordial.objectToBase64(wikiMap),
                        },
                    ],
                }
            }

            try {
                await qortalRequest(params)
            } catch (error) {
                if (error?.error != "User declined request") {
                    alert("publish error:\n\n" + error)
                }
                this.publishing = false
                return
            }

            // nb. clear out the cached wiki page and re-load to view
            const pageIdentifier = this.wikiStore.pageIdentifier
            this.wikiStore.setPageIdentifier(null)
            this.wikiStore.setPageContent(null)
            this.publishing = false
            this.viewInstead(pageIdentifier)
        },
    },
}
</script>

<template>
  <div class="wiki-edit">

    <div class="block"
         style="display: flex; align-items: center; gap: 1rem;">
      <span>
        editing
        <span v-if="wikiLoaded && !wikiStore.pageExists">
          NEW
        </span>
        page:
      </span>
      <span class="has-text-weight-bold">{{ $route.params.pageIdentifier }}</span>
      <span style="width: 5rem;" />
      <div v-if="wikiLoaded"
           style="display: flex; align-items: center; gap: 1rem;">
        <o-button variant="primary"
                  icon-left="save"
                  @click="publishSubmit()"
                  :disabled="publishing">
          {{ publishing ? "Working, please wait..." : "Publish" }}
        </o-button>
        <o-button @click="viewInstead()">
          Cancel
        </o-button>
      </div>
    </div>

    <div v-if="wikiLoaded">
      <v-md-editor v-model="pageContent" height="400px"></v-md-editor>
    </div>
    <div v-else>
      <p class="block">
        Fetching data from QDN, please wait...
      </p>
    </div>

  </div>
</template>
