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
        <Route exact path="/">
          <Layout />
        </Route>
        <Redirect to="/" />
      </Switch>
    </Router>
  );
}

export default App;
