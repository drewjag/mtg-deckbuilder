require('./App.css');

const React = require('react');
const _ = require('lodash');
const { Grid, Row, Col, Button, DropdownButton, MenuItem } = require('react-bootstrap');
const get = require('./utils/get');
const Loader = require('./components/Loader');
const renderSetSelect = require('./components/setSelector');
const Card = require('./components/Card');
const filterCardPool = require('./components/filter');

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

class App extends React.Component {
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
        // remove loading state when we get some data to display
        () => this.setState({ isLoading: false }),
      ));
    }
  }

  setFilteredCards(filter) {
    const { cardPool } = this.state;
    const cards = filterCardPool(filter, cardPool);
    this.setState({ cardsToDisplay: cards });
  }

  getDeck() {
    const { cardsInDeck } = this.state;
    this.setState({ cardsToDisplay: [cardsInDeck] });
  }

  moveCard(card) {
    const { cardsInDeck, cardPool, cardsToDisplay } = this.state;

    if (_.isEqual(cardsInDeck, _.flatten(cardsToDisplay))) {
      // viewing deck list - move card out of the deck and into the card pool
      _.remove(cardsInDeck, cardInPool => cardInPool === card);
      _.each(cardsToDisplay, cardStack => (_.remove(cardStack, cardInPool => cardInPool === card)));
      cardPool.push(card);
    } else {
      // viewing card pool - move card out of the card pool and add it to the deck
      _.remove(cardPool, cardInPool => cardInPool === card);
      _.each(cardsToDisplay, cardStack => (_.remove(cardStack, cardInPool => cardInPool === card)));
      cardsInDeck.push(card);
    }

    this.setState({ cardPool, cardsInDeck, cardsToDisplay });
  }

  sortCardPoolByColor() {
    const { cardPool } = this.state;
    const sortedCardPool = cardFilters.map(filter => filterCardPool(filter, cardPool));
    this.setState({ cardsToDisplay: _.flatten(sortedCardPool) });
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

module.exports = App;
