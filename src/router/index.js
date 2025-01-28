import { createRouter, createWebHashHistory } from 'vue-router'
import routerMap from './routerMap'

const Router = createRouter({
  history: createWebHashHistory(),
  routes: routerMap,
})

export default Router
"invalid args `options` for command `create_webview_window`: unknown field `_vts`, expected one of `label`, `create`, `url`, `user-agent`, `userAgent`, `drag-drop-enabled`, `dragDropEnabled`, `center`, `x`, `y`, `width`, `height`, `min-width`, `minWidth`, `min-height`, `minHeight`, `max-width`, `maxWidth`, `max-height`, `maxHeight`, `resizable`, `maximizable`, `minimizable`, `closable`, `title`, `fullscreen`, `focus`, `transparent`, `maximized`, `visible`, `decorations`, `always-on-bottom`, `alwaysOnBottom`, `always-on-top`, `alwaysOnTop`, `visible-on-all-workspaces`, `visibleOnAllWorkspaces`, `content-protected`, `contentProtected`, `skip-taskbar`, `skipTaskbar`, `windowClassname`, `theme`, `title-bar-style`, `titleBarStyle`, `hidden-title`, `hiddenTitle`, `accept-first-mouse`, `acceptFirstMouse`, `tabbing-identifier`, `tabbingIdentifier`, `additional-browser-args`, `additionalBrowserArgs`, `shadow`, `window-effects`, `windowEffects`, `incognito`, `parent`, `proxy-url`, `proxyUrl`, `zoom-hotkeys-enabled`, `zoomHotkeysEnabled`, `browser-extensions-enabled`, `browserExtensionsEnabled`, `use-https-scheme`, `useHttpsScheme`, `devtools`, `background-color`, `backgroundColor`"