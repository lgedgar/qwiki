import { defineStore } from 'pinia'

export const useWikiStore = defineStore('wiki', {

    state: () => {
        return {
            authorName: null,
            wikiIdentifier: null,
            wikiRoot: null,
            wikiMap: null,
            pageIdentifier: null,
            pageIsListed: false,
            pageExists: false,
            pageContent: null,
        }
    },

    actions: {

        setAuthorName(name) {
            this.authorName = name
        },

        setWikiIdentifier(wikiIdentifier) {
            this.wikiIdentifier = wikiIdentifier
        },

        setWikiRoot(wikiRoot) {
            this.wikiRoot = wikiRoot
        },

        setWikiMap(wikiMap) {
            this.wikiMap = wikiMap
        },

        setPageIdentifier(pageIdentifier) {
            this.pageIdentifier = pageIdentifier
        },

        setPageIsListed(pageIsListed) {
            this.pageIsListed = pageIsListed
        },

        setPageExists(pageExists) {
            this.pageExists = pageExists
        },

        setPageContent(pageContent) {
            this.pageContent = pageContent
        },
    },
})
