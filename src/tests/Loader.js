const test = require('tape');
const React = require('react');
const { shallow } = require('enzyme');
const Loader = require('../components/Loader');

test('<Loader />', assert => {
  const wrapper = shallow(<Loader />);

  assert.ok(
    wrapper.is('div'),
    'Loader should render a div',
  );

  assert.ok(
    wrapper.hasClass('loader'),
    'Loader should render a div with the class name "loader"',
  );

  assert.ok(
    wrapper.children().length === 5,
    'Loader should render 5 children',
  );

  assert.ok(
    wrapper.children().everyWhere(node => node.hasClass('dot')),
    'Loader should render children with the class name "dot"',
  );

  assert.end();
});
