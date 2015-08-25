/**
 * Created by josh on 8/25/15.
 */

function ExplorePage() {
    var page = this;

    this.addTabButton = element(by.id('add-tab-button'));
    this.tabs = element.all(by.repeater('tab in containerCtrl.tabs'));

    this.get = function (itemId) {
        var route = '/#/explore';
        if (itemId) {
            route = router + '/' + itemId;
        }

        browser.get(route);
    }
}

describe('Explore page', function(){
    var page = new ExplorePage();
    beforeEach(function(){
        page.get();
    });

    describe('tabs', function(){

        it('should create a new tab when add is clicked', function(){

        });
    })

});
