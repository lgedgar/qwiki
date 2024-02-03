import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'

import { library } from "@fortawesome/fontawesome-svg-core"
import { fas } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"

import VMdEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
import '@kangc/v-md-editor/lib/theme/style/vuepress.css'
import Prism from 'prismjs'
import 'prismjs/components/prism-json'

import App from './App.vue'
import router from './router'
import { QordialPlugin } from 'qordial'
import { QwikiPlugin } from './plugin'

library.add(fas)

VMdEditor.use(vuepressTheme, {
  Prism,
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

app.mount('#app')
