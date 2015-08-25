/**
 * Created by josh on 8/25/15.
 */
function IndexPage() {

    this.get = function () {
        browser.get('/');
    };

    this.getTitle = function () {
        return browser.getTitle();
    };

    this.addTabButton = element(by.id('add-tab-button'));

    this.tabs = element.all(by.repeater('tab in containerCtrl.tabs'));

    this.removeSecondTab = function(){
        this.tabs.get(1).element(by.css('.glyphicon-remove')).click();
    };

    this.addTab = function () {
        this.addTabButton.click();
    };

}

module.exports = IndexPage;