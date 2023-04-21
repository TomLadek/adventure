import { resolveRoute } from 'vite-plugin-ssr/routing';
import { isCmsView } from '../../src/utils.js';

export default isCmsView
  ? (pageContext) => resolveRoute('/@adventureName', pageContext.urlPathname)
  : "/"