import { resolveRoute } from 'vike/routing';
import { isCmsView } from '../../src/utils.js';

export default isCmsView
  ? (pageContext) => resolveRoute('/@adventureName', pageContext.urlPathname)
  : "/"