/**
 * Created by josh on 8/25/15.
 */
function ExplorePage() {
    var page = this;

    this.addTabButton = element(by.id('add-tab-button'));
    this.tabs = element.all(by.repeater('tab in containerCtrl.tabs'));

    this.addTab = function(){
        this.addTabButton.click();
    };

    this.get = function (itemId) {
        var route = '/#/explore';
        if (itemId) {
            route = router + '/' + itemId;
        }

        browser.get(route);
    }
}

module.exports = ExplorePage;