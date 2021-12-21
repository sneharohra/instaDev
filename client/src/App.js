import React, { Fragment, useEffect } from 'react';
import { BrowserRouter as Router , Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Alert from './components/layout/Alert';
import Dashboard from './components/dashboard/Dashboard';
import PrivateRoute from './components/routing/PrivateRoute';
import './App.css';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import { loadUser } from './actions/auth';
import setAuthToken from './utils/setAuthToken';
import CreateProfile from './components/profile-forms/CreateProfile';
import EditProfile from './components/profile-forms/EditProfile';
import AddExperience from './components/profile-forms/AddExperience';
import AddEducation from './components/profile-forms/AddEducation';

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
        <Route exact path = '/dashboard' element = {<PrivateRoute />} >
          <Route exact path = '/dashboard' element = {<Dashboard />} />
        </Route>
        <Route exact path = '/create-profile' element = {<PrivateRoute />} >
          <Route exact path = '/create-profile' element = {<CreateProfile />} />
        </Route>
        <Route exact path = '/edit-profile' element = {<PrivateRoute />} >
          <Route exact path = '/edit-profile' element = {<EditProfile />} />
        </Route>
        <Route exact path = '/add-experience' element = {<PrivateRoute />} >
          <Route exact path = '/add-experience' element = {<AddExperience />} />
        </Route>
        <Route exact path = '/add-education' element = {<PrivateRoute />} >
          <Route exact path = '/add-education' element = {<AddEducation />} />
        </Route>
        </Routes>
    </Fragment>
    </Router>
  </Provider>
) };

export default App;
