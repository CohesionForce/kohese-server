/**
 * Created by josh on 8/28/15.
 *
 * Webpack depdendency file.
 */


export default() => {
    require('./resizeable')();
    require('./resizeableField')();
    require('./resizer')();
    require('./navDirectives/navDirectives')();
    require('./knowledgeTree/treeRow')();
}