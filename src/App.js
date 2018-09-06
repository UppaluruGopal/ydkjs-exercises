import React, { Component } from 'react';
import styled from 'styled-components';
import './App.css';
import BookRouter from './components/BookRouter';
import Home from './components/Home';
import Sidebar from './components/Sidebar';
import books from './data';
import Header from './components/Header';
import Footer from './components/Footer';
import NoMatch from './components/NoMatch';
import ResetModal from './components/ResetModal';
import { Switch, Route } from 'react-router-dom';
import { mergeScores } from './helpers/helpers';

import { ScoreContext, score } from './score-context';

const AppGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: minmax(15vh, min-content) 1fr minmax(15vh, min-content);
  grid-template-areas:
    'sidebar header'
    'sidebar main'
    'sidebar footer';
  grid-row-gap: 0.5rem;
  height: 100%;
  overflow-x: hidden;
  overflow-y: ${props =>
    props.shouldShowSidebar && props.isNarrowScreen ? 'hidden' : 'scroll'};
  z-index: 0;

  &:before {
    content: '';
    display: 'block';
    background-color: rgba(0, 0, 0, 0.5);
    height: 100%;
    opacity: ${props =>
      props.shouldShowSidebar && props.isNarrowScreen ? 1 : 0};
    position: absolute;
    width: 100%;
    transition: var(--easing-standard);
    z-index: ${props =>
      props.shouldShowSidebar && props.isNarrowScreen ? 10 : -1};
  }
`;

const MainContentGridChild = styled.div`
  position: relative;
  display: block;
  grid-area: main;
  place-self: start stretch;
  text-align: center;
  transition: var(--easing-standard);
  width: 100%;
`;

class App extends Component {
  constructor() {
    super();

    const isNarrowScreen = window.innerHeight > window.innerWidth;
    const shouldShowSidebar = !isNarrowScreen;
    // updateScore needs to be defined here, not in score-context.js
    // because it needs to setState
    this.updateScore = newScore => {
      window.localStorage.setItem('score', JSON.stringify(newScore));
      this.setState({ score: newScore });
    };
    this.handleResize = this.handleResize.bind(this);
    this.handleShowReset = this.handleShowReset.bind(this);

    this.state = {
      score,
      shouldShowSidebar,
      isNarrowScreen,
      showInstallBtn: false,
      showReset: false,
    };
  }
  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    let lsScore = window.localStorage.getItem('score');
    let score = this.state.score;
    if (lsScore) {
      lsScore = JSON.parse(lsScore);
      score = mergeScores({
        lsScore,
        newScore: this.state.score,
      });
    }
    this.setState({ score });
  }

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.handleResize);
  };

  handleClick(e) {
    const name = e.target.dataset.name;
    const { isNarrowScreen, shouldShowSidebar } = this.state;
    if (isNarrowScreen && shouldShowSidebar && name === 'App') {
      this.handleSidebarToggle();
    }
  }

  handleResize() {
    this.setState({
      isNarrowScreen: window.innerHeight > window.innerWidth,
    });
  }

  handleSidebarToggle(event) {
    const { shouldShowSidebar } = this.state;
    this.setState({
      shouldShowSidebar: !shouldShowSidebar,
    });
  }

  handleShowReset() {
    const showReset = this.state.showReset;
    this.setState({
      showReset: !showReset,
    });
  }

  render() {
    return (
      <ScoreContext.Provider
        value={{ score: this.state.score, updateScore: this.updateScore }}
      >
        <AppGrid
          data-name="App"
          isNarrowScreen={this.state.isNarrowScreen}
          shouldShowSidebar={this.state.shouldShowSidebar}
          onClick={e => this.handleClick(e)}
        >
          <ResetModal
            showReset={this.state.showReset}
            handleShowReset={this.handleShowReset}
          />
          <Sidebar
            data-name="Sidebar"
            books={books}
            score={this.state.score}
            updateScore={this.updateScore}
            isNarrowScreen={this.state.isNarrowScreen}
            shouldShow={this.state.shouldShowSidebar}
            onMenuClick={e => this.handleSidebarToggle(e)}
            ref={this.sidebarRef}
          />
          <Header />
          <MainContentGridChild
            data-name="Main"
            onClick={e => this.handleClick(e)}
          >
            <Switch>
              <Route exact path="/" render={() => <Home books={books} />} />
              {books.map((book, index) => {
                book.id = index;
                return (
                  <Route
                    key={index}
                    path={book.url}
                    render={() => <BookRouter book={book} />}
                  />
                );
              })}
              <Route component={NoMatch} />
            </Switch>
          </MainContentGridChild>
          <Footer />
        </AppGrid>
      </ScoreContext.Provider>
    );
  }
}

export default App;
