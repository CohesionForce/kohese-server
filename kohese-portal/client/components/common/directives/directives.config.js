/**
 * Created by josh on 8/28/15.
 *
 * Webpack depdendency file.
 */


export default() => {
    require('./resizeable')();
    require('./resizer')();
    require('./navDirectives/navDirectives')();
}