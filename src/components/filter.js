const _ = require('lodash');

const filterCardPool = (filter, cardPool) => {
  let filteredCards = [];

  switch (filter) {
    case 'Multicolored':
      filteredCards = _.filter(cardPool, card =>
        _.isArray(card.colors)
        && card.colors.length > 1,
      );
      break;
    case 'Colorless':
      filteredCards = _.filter(cardPool, card =>
        !_.isArray(card.colors)
        && _.isArray(card.types)
        && _.indexOf(card.types, 'Land') === -1,
      );
      break;
    case 'Land':
      filteredCards = _.filter(cardPool, card =>
        _.isArray(card.types)
        && _.indexOf(card.types, 'Land') !== -1,
      );
      break;
    default:
      filteredCards = _.filter(cardPool, card =>
        _.isArray(card.colors)
        && card.colors.length === 1
        && _.indexOf(card.colors, filter) !== -1,
      );
      break;
  }

  return [filteredCards];
};

module.exports = filterCardPool;
