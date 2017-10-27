/**
 * Created by josh on 8/28/15.
 *
 * Webpack depdendency file.
 */


export default () => {
    require('./resizeableField')();
    require('./navDirectives/navDirectives')();
    require('./knowledgeTree/treeRow')();
    require('./actionTable/actionTable')();
}