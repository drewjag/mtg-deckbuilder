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
const cardFilters = [
  'White',
  'Blue',
  'Black',
  'Red',
  'Green',
  'Multicolored',
  'Colorless',
  'Land',
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
    this.filterCardPool = this.filterCardPool.bind(this);
    this.setFilteredCards = this.setFilteredCards.bind(this);
    this.sortCardPoolByColor = this.sortCardPoolByColor.bind(this);
    this.moveCard = this.moveCard.bind(this);
    this.getDeck = this.getDeck.bind(this);
  }

  componentDidMount() {
    get('https://api.magicthegathering.io/v1/sets?type=expansion')
    .then(JSON.parse)
    // The api typically returns fast enough that you wouldn't see the Loader component.
    // I added a timeout to allow the Loader to be visible so you know it is there.
    .then(response => setTimeout(() => this.setState({
      isLoading: false,
      sets: _.reverse(response.sets),
    }), 2000));
  }

  setMtgSet(event) {
    this.setState({ selectedSet: event.target.value });
  }

  getSealedCardPool() {
    this.setState({ isLoading: true });
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
      )
      .then(
        () => this.setState({ isLoading: false }),
      ));
    }
  }

  setFilteredCards(filter) {
    const cards = this.filterCardPool(filter);
    this.setState({ cardsToDisplay: cards });
  }

  getDeck() {
    const { cardsInDeck } = this.state;
    this.setState({ cardsToDisplay: [cardsInDeck] });
  }

  moveCard(card) {
    const { cardsInDeck, cardPool, cardsToDisplay } = this.state;
    if (_.isEqual(cardsInDeck, _.flatten(cardsToDisplay))) {
      _.remove(cardsInDeck, cardInPool => cardInPool === card);
      _.each(cardsToDisplay, cardStack => (_.remove(cardStack, cardInPool => cardInPool === card)));
      cardPool.push(card);
    } else {
      _.remove(cardPool, cardInPool => cardInPool === card);
      _.each(cardsToDisplay, cardStack => (_.remove(cardStack, cardInPool => cardInPool === card)));
      cardsInDeck.push(card);
    }

    this.setState({ cardPool, cardsInDeck, cardsToDisplay });
  }

  sortCardPoolByColor() {
    const sortedCardPool = cardFilters.map(filter => this.filterCardPool(filter));
    this.setState({ cardsToDisplay: _.flatten(sortedCardPool) });
  }

  filterCardPool(filter) {
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

  renderCard(cardProps, index) {
    return (
      <Card card={cardProps} key={index} onClick={() => this.moveCard(cardProps)} />
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
              <Col xs={12} sm={4} md={4} lg={4}>
                <div className="mtgLogo" />
              </Col>
              <Col xs={12} sm={12} md={12} lg={12}>
                <h1>Sealed Deck Builder</h1>
              </Col>
              <Col xs={12} sm={8} md={8} lg={8}>
                <h4>Instructions:</h4>
                <p>
                  Here you can build a sealed deck out of a pool of cards to
                  play Magic: The Gathering. You can read more about the sealed
                  deck format <a href="http://magic.wizards.com/en/game-info/gameplay/formats/sealed-deck">here</a>.
                </p>
                <p>
                  To begin, select a card set from the drop down menu.
                  To learn more about sets, visit <a href="http://magic.wizards.com/en/products/card-set-archive">this site</a>.
                </p>
                <p>
                  Next, generate your card pool by clicking Open Booster Packs.
                  This will generate all of the cards you can use to build a deck.
                  40 cards are needed to make a deck and you will typically choose
                  about 23 from the card pool to go into that deck. The rest will be
                  made up of basic lands.
                </p>
                <p>Happy battling!</p>
                <p>This app is built using the <a href="https://docs.magicthegathering.io/#overview">MTG API</a></p>
              </Col>
            </Row>
            <Row>
              <Col xs={12} sm={4} md={4} lg={4}>
                {renderSetSelect(sets, this.setMtgSet)}
              </Col>
              <Col xs={12} sm={4} md={4} lg={4}>
                <Button block onClick={this.getSealedCardPool}>Open Booster Packs</Button>
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
            <Col xs={12} sm={8} md={8} lg={8}>
              <p>
                Add cards to your deck by clicking on them while viewing your card pool.<br />
                To view your deck, click the View Deck button.<br />
                To remove a card, simply click it in the deck view.
              </p>
              <p>
                Remember: 40 cards are needed to make a deck and you will typically choose
                about 23 from the card pool to go into that deck. The rest will be
                made up of basic lands.
              </p>
            </Col>
          </Row>
          <Row>
            <Button onClick={this.sortCardPoolByColor}>Show &amp; Organize Card Pool</Button>
            <DropdownButton
              id="colorFilter"
              title="Filter Card Pool"
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
            <Button className="viewDeckButton" onClick={this.getDeck}>View Deck</Button>
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
