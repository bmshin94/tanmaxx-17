import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { PacerDevtoolsPanel } from '@tanstack/react-pacer-devtools'
import { FormDevtoolsPanel } from '@tanstack/react-form-devtools'
import { AppShell } from '../components/AppShell'
import { CollectionsDevtoolsPanel } from '../components/devtools/CollectionsDevtoolsPanel'
import { RouteLibsBadge } from '../components/RouteLibsBadge'
import { useMaxxStyle } from '../hooks/use-maxx-style'

import appCss from '../styles.css?url'

// Inline script: reads localStorage and sets data-maxx-tier + key CSS vars BEFORE React hydrates,
// avoiding theme/font flash on reload (the joke lands harder when a fresh load opens in GIGAMAXX).
const MAXX_INIT_SCRIPT = `
(function(){try{
var raw=localStorage.getItem('gainsmax.maxx');if(!raw)return;
var s=JSON.parse(raw);if(typeof s.upper!=='number')return;
var u=s.upper;var tiers=[['deload',0],['volume',20],['hypertrophy',40],['strength',60],['peaking',75],['sendmode',90],['gigamaxx',100],['injury',105]];
var t=tiers[0][0];for(var i=tiers.length-1;i>=0;i--){if(u>=tiers[i][1]){t=tiers[i][0];break;}}
var r=document.documentElement;r.dataset.maxxTier=t;
var h=200,sat=80,l=55;
if(u>=100){h=200+(75-200)*(75/75)+(0-75)*((u-75)/25);if(u>=100){h=300;sat=100;l=60;}}
else if(u>=75){h=200+(0-200)*((u-75)/25)+200;h=u<75?200:(200-(u-75)/25*200);}
r.style.setProperty('--maxx-accent','hsl('+Math.round(h)+' '+sat+'% '+l+'%)');
r.style.setProperty('--maxx-font-scale',u>=100?(1.4+(2.2-1.4)*((u-100)/10)).toFixed(2):(1+(0.4)*(u/100)).toFixed(2));
}catch(e){}})();
`

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'GainsMax' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'preload',
        href: '/fonts/anton.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function MaxxStyleMount() {
  useMaxxStyle()
  return null
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MAXX_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        <MaxxStyleMount />
        <AppShell>{children}</AppShell>
        <RouteLibsBadge />
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            { name: 'TanStack Router', render: <TanStackRouterDevtoolsPanel /> },
            { name: 'TanStack Query', render: <ReactQueryDevtoolsPanel /> },
            { name: 'TanStack DB', render: <CollectionsDevtoolsPanel /> },
            { name: 'TanStack Pacer', render: <PacerDevtoolsPanel /> },
            { name: 'TanStack Form', render: <FormDevtoolsPanel /> },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
