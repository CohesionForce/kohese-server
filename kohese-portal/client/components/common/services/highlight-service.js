function HighlightService () {
  const service = this;

  service.highlight = highlight;

  function highlight (text, phrase) {
    if (text && angular.isDefined(phrase)) {
      if (phrase) {
        text = text.replace(phrase,
          '<span class="highlighted">$1</span>');
      }
    }
  }
}

export default () => {
  angular.module('app.services.highlightservice', [])
    .service('HighlightService', HighlightService)
}