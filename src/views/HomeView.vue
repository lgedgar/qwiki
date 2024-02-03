<script setup>
import { mapStores } from 'pinia'
import {useQordialAuthStore, NameInput, PrettyTime} from 'qordial'
import { RouterLink } from 'vue-router'
</script>

<script>
export default {

    data() {
        return {
            wikiSearchEntry: null,
            wikiSearchResults: null,
            wikiSearching: false,

            newWikiShowDialog: false,
            newWikiDocument: null,
            newWikiIndexPage: null,
            newWikiPublishing: false,

            wikiIdentifierMaxLength: 25,
        }
    },

    computed: {
        ...mapStores(useQordialAuthStore),
    },


    async mounted() {
        await this.wikiSearchSubmit()
   },

    activated() {
        this.$qwiki.clearWiki()
        this.$qwiki.clearPage()
    },

    methods: {

        async wikiSearchSubmit(event) {
            if (event) {
                event.preventDefault()
            }
            this.wikiSearching = true
            this.wikiSearchResults = []

            const response = await qortalRequest({
                action: 'SEARCH_QDN_RESOURCES',
                mode: 'ALL',
                service: 'DOCUMENT',
                query: this.wikiSearchEntry,
                identifier: 'qwiki_root_',
                excludeBlocked: true,
                limit: 20,      // TODO
                reverse: true,
            })

            for (let info of response) {
                const wiki = await this.$qordial.fetchResourceObject(info)
                if (wiki.version == 1) {
                    info.wiki = wiki
                    this.wikiSearchResults.push(info)
                }
            }

            this.wikiSearching = false
            this.$nextTick(() => {
                this.$refs.wikiSearchEntry.$el.querySelector('input').focus()
            })
        },

        async newWikiInit() {
            this.newWikiDocument = {}
            this.newWikiIndexPage = 'Home'
            this.newWikiShowDialog = true
        },

        sanitizeWikiIdentifier(id) {
            id = id.replace(/[^0-9A-Za-z\-_]+/g, '-')
            if (id.length > this.wikiIdentifierMaxLength) {
                id = id.slice(0, this.wikiIdentifierMaxLength)
            }
            return id
        },

        newWikiTitleChanged(title) {
            this.newWikiDocument.wikiIdentifier = this.sanitizeWikiIdentifier(title)
        },

        newWikiIdentifierSanitize(id) {
            const sanitized = this.sanitizeWikiIdentifier(id)
            if (sanitized != id) {
                this.newWikiDocument.wikiIdentifier = sanitized
            }
        },

        async newWikiPublish() {

            if (!this.newWikiDocument.title) {
                alert("Please provide a value for Wiki Title.")
                return
            }

            if (!this.newWikiDocument.wikiIdentifier) {
                alert("Please provide a value for Wiki Identifier.")
                return
            }

            if (!this.newWikiIndexPage) {
                alert("Please provide a value for Index Page Name.")
                return
            }

            this.newWikiPublishing = true

            const indexPage = this.newWikiIndexPage
            const resources = [
                {
                    service: 'DOCUMENT',
                    name: this.qordialAuthStore.username,
                    identifier: `qwiki_root_${this.newWikiDocument.wikiIdentifier}`,
                    data64: await this.$qordial.objectToBase64({
                        ...this.newWikiDocument,
                        version: 1,
                    }),
                },
                {
                    service: 'DOCUMENT',
                    name: this.qordialAuthStore.username,
                    identifier: `qwiki_map_${this.newWikiDocument.wikiIdentifier}`,
                    data64: await this.$qordial.objectToBase64({
                        indexPage: indexPage,
                        pages: {indexPage: indexPage},
                        version: 1,
                    }),
                },
            ]

            try {
                await qortalRequest({
                    action: 'PUBLISH_MULTIPLE_QDN_RESOURCES',
                    resources: resources,
                })
            } catch (error) {
                if (error?.error != "User declined request") {
                    console.log(error)
                    alert("publish error:\n\n" + error)
                }
                this.newWikiPublishing = false
                return
            }

            alert("published")

            this.newWikiPublishing = false
            this.newWikiShowDialog = false
        },
    },
}
</script>

<template>
  <main>

    <div class="block"
         style="display: flex; justify-content: space-between;">
      <form @submit="wikiSearchSubmit">
        <o-field grouped>
          <o-input v-model="wikiSearchEntry"
                   ref="wikiSearchEntry"
                   placeholder="Find a wiki..."
                   :disabled="wikiSearching" />
          <o-button variant="primary"
                    native-type="submit"
                    icon-left="search"
                    :disabled="wikiSearching" />
        </o-field>
      </form>
      <div class="buttons">
        <o-button variant="primary"
                  icon-left="plus"
                  @click="newWikiInit()">
          Create New Wiki
        </o-button>
      </div>
    </div>

    <o-table :data="wikiSearchResults || []"
             hoverable
             :loading="wikiSearching">

      <template #empty>
        <span class="is-italic">no results found</span>
      </template>

      <o-table-column label="Wiki Title"
                      v-slot="{ row }">
        <router-link :to="`/${row.name}/${row.wiki.wikiIdentifier}/`">
          {{ row.wiki.title }}
        </router-link>
      </o-table-column>

      <o-table-column label="Description"
                      v-slot="{ row }">
        {{ row.wiki.description }}
      </o-table-column>

      <o-table-column label="Author"
                      v-slot="{ row }">
        {{ row.name }}
      </o-table-column>

      <o-table-column label="Created"
                      v-slot="{ row }">
        <PrettyTime :value="row.created" />
      </o-table-column>

    </o-table>

    <o-modal v-model:active="newWikiShowDialog">
      <div class="card">

        <div class="card-header">
          <div class="card-header-title">
            Create New Wiki
          </div>
        </div>

        <div class="card-content">

          <div v-if="newWikiDocument">

            <o-field grouped>
              <o-field label="Your Name">
                <NameInput />
              </o-field>
              <div style="width: 100%;">
              <o-field label="Wiki Title" expanded>
                <o-input v-model="newWikiDocument.title" expanded
                         @update:model-value="newWikiTitleChanged" />
              </o-field>
              </div>

            </o-field>

            <o-field label="Description">
              <o-input v-model="newWikiDocument.description"
                       type="textarea" />
            </o-field>

            <o-field label="Wiki Identifier"
                     message="Must be unique for your name.  This is used for the URL and as basis for QDN resource identifiers.">
              <o-input v-model="newWikiDocument.wikiIdentifier"
                       :maxlength="wikiIdentifierMaxLength"
                       @update:model-value="newWikiIdentifierSanitize" />
            </o-field>

            <o-field label="Index Page Name" expanded
                     message="This will be the first page shown when someone visits the wiki.  It also is used as basis for URL/identifiers.">
              <o-input v-model="newWikiIndexPage" expanded />
            </o-field>

          </div>

          <div class="card-footer">
            <div class="card-footer-item buttons">
              <o-button variant="primary"
                        @click="newWikiPublish()"
                        icon-left="save"
                        :disabled="newWikiPublishing || !qordialAuthStore.username">
                {{ newWikiPublishing ? "Working, please wait..." : "Publish" }}
              </o-button>
              <o-button @click="newWikiShowDialog = false">
                Cancel
              </o-button>
            </div>
          </div>

        </div>
      </div>
    </o-modal>

  </main>
</template>
