import React, { Fragment, useEffect } from 'react';
import { BrowserRouter as Router , Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Alert from './components/layout/Alert';
import './App.css';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import { loadUser } from './actions/auth';
import setAuthToken from './utils/setAuthToken';
//redux
import {Provider} from 'react-redux';
import store from './store';

if(localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => { 
  
  useEffect(() => {
    store.dispatch(loadUser());
  }, [])
  
  return (
  <Provider store = {store}>
    <Router>
    <Fragment>
      <Navbar />
        <Alert />
        <Routes>
        <Route exact path = '/' element = {<Landing />} />
        <Route exact path = '/login' element = {<Login />} />
        <Route exact path = '/register' element = {<Register />} />
        </Routes>
    </Fragment>
    </Router>
  </Provider>
) };

export default App;
