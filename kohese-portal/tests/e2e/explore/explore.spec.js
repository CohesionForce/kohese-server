/**
 * Created by josh on 8/25/15.
 */

var ExplorePage = require('./ExplorePage')

describe('Explore page', function(){
    var page = new ExplorePage();
    beforeEach(function(){
        page.get();
    });

    describe('tabs', function(){

        it('should create a new tab when add is clicked', function(){
            page.addTab();

            page.tabs.then(function(result) {
                expect(result.length).toEqual(2)
            });
        });
    })

});
