import React, { Component } from 'react';
import _ from 'lodash';
import { Grid, Row, Col, Button, DropdownButton, MenuItem } from 'react-bootstrap';

import './App.css';

import get from './utils/get';
import Loader from './components/Loader';
import Card from './components/Card';

// set a constant for the number of booster packs to fetch
const numBoosters = 6;

// set a constant array of standard filters
const cardFilters = ['White', 'Blue', 'Black', 'Red', 'Green', 'Multicolored', 'Colorless', 'Land',
];

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

class App extends Component {
  constructor() {
    super();

    // set initial state
    this.state = {
      isLoading: true,
      sets: [],
      cardPool: [],
      sortedCards: [],
      cardsInDeck: [],
      cardsToDisplay: [],
      selectedSet: '',
    };

    // bind callbacks
    this.setMtgSet = this.setMtgSet.bind(this);
    this.getSealedCardPool = this.getSealedCardPool.bind(this);
    this.renderCard = this.renderCard.bind(this);
    this.renderCardStack = this.renderCardStack.bind(this);
    this.filterCardPoolByColor = this.filterCardPoolByColor.bind(this);
    this.setFilteredCards = this.setFilteredCards.bind(this);
    this.sortCardPoolByColor = this.sortCardPoolByColor.bind(this);

    this.addCardToDeck = this.addCardToDeck.bind(this);
  }

  componentDidMount() {
    get('https://api.magicthegathering.io/v1/sets?type=expansion')
    .then(JSON.parse)
    .then(response => this.setState({
      isLoading: false,
      sets: _.reverse(response.sets),
    }));
  }

  setMtgSet(event) {
    this.setState({ selectedSet: event.target.value });
  }

  getSealedCardPool() {
    // this.setState({ isLoading: true });
    const { selectedSet } = this.state;
    let { cardPool } = this.state;
    const getBoosterURL = `https://api.magicthegathering.io/v1/sets/${selectedSet}/booster`;

    if (!_.isEmpty(selectedSet)) {
      _.times(numBoosters, () => get(getBoosterURL)
      .then(JSON.parse)
      .then(
        (response) => {
          cardPool = _.concat(cardPool, response.cards);
          this.setState({ cardPool, cardsToDisplay: [cardPool] });
        },
      ));
    }
  }

  setFilteredCards(filter) {
    const cards = this.filterCardPoolByColor(filter);
    this.setState({ cardsToDisplay: cards });
  }

  filterCardPoolByColor(filter) {
    const { cardPool } = this.state;
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
  }

  sortCardPoolByColor() {
    const sortedCardPool = cardFilters.map(filter => this.filterCardPoolByColor(filter));
    this.setState({ cardsToDisplay: _.flatten(sortedCardPool) });
  }

  addCardToDeck(card) {
    const { cardsInDeck, cardPool, cardsToDisplay } = this.state;
    _.remove(cardPool, cardInPool => cardInPool === card);
    _.each(cardsToDisplay, cardStack => (_.remove(cardStack, cardInPool => cardInPool === card)));
    cardsInDeck.push(card);

    this.setState({ cardPool, cardsInDeck, cardsToDisplay });
  }

  renderCard(cardProps, index) {
    return (
      <Card card={cardProps} key={index} onClick={() => this.addCardToDeck(cardProps)} />
    );
  }

  renderCardStack(cards) {
    return cards.map((card, index) => this.renderCard(card, index));
  }

  render() {
    const { isLoading, sets, cardPool, cardsToDisplay } = this.state;

    if (isLoading) {
      return (
        <Grid>
          <Row>
            <Col xs={12} sm={12} md={12} lg={12}>
              <Loader />
            </Col>
          </Row>
        </Grid>
      );
    } else if (_.isEmpty(cardPool)) {
      return (
        <div className="app">
          <Grid>
            <Row>
              <Col xs={12} sm={12} md={12} lg={12}>
                <h1>Sealed Deck Builder</h1>
              </Col>
            </Row>
            <Row>
              <Col xs={4} sm={4} md={4} lg={4}>
                {renderSetSelect(sets, this.setMtgSet)}
              </Col>
              <Col xs={4} sm={4} md={4} lg={4}>
                <Button onClick={this.getSealedCardPool}>Open Booster Packs</Button>
              </Col>
            </Row>
          </Grid>
        </div>
      );
    }

    return (
      <div className="app">
        <Grid>
          <Row>
            <Col xs={12} sm={12} md={12} lg={12}>
              <h1>Sealed Deck Builder</h1>
            </Col>
          </Row>
          <Row>
            <Button onClick={this.sortCardPoolByColor}>Organize Cards</Button>
            <DropdownButton
              id="colorFilter"
              title="Filter by Color"
              onSelect={this.setFilteredCards}
            >
              <MenuItem eventKey="White">White</MenuItem>
              <MenuItem eventKey="Blue">Blue</MenuItem>
              <MenuItem eventKey="Black">Black</MenuItem>
              <MenuItem eventKey="Red">Red</MenuItem>
              <MenuItem eventKey="Green">Green</MenuItem>
              <MenuItem eventKey="Multicolored">Multicolored</MenuItem>
              <MenuItem eventKey="Colorless">Colorless</MenuItem>
              <MenuItem eventKey="Land">Land</MenuItem>
            </DropdownButton>
          </Row>
          <Row>
            <div className="cardStack">
              { cardsToDisplay.map(this.renderCardStack) }
            </div>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default App;
