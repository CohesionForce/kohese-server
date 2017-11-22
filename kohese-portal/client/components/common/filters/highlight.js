

function HighlightRegex () {
  return function (text, phrase, html5) {
    // TO-DO add additional branch for nested tags
    if (text && angular.isDefined(phrase)) {
      if (phrase) {
        text = text.replace(phrase,
          '<span class="highlighted">$1</span>');
      }
    }
    return text;
  };
}

function Highlight () {
  return function (text, phrase) {
    if (text && angular.isDefined(phrase) && phrase !== '') {
      let cleanedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (cleanedPhrase) {
        text = text.replace(new RegExp('(' + cleanedPhrase + ')', 'gi'),
          '<span class="highlighted">$1</span>');
      }
    }
    return text;
  }
}

export default () => {
  angular.module('app.filters.highlight', [])
    .filter('highlightRegex', HighlightRegex)
    .filter('highlight', Highlight);
};