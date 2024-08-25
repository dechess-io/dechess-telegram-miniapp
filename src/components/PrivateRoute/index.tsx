import React from 'react'
import { Navigate } from 'react-router-dom'
import { token } from '../../services/socket'

interface PrivateRouteProps {
  element: React.ReactElement
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  return token ? element : <Navigate to="/login" />
}

export default PrivateRoute
