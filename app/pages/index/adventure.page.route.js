import { resolveRoute } from 'vite-plugin-ssr/routing'

export default (pageContext) => {
    return resolveRoute('/@adventureName', pageContext.urlPathname)
}