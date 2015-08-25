/**
 * Created by josh on 8/25/15.
 */

function IndexPage(){

    this.get = function(){
        browser.get('/');
    };

    this.getTitle = function(){
        return browser.getTitle();
    }
}

describe("index", function () {

    var page = new IndexPage();

    it("should display the correct title", function () {
        // in the video, I used the protractor.getInstance() which was removed shortly thereafter in favor of this browser approach
        page.get();
        expect(page.getTitle()).toBe('Kohese Portal');
    });
});