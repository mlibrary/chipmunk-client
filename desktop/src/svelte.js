import App from './App.svelte'
import 'foundation-sites/dist/css/foundation.css'
import 'datatables.net-zf/css/dataTables.foundation.css'
import jQuery from 'jquery'
import Foundation from 'foundation-sites'

window.jQuery = jQuery
window.$ = jQuery

import DataTables from 'datatables.net'
import 'datatables.net-scroller'
DataTables(window, jQuery)

const app = new App({
  target: document.querySelector('#app-shell')
})

export default app
