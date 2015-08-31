/**
 * Created by josh on 8/25/15.
 */

var IndexPage = require('./IndexPage')

describe("index", function () {

    var page = new IndexPage();

    it("should display the correct title", function () {
        page.get();
        expect(page.getTitle()).toBe('Kohese Portal');
    });

    describe('tabs', function () {

        beforeEach(function(){
            page.get();
        });

        it('should create a new tab when add is clicked', function () {
            page.addTab();

            page.tabs.then(function (result) {
                expect(result.length).toEqual(2)
            });
        });

        it('should delete a tab when remove is clicked', function(){
            page.addTab();
            page.removeSecondTab();
            page.tabs.then(function (result) {
                expect(result.length).toEqual(1)
            });
        })
    });
});