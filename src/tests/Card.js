const test = require('tape');
const React = require('react');
const { shallow } = require('enzyme');
const Card = require('../components/Card');

test('renders without crashing', assert => {
  const wrapper = shallow(<Card card={{ name: 'something', imageUrl: '' }} onClick={() => {}} />);

  assert.ok(
    wrapper.is('div'),
    'Card should render a div',
  );

  assert.ok(
    wrapper.find('img'),
    'Card should render an img',
  );

  assert.end();
});
