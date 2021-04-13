import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import Layout from "./components/Layout";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path={["/", "/:code"]} children={<Layout />} />
        <Redirect to="/" />
      </Switch>
    </Router>
  );
}

export default App;
