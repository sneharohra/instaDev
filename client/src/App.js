import React, { Fragment } from 'react';
import { BrowserRouter as Router , Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import './App.css';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
//redux
import {Provider} from 'react-redux';
import store from './store';
import { stripComments } from 'config/parser';

const App = () => (
  <Provider store = {store}>
    <Router>
    <Fragment>
      <Navbar />
      <Routes>
        <Route exact path = '/' element = {<Landing />} />
        <Route exact path = '/login' element = {<Login />} />
        <Route exact path = '/register' element = {<Register />} />
      </Routes>
    </Fragment>
    </Router>
  </Provider>
);

export default App;


/*

*/
