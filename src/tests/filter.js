const test = require('tape');
const _ = require('lodash');
const filterCardPool = require('../components/filter');

test('filterCardPool', assert => {
  const mockMulticoloredCard = {
    name: 'multicolored',
    colors: ['Red', 'Green'],
  };
  const mockColorlessCard = {
    name: 'colorless',
    types: ['Artifact'],
  };
  const mockLandCard = {
    name: 'colorless',
    types: ['Land'],
  };
  const mockMonoColoredCard = {
    name: 'monocolored',
    colors: ['Red'],
  };
  const mockCardPool = [
    mockMulticoloredCard,
    mockColorlessCard,
    mockLandCard,
    mockMonoColoredCard,
  ];

  const filteredMulticoloredCard = filterCardPool('Multicolored', mockCardPool);
  const filteredMockColorlessCard = filterCardPool('Colorless', mockCardPool);
  const filteredMockLandCard = filterCardPool('Land', mockCardPool);
  const filteredmockMonoColoredCard = filterCardPool('Red', mockCardPool);

  assert.ok(
    _.isEqual(filteredMulticoloredCard, [[mockMulticoloredCard]]),
    'filterCardPool should return mockMulticoloredCard',
  );

  assert.ok(
    _.isEqual(filteredMockColorlessCard, [[mockColorlessCard]]),
    'filterCardPool should return mockColorlessCard',
  );

  assert.ok(
    _.isEqual(filteredMockLandCard, [[mockLandCard]]),
    'filterCardPool should return mockLandCard',
  );

  assert.ok(
    _.isEqual(filteredmockMonoColoredCard, [[mockMonoColoredCard]]),
    'filterCardPool should return mockMonoColoredCard',
  );

  assert.end();
});
