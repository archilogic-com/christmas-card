module.exports = (function() {
  var loading = true,
      messageIndex = 0,
      messages = [
        'Making hot chocolate...',
        'Baking cookies...',
        'Singing Christmas carols...',
        'Lighting candles...',
        'Scaring away grinches...',
        'Decorating Christmas tree..'
      ],
      container;

  this.start = function(elem) {
    container = elem;
    setTimeout(function showLoadingMessage() {
      if(loading && container) container.textContent = messages[messageIndex++];

      if(messageIndex == messages.length) messageIndex = 0;
      if(loading) setTimeout(showLoadingMessage, 5000);
    }, 5000);
  }

  this.stop = function() {
    loading = false;
    container.parentNode.removeChild(container);
  }

  return this;
})();
