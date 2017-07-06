const React = require('react');

const renderSetOptions = sets => (
  sets.map(
    set => (<option key={set.code} value={set.code}>{set.name}</option>),
  )
);

const renderSetSelect = (sets, onChangeFunc) => (
  <select className="form-control" onChange={onChangeFunc}>
    <option>Choose a set</option>
    {renderSetOptions(sets)}
  </select>
);

module.exports = renderSetSelect;
