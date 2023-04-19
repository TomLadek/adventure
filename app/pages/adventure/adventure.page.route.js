import { resolveRoute } from 'vite-plugin-ssr/routing';
import { isCmsView } from '../../utils/utils.js';

export default isCmsView
  ? (pageContext) => resolveRoute('/@adventureName', pageContext.urlPathname)
  : "/"