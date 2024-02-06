import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'

import { library } from "@fortawesome/fontawesome-svg-core"
import { fas } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"

import VMdEditor from '@kangc/v-md-editor'
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import '@kangc/v-md-editor/lib/style/preview.css'
import enUS from '@kangc/v-md-editor/lib/lang/en-US'
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
import '@kangc/v-md-editor/lib/theme/style/vuepress.css'
import Prism from 'prismjs'
import 'prismjs/components/prism-json'
import mdplugin from './mdplugin'

import App from './App.vue'
import router from './router'
import { QordialPlugin } from 'qordial'
import { QwikiPlugin } from './plugin'

library.add(fas)

VMdEditor.lang.use('en-US', enUS)
VMdEditor.use(vuepressTheme, {
    Prism,
    extend(md) {
        md.use(mdplugin)
    },
})
VMdPreview.use(vuepressTheme, {
    Prism,
    extend(md) {
        md.use(mdplugin)
    },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('VueFontawesome', FontAwesomeIcon)
app.use(Oruga, {
    ...bulmaConfig,
    iconComponent: 'vue-fontawesome',
    iconPack: 'fas',
})
app.use(QordialPlugin)
app.use(QwikiPlugin)
app.use(VMdEditor)
app.use(VMdPreview)

app.mount('#app')
