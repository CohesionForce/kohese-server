/**
 * Created by josh on 8/28/15.
 *
 * Webpack dependency file
 */
export default() => {
    require('./tabService')();
    require('./lb-services')();
    require('./itemRepository')();
}