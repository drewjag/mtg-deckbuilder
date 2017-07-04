import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col } from 'react-bootstrap';

class Card extends Component {
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

export default Card;
