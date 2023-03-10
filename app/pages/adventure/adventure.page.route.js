import { resolveRoute } from 'vite-plugin-ssr/routing'

export default process.env.NODE_ENV === 'production'
  ? "/"
  : (pageContext) => {
    return resolveRoute('/@adventureName', pageContext.urlPathname)
  }