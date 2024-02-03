
import { useWikiStore } from './stores/wiki'

export const QwikiPlugin = {

    install(app, options) {
        app.config.globalProperties.$qwiki = {

            clearWiki() {
                const wikiStore = useWikiStore()
                wikiStore.setAuthorName(null)
                wikiStore.setWikiIdentifier(null)
                wikiStore.setWikiRoot(null)
                wikiStore.setWikiMap(null)
            },

            clearPage() {
                const wikiStore = useWikiStore()
                wikiStore.setPageIdentifier(null)
                wikiStore.setPageIsListed(false)
                wikiStore.setPageExists(false)
                wikiStore.setPageContent(null)
            },

            async setWiki($qordial, authorName, wikiIdentifier) {
                const wikiStore = useWikiStore()

                if (!authorName && !wikiIdentifier) {

                    // both were null, so clear ours if needed
                    if (wikiStore.authorName || wikiStore.wikiIdentifier) {
                        this.clearWiki()
                    }

                } else if (authorName && wikiIdentifier) {

                    // both had values, so compare to what we already have
                    if (authorName != wikiStore.authorName
                        || wikiIdentifier != wikiStore.wikiIdentifier) {

                        // must refresh the loaded wiki data
                        wikiStore.setAuthorName(authorName)
                        wikiStore.setWikiIdentifier(wikiIdentifier)

                        wikiStore.setWikiRoot(await $qordial.fetchResourceObject({
                            service: 'DOCUMENT',
                            name: authorName,
                            identifier: `qwiki_root_${wikiIdentifier}`,
                        }))

                        wikiStore.setWikiMap(await $qordial.fetchResourceObject({
                            service: 'DOCUMENT',
                            name: authorName,
                            identifier: `qwiki_map_${wikiIdentifier}`,
                        }))
                    }

                } else {
                    throw new Error("must pass *both* or *neither* of args: name, wikiIdentifier")
                }
            },

            async setPage($qordial, pageIdentifier) {
                const wikiStore = useWikiStore()

                if (!pageIdentifier) {

                    // null, so clear ours if needed
                    if (wikiStore.pageIdentifier) {
                        this.clearPage()
                    }

                } else {

                    // value given, so compare to what we already had
                    if (pageIdentifier != wikiStore.pageIdentifier) {

                        // must refresh the loaded page data
                        wikiStore.setPageIdentifier(pageIdentifier)

                        let isListed = true
                        if (wikiStore.wikiMap?.pages?.[pageIdentifier] === undefined) {
                            isListed = false
                        }
                        wikiStore.setPageIsListed(isListed)

                        let text = null
                        let exists = true
                        try {
                            text = await $qordial.fetchResourceText({
                                service: 'DOCUMENT',
                                name: wikiStore.authorName,
                                identifier: `qwiki_page_${wikiStore.wikiIdentifier}_${pageIdentifier}`,
                            })
                        } catch (error) {
                            if (error?.message == "404 not found") {
                                // nb. ignore 404 not found
                                exists = false
                            } else {
                                throw error
                            }
                        }
                        wikiStore.setPageExists(exists)
                        wikiStore.setPageContent(text)
                    }
                }
            },
        }
    },
}
