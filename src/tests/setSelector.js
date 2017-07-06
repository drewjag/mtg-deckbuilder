const test = require('tape');
const { shallow } = require('enzyme');
const renderSetSelect = require('../components/setSelector');

test('renderSetSelect', assert => {
  const mockSetName = 'setName';
  const mockSetCode = 'AAA';
  const mockSets = [{ name: mockSetName, code: mockSetCode }];
  const mockOnChangeFunc = () => {};

  const setSelector = shallow(renderSetSelect(mockSets, mockOnChangeFunc));

  assert.ok(
    setSelector.is('select'),
    'renderSetSelect should render a select',
  );

  assert.ok(
    setSelector.children().everyWhere(node => node.is('option')),
    'renderSetSelect should render options',
  );

  assert.ok(
    setSelector.children().length === mockSets.length + 1,
    'renderSetSelect should render options for each set +1',
  );

  assert.ok(
    setSelector.childAt(1).prop('value') === mockSetCode,
    'renderSetSelect should render options with the set code as the value',
  );

  assert.end();
});
