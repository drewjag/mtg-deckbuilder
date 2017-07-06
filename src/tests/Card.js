const test = require('tape');
const React = require('react');
const { shallow } = require('enzyme');
const Card = require('../components/Card');

test('<Card />', assert => {
  const mockCardName = 'something';
  const mockImageUrl = 'arbitraryUrl.jpg';

  const wrapper = shallow(
    <Card
      card={{ name: mockCardName, imageUrl: mockImageUrl }}
      onClick={() => {}}
    />);

  const cardImg = wrapper.find('img');

  assert.ok(
    wrapper.is('div'),
    'Card should render a div',
  );

  assert.ok(
    wrapper.hasClass('card'),
    'Card should render a div with the class name "card"',
  );

  assert.ok(
    cardImg,
    'Card should render an img',
  );

  assert.ok(
    cardImg.prop('src') === mockImageUrl,
    'Card should pass imageUrl to img src attribute',
  );

  assert.ok(
    cardImg.prop('alt') === mockCardName,
    'Card should pass name to img alt attribute',
  );

  assert.end();
});
