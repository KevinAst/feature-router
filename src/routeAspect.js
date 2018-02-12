import React                      from 'react';     // peerDependencies
import {createAspect,
        extendAspectProperty}     from 'feature-u'; // peerDependency: 
import StateRouter                from './StateRouter';
import isFunction                 from 'lodash.isfunction';

// register feature-router proprietary Aspect APIs
// ... required to pass feature-u validation
// ... must occur globally (during our in-line code expansion)
//     guaranteeing the new API is available during feature-u validation
extendAspectProperty('fallbackElm');             // Aspect.fallbackElm: reactElm           ... AI: technically this if for reducerAspect only (if the API ever supports this)
extendAspectProperty('componentWillUpdateHook'); // Aspect.componentWillUpdateHook(): void ... AI: technically this if for reducerAspect only (if the API ever supports this)


// NOTE: See README for complete description
export default createAspect({
  name: 'route',
  validateConfiguration,
  validateFeatureContent,
  assembleFeatureContent,
  initialRootAppElm,
});


/**
 * Validate self's required configuration.
 *
 * NOTE: To better understand the context in which any returned
 *       validation messages are used, feature-u will prefix them
 *       with: 'launchApp() parameter violation: '
 *
 * @return {string} an error message when self is in an invalid state
 * (falsy when valid).
 *
 * @private
 */
function validateConfiguration() {
  return this.fallbackElm ? null : `the ${this.name} aspect requires fallbackElm to be configured (at run-time)!`;
}


/**
 * Validate self's aspect content on supplied feature.
 *
 * NOTE: To better understand the context in which any returned
 *       validation messages are used, **feature-u** will prefix them
 *       with: 'createFeature() parameter violation: '
 *
 * @param {Feature} feature - the feature to validate, which is known
 * to contain this aspect.
 *
 * @return {string} an error message when the supplied feature
 * contains invalid content for this aspect (null when valid).
 *
 * @private
 */
function validateFeatureContent(feature) {
  const content = feature[this.name];
  const errMsg  = `${this.name} (when supplied) must be a routeCB or routeCB[] emitted from featureRoute()`;

  if (Array.isArray(content)) {
    for (const routeCB of content) {
      if ( !isValid(routeCB) ) {
        return errMsg;
      }
    }
  }
  else if ( !isValid(content) ) {
    return errMsg;
  }
  else {
    return null; // valid
  }
}

function isValid(routeCB) {
  if (! isFunction(routeCB)) {
    return false; // must be a function
  }
  else if ( ! Number.isInteger(routeCB.routePriority) ) {
    return false; // must be emitted from featureRoute()
  }
  else return true; // valid
}


/**
 * Accumulate all routes from our features.
 *
 * @param {App} app the App object used in feature cross-communication.
 * 
 * @param {Feature[]} activeFeatures - The set of active (enabled)
 * features that comprise this application.
 *
 * @private
 */
function assembleFeatureContent(app, activeFeatures) {

  // accumulate all routes from our features
  // ... also embellish each route with the featureName for diagnostic purposes
  const routes = activeFeatures.reduce( (accum, feature) => {
    const routeContent = feature[this.name];
    if (routeContent) {
      // console.log(`xx acumulating route for ${feature.name}`);
      if (Array.isArray(routeContent)) {
        accum.push(...routeContent);
        routeContent.forEach( route => route.featureName = feature.name );
      }
      else {
        accum.push(routeContent);
        routeContent.featureName = feature.name;
      }
    }
    return accum;
  }, []);
  // console.log(`xx routes: `, routes);

  // ?? how should NO routes be handled: silenty ignore, OR throw error?

  // retain for later use
  this.routes = routes;
}


/**
 * Inject our `<StateRouter>` in the `rootAppElm`.
 *
 * We use `initialRootAppElm()` because `<StateRouter>` does NOT
 * support children (by design).
 *
 * @param {App} app the App object used in feature cross-communication.
 * 
 * @param {reactElm} curRootAppElm - the current react app element root.
 *
 * @return {reactElm} rootAppElm seeded with our `<StateRouter>`.
 *
 * @private
 */
function initialRootAppElm(app, curRootAppElm) {
  // insure we don't clober any supplied content
  // ... by design, <StateRouter> doesn't support children
  if (curRootAppElm) {
    throw new Error('*** ERROR*** Please register routeAspect (from feature-router) before other Aspects ' +
                    'that inject content in the rootAppElm ... <StateRouter> does NOT support children.');
  }

  // seed the rootAppElm with our StateRouter
  return <StateRouter routes={this.routes}
                      fallbackElm={this.fallbackElm}
                      componentWillUpdateHook={this.componentWillUpdateHook}
                      namedDependencies={{app}}/>;
}
