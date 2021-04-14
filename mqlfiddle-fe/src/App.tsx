import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { ToastProvider } from "react-toast-notifications";

import Layout from "./components/Layout";
import Toast from "./components/Toast";

function App() {
  return (
    <Router>
      <Switch>
        <Route
          exact
          path={["/", "/:code"]}
          children={
            <ToastProvider
              components={{ Toast }}
              placement="bottom-left"
              autoDismissTimeout={2500}
              autoDismiss
            >
              <Layout />
            </ToastProvider>
          }
        />
        <Redirect to="/" />
      </Switch>
    </Router>
  );
}

export default App;
