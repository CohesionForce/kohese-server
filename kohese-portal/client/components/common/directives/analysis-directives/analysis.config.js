/*
*   Webpack configuration file for analysis directives
*/

export default ()=> {
    require('./chunk-view')();
    require('./sentence-view')();
    require('./term-view')();
}