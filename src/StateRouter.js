import React       from 'react';       // peerDependencies
import {connect}   from 'react-redux'; // peerDependencies
import {launchApp} from 'feature-u';   // peerDependency ... strictly to tap into logging ... logf()

// our logger (integrated/activated via feature-u)
export const logf = launchApp.diag.logf.newLogger('- ***feature-router*** <StateRouter>: ');

/**
 * A top-level React component that serves as a simple router, driven
 * by our app-level redux state!  This component must be injected in
 * the root of your application DOM element.
 *
 * NOTE: We use React class in order to tap into it's life-cycle
 *       hooks, used by the optional componentDidUpdateHook property
 *       (initially developed to support ReactNative animation).
 */
export class StateRouter extends React.Component { // NOTE: this "named" export if for testing purposes only

  constructor(props) {
    super(props);
    logf('Instantiating <StateRouter> with props: ', Object.keys(this.props));

    // re-order our routes in their execution order
    const routes = this.props.routes;
    // ... retain the original routes order (for sort tie breaker within same routePriority)
    routes.forEach( (route, indx) => route.originalOrder = indx );
    // ... sort by execution order
    routes.sort( (r1, r2) => (
      r2.routePriority - r1.routePriority || // ... FIRST:  routePriority (decending)
      r1.originalOrder - r2.originalOrder    // ... SECOND: registration order (ascending)
    ));

    const hookSummary = routes.map( (route, indx) => `\n  ${indx+1}: Feature.name:${route.featureName} with priority: ${route.routePriority}` );
    logf(`route order ...${hookSummary}`);
  }

  componentDidUpdate() {
    // optionally invoke the componentDidUpdateHook (when specified)
    // ... initially developed to support ReactNative animation
    //     SEE: React Native’s LayoutAnimation in the post-componentWillUpdate age
    //          ... https://medium.com/@benadamstyles/react-native-layoutanimation-in-the-post-componentwillupdate-age-9146b3af0243
    if (this.props.componentDidUpdateHook) {
      logf('running client specified componentDidUpdateHook()'); // AI: is this too much logging? ... however: only when enabled
      this.props.componentDidUpdateHook();
    }
  }

  /**
   * Our rendor() method implements our router/navigation, based
   * on simple app-level redux state!
   */
  render() {

    const {routes, appState, fallbackElm, namedDependencies} = this.props;

    // apply routes in order of 1: routePriority, 2: registration order (within same priority)
    for (const route of routes) {

      const content = route({appState, ...namedDependencies});
      if (content) {
        logf(`active route set by Feature.name:${route.featureName} with priority: ${route.routePriority}`);
        return content;
      }
    }

    // fallback
    logf('active route set by client configured fallbackElm');
    return fallbackElm;
  }
}

// NOTE: Because we are invoked within our controlled env, we bypass
//       prop-types npm pkg, and assume our props are correct!  This
//       eliminates the need for prop-types peerDependencies (or
//       dependency).
// import PropTypes from 'prop-types';
// StateRouter.propTypes = {
//   routes:      PropTypes.array.isRequired,   // all registered routes: routeCB[]
//   appState:    PropTypes.object.isRequired,  // appState, from which to reason about routes
//   fallbackElm: PropTypes.element.isRequired, // fallback elm representing a SplashScreen (of sorts) when no routes are in effect
//   componentDidUpdateHook: PropTypes.func     // OPTIONAL: invoked in componentDidUpdate() life-cycle hook (initially developed to support ReactNative animation)
//   namedDependencies: PropTypes.object        // OPTIONAL: object containing named dependencies to be injected into to routeCB() function call ... ex: <StateRouter namedDependencies={{fassets, api}}/>
// };

// access redux appState, via redux connect()
export default connect( (appState) => ({appState}))(StateRouter);
