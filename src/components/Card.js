const React = require('react');
const PropTypes = require('prop-types');

class Card extends React.Component {
  render() {
    const { card, onClick } = this.props;
    return (
      <div className="card" onClick={onClick} role="button" tabIndex={0}>
        <img src={card.imageUrl} alt={card.name} />
      </div>
    );
  }
}

Card.defaultProps = {
  card: {},
  onClick: () => {},
};

Card.propTypes = {
  card: PropTypes.object,
  onClick: PropTypes.func,
};

module.exports = Card;
