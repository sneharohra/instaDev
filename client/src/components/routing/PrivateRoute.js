import React from 'react'
import { Navigate, Outlet, Route} from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux';


const PrivateRoute = ({ auth: {isAuthenticated, loading }   }) => {
    return !isAuthenticated  && !loading ? <Navigate to ='/login' /> : <Outlet />;
};
  

PrivateRoute.propTypes = {
    auth: PropTypes.object.isRequired,
}
const mapStateToProp = state => ({
    auth: state.auth
})

export default connect(mapStateToProp)(PrivateRoute)
