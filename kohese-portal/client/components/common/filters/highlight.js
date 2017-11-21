

function Highlight () {
  return function (text, phrase) {
    if (text && angular.isDefined(phrase)) {
      if (phrase) {
        console.log('Highlight')
        console.log(phrase);
        console.log(text);
        text = text.replace(phrase,
          '<span class="highlighted">$1</span>');
      }
    }
    return text;
  }
}

export default () => {
  angular.module('app.filters.highlight', [])
    .filter('highlightRegex', Highlight)
}