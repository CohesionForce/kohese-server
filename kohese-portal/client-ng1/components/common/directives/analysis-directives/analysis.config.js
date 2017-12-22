/*
*   Webpack configuration file for analysis directives
*/

export default ()=> {
  require('./phrase-view')();
  require('./sentence-view')();
  require('./term-view')();
}