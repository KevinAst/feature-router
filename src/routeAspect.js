import React                   from 'react';        // peerDependencies
import {createAspect,
        launchApp}             from 'feature-u';    // peerDependency:
import StateRouter             from './StateRouter';
import verify                  from './util/verify';
import isFunction              from 'lodash.isfunction';
import isPlainObject           from 'lodash.isplainobject';

// our logger (integrated/activated via feature-u)
export const logf = launchApp.diag.logf.newLogger('- ***feature-router*** routeAspect: ');

// NOTE: See README for complete description
export default function createRouteAspect(namedParams={}) {

  // ***
  // *** validate parameters
  // ***

  const check = verify.prefix('createRouteAspect() parameter violation: ');

  // ... namedParams
  check(isPlainObject(namedParams), 'only named parameters may be supplied');

  // descturcture our individual namedParams
  // ... NOTE: We do this here (rather in the function signature) to have access
  //           to the overall namedParams variable - for validation purposes!
  //           Access via the JavaScript implicit `arguments[0]` variable is 
  //           NOT reliable (in this context) exhibiting a number of quirks :-(
  const {name='route',
         fallbackElm,            // fallback reactElm when NO routes are in effect (REQUIRED CONFIGURATION)
         componentDidUpdateHook, // componentDidUpdateHook(): void ... invoked during react componentDidUpdate() life-cycle (OPTIONAL)
         allowNoRoutes=false,    // what to do if NO Feature.route's found ... false: ERROR (default), true: allow, routes[]: use specified array of routes
         ...unknownNamedArgs} = namedParams;

  // ... name (NOTE: name check takes precedence to facilitate `Aspect.name` identity in subsequent errors :-)
  check(name,                      'name is required');
  check(typeof name === 'string',  'name must be a string'); // NOTE: didn't want to introduce lodash.isstring dependency (in the mix of everything else going on in the 1.0.0 upgrade)

  // ... unrecognized positional parameter
  //     NOTE: when defaulting entire struct, arguments.length is 0
  check(arguments.length <= 1, `name:${name} ... unrecognized positional parameters (only named parameters can be specified) ... ${arguments.length} positional parameters were found`);

  // ... unrecognized named parameter
  const unknownArgKeys = Object.keys(unknownNamedArgs);
  check(unknownArgKeys.length === 0,  `name:${name} ... unrecognized named parameter(s): ${unknownArgKeys}`);

  // ... fallbackElm
  check(fallbackElm, `name:${name} ... fallbackElm is required (a reactElm)`);
  // AI: check fallbackElm is a reactElm

  // ... componentDidUpdateHook
  if (componentDidUpdateHook) {
    check(isFunction(componentDidUpdateHook), `name:${name} ... componentDidUpdateHook must be a function (when supplied)`);
  }

  // ... allowNoRoutes
  check(allowNoRoutes===true ||
        allowNoRoutes===false ||
        Array.isArray(allowNoRoutes), `name:${name} ... allowNoRoutes must be a boolean -or- an array of routes`);


  // ***
  // *** create/promote our new aspect
  // ***

  const routeAspect = createAspect({
    name,
    validateFeatureContent,
    assembleFeatureContent,
    initialRootAppElm,
    config: {
      fallbackElm$:            fallbackElm,
      componentDidUpdateHook$: componentDidUpdateHook,
      allowNoRoutes$:          allowNoRoutes,
    },
  });
  return routeAspect;
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

  return null; // valid
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
 * @param {Fassets} fassets the Fassets object used in cross-feature-communication.
 * 
 * @param {Feature[]} activeFeatures - The set of active (enabled)
 * features that comprise this application.
 *
 * @private
 */
function assembleFeatureContent(fassets, activeFeatures) {

  // accumulate all routes from our features
  // ... also embellish each route with the featureName for diagnostic purposes
  const hookSummary = [];
  let   routes      = activeFeatures.reduce( (accum, feature) => {
    const routeContent = feature[this.name];
    if (routeContent) {
      hookSummary.push(`\n  Feature.name:${feature.name} <-- promotes ${this.name} AspectContent`);
      if (Array.isArray(routeContent)) {
        accum.push(...routeContent);
        routeContent.forEach( route => route.featureName = feature.name );
      }
      else {
        accum.push(routeContent);
        routeContent.featureName = feature.name;
      }
    }
    else {
      hookSummary.push(`\n  Feature.name:${feature.name}`);
    }
    return accum;
  }, []);

  // report the accumulation of routes
  if (routes.length > 0) {
    logf(`assembleFeatureContent() gathered routes from the following Features: ${hookSummary}`);
  }

  // handle special case where NO routes were gathered from features
  else {

    // by default, this is an error condition (when NOT overridden by client)
    if (!this.config.allowNoRoutes$) {
      throw new Error('***ERROR*** feature-router found NO routes within your features ' +
                      `... did you forget to register Feature.${this.name} aspects in your features? ` +
                      '(please refer to the feature-router docs to see how to override this behavior).');
    }

    // when client override is an array, interpret it as routes
    if (Array.isArray(this.config.allowNoRoutes$)) {
      logf.force(`WARNING: NO routes were found in your Features (i.e. Feature.${this.name}), ` +
                 'but client override (routeAspect.config.allowNoRoutes$=[{routes}];) ' +
                 'directed a continuation WITH specified routes.');
      routes = this.config.allowNoRoutes$;
    }
    // otherwise, we simply disable feature-router and continue on
    else {
      logf.force(`WARNING: NO routes were found in your Features (i.e. Feature.${this.name}), ` +
                 'but client override (routeAspect.config.allowNoRoutes$=truthy;) ' +
                 'directed a continuation WITHOUT feature-router.');
    }
  }

  // retain for later use
  this.routes = routes;
}


/**
 * Inject our `<StateRouter>` in the `rootAppElm`.
 *
 * We use `initialRootAppElm()` because `<StateRouter>` does NOT
 * support children (by design).
 *
 * @param {Fassets} fassets the Fassets object used in cross-feature-communication.
 * 
 * @param {reactElm} curRootAppElm - the current react app element root.
 *
 * @return {reactElm} rootAppElm seeded with our `<StateRouter>`.
 *
 * @private
 */
function initialRootAppElm(fassets, curRootAppElm) {

  // no-op if we have NO routes
  if (this.routes.length === 0) {
    // NOTE: for this condition, the appropriate logf.force() is generated (above)
    return curRootAppElm;
  }

  // insure we don't clobber any supplied content
  // ... by design, <StateRouter> doesn't support children
  if (curRootAppElm) {
    throw new Error('***ERROR*** Please register routeAspect (from feature-router) before other Aspects ' +
                    'that inject content in the rootAppElm ... <StateRouter> does NOT support children.');
  }

  // seed the rootAppElm with our StateRouter
  logf(`initialRootAppElm() introducing <StateRouter> component into rootAppElm`);
  return <StateRouter routes={this.routes}
                      fallbackElm={this.config.fallbackElm$}
                      componentDidUpdateHook={this.config.componentDidUpdateHook$}
                      namedDependencies={{fassets}}/>;
}
