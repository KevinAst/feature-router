# feature-router - *Feature Based Navigation (using redux state)*

**feature-router** is your [feature-u] integration point to **Feature
Routes**!  It promotes the [`routeAspect`] _(a [feature-u] plugin)_
that integrates **Feature Routes** into your features.


**Backdrop:**

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

[feature-u] is a utility that facilitates feature-based project
organization for your [react] project. It helps organize your
project by individual features.  [feature-u] is extendable. It
operates under an open plugin architecture where [`Aspect`]s integrate
**feature-u** to other framework/utilities that match your specific
run-time stack.

</ul>


<!--- Badges for CI Builds ---> 
[![Build Status](https://travis-ci.org/KevinAst/feature-router.svg?branch=master)](https://travis-ci.org/KevinAst/feature-router)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/3fefa1344c8c49ebaca605525760d88a)](https://www.codacy.com/app/KevinAst/feature-router?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=KevinAst/feature-router&amp;utm_campaign=Badge_Grade)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/3fefa1344c8c49ebaca605525760d88a)](https://www.codacy.com/app/KevinAst/feature-router?utm_source=github.com&utm_medium=referral&utm_content=KevinAst/feature-router&utm_campaign=Badge_Coverage)
[![Known Vulnerabilities](https://snyk.io/test/github/kevinast/feature-router/badge.svg?targetFile=package.json)](https://snyk.io/test/github/kevinast/feature-router?targetFile=package.json)
[![NPM Version Badge](https://img.shields.io/npm/v/feature-router.svg)](https://www.npmjs.com/package/feature-router)


**Overview:**

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 


**feature-router** configures **Feature Routes** through the
[`routeAspect`] (_which is supplied to_ **feature-u**'s
[`launchApp()`]).  This extends **feature-u**'s [`Feature`] object by
adding support for the `Feature.route` property, referencing the
[`routeCB()`] hook specified through the [`featureRoute()`] function.

**Feature Routes** is _based on a very simple concept_: **allow the
[redux] application state to drive the routes!** It operates through a series
of registered functional callback hooks, which determine the active
screen based on an analysis of the the overall appState.  

This is particularly useful in feature-based routing, because each
feature can promote their own UI components in an encapsulated and
autonomous way!

Because of this, **feature-router** is a preferred routing solution
for [feature-u].

</ul>

## At a Glance

- [Install](#install)
- [Usage]
- [A Closer Look]
  * [Why Feature Routes?](#why-feature-routes)
  * [How Feature Routes Work](#how-feature-routes-work)
  * [Route Priorities]
  * [Feature Order and Routes](#feature-order-and-routes)
  * [Routing Precedence](#routing-precedence)
- [Configuration](#configuration)
  * [fallbackElm$](#fallbackelm)
  * [componentWillUpdateHook$](#componentwillupdatehook)
- [Interface Points](#interface-points)
  * [Input](#input)
  * [Exposure](#exposure)
  * [Error Conditions](#error-conditions)
- [API](#api)
  - [`routeAspect: Aspect`](#routeaspect-aspect)
  - [`featureRoute({content, [priority]}): routeCB`](#featureroute)
    - [`routeCB({fassets, appState}): reactElm || null`](#routecb)
  - [`PRIORITY`]
- [Potential Need for Polyfills](#potential-need-for-polyfills)



## Install

- **peerDependencies** ... you should already have these, **because
  this is our integration point** _(but just in case)_:

  ```shell
  npm install --save feature-u
  npm install --save react
  npm install --save redux
  npm install --save react-redux
  ```
  <!--- WITH REVEAL of USAGE:
  npm install --save feature-u    # VER: >=1.0.0    USAGE: createAspect() (v1 replaces App with Fassets obj -AND- publicFace with fassets aspect)
  npm install --save react        # VER: >=0.14.0   USAGE: <StateRouter> component definition and it's injection into the DOM with JSX
  npm install --save redux        # VER: >=3.1.0    USAGE: indirect under-the-covers (because of the react-redux connect() usage) ... found in unit testing
  npm install --save react-redux  # VER: >=3.0.0    USAGE: connect() within <StateRouter>
  NOTE: the **StateRouter** dependency is self contained
  ---> 

- **the main event**:

  ```shell
  npm install --save feature-router
  ```

**SideBar**: Depending on how current your target browser is
_(i.e. it's JavaScript engine)_, you may need to polyfill your app
_(please refer to [Potential Need for
Polyfills](#potential-need-for-polyfills))_.


## Usage

1. Within your mainline, register the **feature-router**
   [`routeAspect`] _(see: `**1**`)_ to **feature-u**'s
   [`launchApp()`].

   **Please note** that [`routeAspect`] has a required [confic.fallbackElm$
   configuration item](#fallbackelm) _(see: `**2**`)_.

   **Also note** that [redux] must be present in your run-time stack,
   because the routes ultimately analyze state managed by [redux] _(see:
   `**3**`)_.

   **src/app.js**
   ```js
   import {launchApp}      from 'feature-u';
   import {routeAspect}    from 'feature-router'; // **1**
   import {reducerAspect}  from 'feature-redux';  // **3**
   import SplashScreen     from '~/util/comp/SplashScreen';
   import features         from './feature';

   // configure Aspects (as needed)               // **2**
   routeAspect.config.fallbackElm$ = <SplashScreen msg="I'm trying to think but it hurts!"/>;

   export default launchApp({

     aspects: [
       routeAspect,                               // **1**
       reducerAspect,                             // **3**
       ... other Aspects here
     ],

     features,

     registerRootAppElm(rootAppElm) {
       ReactDOM.render(rootAppElm,
                       getElementById('myAppRoot'));
     }
   });
   ```

2. Within each feature that promotes UI Screens, simply register the
   feature's route through the `Feature.route` property _(using
   **feature-u**'s [`createFeature()`])_.

   Here is a route for a `startup` feature that simply promotes a
   SplashScreen until the system is ready.  It's route references a
   [`routeCB()`] _(see `**4**`)_ defined through the
   [`featureRoute()`] function _(see `**5**`)_:

   **Note** that this example has a **HIGH** [route
   priority](#route-priorities), giving it precedence over other
   routes at a lower priority _(see: `**6**`)_.

   **src/feature/startup/index.js**
   ```js
   import React            from 'react';
   import {createFeature}  from 'feature-u';
   import {featureRoute, 
           PRIORITY}       from 'feature-router';
   import * as selector    from './state';
   import SplashScreen     from '~/util/comp/SplashScreen';
   
   export default createFeature({

     name:  'startup',

     route: featureRoute({              // **5** 
       priority: PRIORITY.HIGH,         // **6**
       content({fassets, appState}) {   // **4**
         if (!selector.isDeviceReady(appState)) {
           return <SplashScreen msg={selector.getDeviceStatusMsg(appState)}/>;
         }
         return null;  // system IS ready ... allow downstream routes to activate
       },
     }),

     ... snip snip
   });
   ```

   The `Feature.route` property can either reference a single
   [`featureRoute()`] or multiple _(an array)_ with varying
   priorities.


This should give you the **basic idea** of how **Feature Routes**
operate.  The following sections _**develop a more thorough
understanding**_ of **Feature Route** concepts.  _Go forth and
compute!_


## A Closer Look

You may be surprised to discover that [feature-u] recommends it's own
flavor of route management. There are so many!  Why introduce yet
another?

As it turns out, [feature-u] does not dictate any one
navigation/router solution.  You are free to use whatever
route/navigation solution that meets your requirements.
 - You can use the recommended **Feature Routes** _(i.e. this package)_
 - You can use XYZ navigation (_fill in the blank with your chosen solution_)
 - You can even use a combination of **Feature Routes** routes and XYZ routes

Let's take a closer look at **Feature Routes**.


### Why Feature Routes?

The **big benefit** of **Feature Routes** (_should you choose to use
them_) is that **it allows a feature to promote it's screens in an
encapsulated and autonomous way**!

**Feature Routes** are _based on a very simple concept_: **allow the
[redux] application state to drive the routes!**

In feature based routing, you will not find the typical "route path to
component" mapping catalog, where (_for example_) some pseudo
`route('signIn')` directive causes the SignIn screen to display, which
in turn causes the system to accommodate the request by adjusting it's
state appropriately.  Rather, the appState is analyzed, and if the
user is NOT authenticated, the SignIn screen is automatically
displayed ... **Easy Peasy!**

Depending on your perspective, this approach can be **more natural**,
but _more importantly_ (once again), **it allows features to promote
their own screens in an encapsulated and autonomous way**!


### How Feature Routes Work

Each feature _(that maintains UI screens)_ promotes it's top-level
screens through a `Feature.route` property _(within **feature-u**'s
[`createFeature()`])_.

A `route` is simply a function that reasons about the [redux]
appState, and either returns a rendered component, or null to allow
downstream routes the same opportunity.  Basically **the first
non-null return wins**.

If no component is established _(after analyzing the routes from all
features)_, the router will revert to a [configured
fallback](#fallbackelm) - **a Splash Screen of sorts** _(not typical
but may occur in some startup transitions)_.

The `route` directive contains one or more function callbacks
([`routeCB()`]), as defined by the `content` parameter of
[`featureRoute()`].  This callback has the following signature:

**API:** `routeCB({fassets, appState}): reactElm || null`


### Route Priorities

A `Feature.route` may reference a single [`routeCB()`] or an array of
multiple [`routeCB()`]s with varying priorities.  Priorities are integer
values that are used to minimize a routes registration order.  Higher
priority routes are given precedence (i.e. executed before lower
priority routes).  Routes with the same priority are executed in their
registration order.

While priorities can be used to minimize (or even eliminate) the
registration order, typically an application does in fact rely on
registration order and can operate using a small number of priorities.
A set of [`PRIORITY`] constants are available for your convenience
(_should you choose to use them_).

Priorities are particularly useful within [feature-u], where a given
feature is provided one registration slot, but requires it's route
logic to execute in different priorities.  In that case, the feature
can promote multiple routes (an array) each with their own priority.

Here is a route for an `Eateries` feature (_displaying a list of
restaurants_) that employs two separate [`routeCB()`]s with varying
priorities:

**`src/feature/eateries/route.js`**
```js
import React               from 'react';
import {createFeature}     from 'feature-u';
import {featureRoute,
        PRIORITY}          from 'feature-router';
import * as sel            from './state';
import featureName         from './featureName';
import EateriesListScreen  from './comp/EateriesListScreen';
import EateryDetailScreen  from './comp/EateryDetailScreen';
import EateryFilterScreen  from './comp/EateryFilterScreen';
import SplashScreen        from '~/util/comp/SplashScreen';

export default createFeature({

  name: featureName,

  route: [
    featureRoute({
      priority: PRIORITY.HIGH,
      content({fassets, appState}) {
        // display EateryFilterScreen, when form is active (accomplished by our logic)
        // NOTE: this is done as a priority route, because this screen can be used to
        //       actually change the view - so we display it regardless of the state of
        //       the active view
        if (sel.isFormFilterActive(appState)) {
          return <EateryFilterScreen/>;
        }
      }
    }),

    featureRoute({
      content({fassets, appState}) {

        // allow other down-stream features to route, when the active view is NOT ours
        if (fassets.sel.getView(appState) !== featureName) {
          return null;
        }
        
        // ***
        // *** at this point we know the active view is ours
        // ***
        
        // display annotated SplashScreen, when the spin operation is active
        const spinMsg = sel.getSpinMsg(appState);
        if (spinMsg) {
          return <SplashScreen msg={spinMsg}/>;
        }
        
        // display an eatery detail, when one is selected
        const selectedEatery = sel.getSelectedEatery(appState);
        if (selectedEatery) {
          return <EateryDetailScreen eatery={selectedEatery}/>;
        }
        
        // fallback: display our EateriesListScreen
        return <EateriesListScreen/>;
      }
    }),

  ],

  ... snip snip
});
```


### Feature Order and Routes

The `Feature.route` aspect **may be one _rare_ characteristic that
dictates the order of your feature registration**.  It really depends
on the specifics of your app, and how much it relies on [Route
Priorities].

With that said, _it is not uncommon for your route logic to naturally
operate independent of your feature registration order_.


### Routing Precedence

A **fundamental principle** to understand is that **feature based
routing establishes a Routing Precedence _as defined by your
application state_**!

As an example, an `'auth'` feature can take **routing precedence**
over an `'xyz'` feature, by simply resolving to an appropriate screen
until the user is authenticated _(say a SignIn screen or an
authorization splash screen during auth processing)_.

This means the the `'xyz'` feature can be assured the user is
authenticated!  You will never see logic in the `'xyz'` feature that
redirects to a login screen if the user is not authenticated.  **Very
natural and goof-proof!!!**


## Configuration

### fallbackElm$

`routeAspect.config.fallbackElm$` (**REQUIRED**):

Before you can use [`routeAspect`] you must first configure the
`fallbackElm$` representing a SplashScreen _(of sorts)_ when no routes
are in effect.  Simply set it as follows:

```js
import {routeAspect} from 'feature-router';
import SplashScreen  from './wherever/SplashScreen';

...
routeAspect.config.fallbackElm$ = <SplashScreen msg="I'm trying to think but it hurts!"/>;
...
```

This configuration is **required**, because it would be problematic
for **feature-router** to devise a default.  For one thing, it doesn't
know your app layout. But more importantly, it doesn't know the [react]
platform in use _(ex: [react-web], [react-native], [expo], etc.)_.


### componentWillUpdateHook$

`routeAspect.config.componentWillUpdateHook$` (**OPTIONAL**):

You can optionally specify a `<StateRouter>` componentWillUpdate
life-cycle hook (a function that, when defined, will be invoked during
the componentWillUpdate react life-cycle phase).  _This was initially
introduced in support of [react-native] animation._ Simply set it as
follows:

```js
import {routeAspect}     from 'feature-router';
import {LayoutAnimation} from 'react-native';
...
routeAspect.config.componentWillUpdateHook$ = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
...
```

## Interface Points

**feature-router** accumulates all the routes from the various
features of your app, and registers them to it's `<StateRouter>`
component.  The **Aspect Interface** to this process (_i.e. the inputs
and outputs_) are documented here.

### Input

- The input to **feature-router** is the set of routing callback
  hooks.  This is specified by each of your features (_that maintain
  UI Screens_) through the `Feature.route` property, referencing
  functions defined by the [`featureRoute()`] utility.

### Exposure

- **feature-router** promotes the app's active screen by injecting
  it's `<StateRouter>` component at the root of your application DOM.
  This allows your `Feature.route` hooks to specify the active screen,
  based on your application state.

- As a convenience, **feature-router** auto injects the **feature-u**
  [`Fassets object`] as a named parameter in the
  [`routeCB()`](#routecb) API.  This promotes full [Cross Feature
  Communication].

### Error Conditions

- **Required Configuration**

  If you fail to configure the required [fallbackElm$](#fallbackelm),
  the following exception will be thrown:

  ```
  launchApp() parameter violation: 
  the route aspect requires config.fallbackElm$ to be configured (at run-time)!
  ```


- **routeAspect Placement** _(Aspect Order)_

  The `routeAspect` must be ordered before other aspects that inject
  content in the rootAppElm (i.e. the Aspects passed to
  [`launchApp()`]).  The reason for this is that `<StateRouter>` _(the
  underlying utility component)_ does NOT support children (by design).

  When **feature-router** detects this scenario _(requiring action by
  you)_, it will throw the following exception:

  ```
  ***ERROR*** Please register routeAspect (from feature-router) 
              before other Aspects that inject content in the rootAppElm
              ... <StateRouter> does NOT support children.
  ```

- **NO Routes in Features**

  When **feature-router** detects that no routes have been specified by
  any of your features, it will (by default) throw the following
  exception:

  ```
  ***ERROR*** feature-router found NO routes within your features
              ... did you forget to register Feature.route aspects in your features?
              (please refer to the feature-router docs to see how to override this behavior).
  ```

  Most likely this should in fact be considered an error _(for example
  you neglected to specify the routes within your features)_.  **The
  reasoning is**: _why would you not specify any routes if your using
  feature-router?_

  You can change this behavior through the following configuration:

  ```js
  routeAspect.config.allowNoRoutes$ = true;
  ```

  With this option enabled, when no routes are found, feature-router
  will simply NOT be configured (accompanied with a WARNING logging
  probe).

  You can also specify your own array of routes in place of the `true`
  value, which will be used ONLY in the scenario where no routes were
  specified by your features.



## API

### routeAspect: Aspect

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

The `routeAspect` is the [feature-u] plugin that facilitates
**Feature Route** integration to your features.

To use this aspect:

- Within your mainline:

  - configure the `routeAspect.config.fallbackElm$` representing a
    SplashScreen (of sorts) when no routes are in effect.

  - register the **feature-router** `routeAspect` to **feature-u**'s
    [`launchApp()`].

- Within each feature that maintains UI Components, simply register
  the feature's route through the `Feature.route` property _(using
  **feature-u**'s [`createFeature()`])_.  This `Feature.route`
  references a function defined through the [`featureRoute()`]
  utility.

Please refer to the [Usage] section for examples of this process.

</ul>

### featureRoute()

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

**API:** `featureRoute({content, [priority]}): routeCB`

Embellish the supplied `content` function _(a [`routeCB()`])_ with a
`routePriority` property _(a specification interpreted by **Feature
Router**)_ as to the order in which the set of registered routes are
to be executed.

A [`routeCB()`] reasons about the supplied [redux] appState, and
either returns a rendered component screen, or null to allow
downstream routes the same opportunity.  Basically the first non-null
return wins _(within all registered routes)_.

Priorities are integer values that are used to minimize a routes
registration order.  Higher priority routes are given precedence
(i.e. executed before lower priority routes).  Routes with the same
priority are executed in their registration order.  While a
priority can be any integer number, for your convenience, a small
number of [`PRIORITY`] constants are provided.

For more details, please refer to [A Closer Look].

**Please Note**: `featureRoute()` accepts named parameters.

**Parameters**:

- **content**: [`routeCB()`]

  The the [`routeCB()`] to embellish.

- **[priority]**: integer

  The optional priority to use (DEFAULT: `PRIORITY.STANDARD` or 50).


**Return**: [`routeCB()`]

<ul style="margin-left: 2em;">

the supplied `content` function, embellished with the specified
`routePriority` property.

</ul>

</ul>


### routeCB()

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

**API:** `routeCB({fassets, appState}): reactElm || null`

A functional callback hook (specified by [`featureRoute()`]) that
provides a generalized run-time API to abstractly expose component
rendering, based on appState. 

A **routeCB** reasons about the supplied [redux] appState, and either
returns a rendered component screen, or null to allow downstream
routes the same opportunity.  Basically the first non-null return
(within all registered routes) wins.

The **routeCB** also has a routePriority associated with it.  Priority
routes are given precedence in their execution order.  In other
words, the order in which a set of routes are executed
are 1: routePriority, 2: registration order.  This is useful in
minimizing the registration order.

For more details, please refer to [A Closer Look].

**Please Note**: `routeCB()` accepts named parameters.

**Parameters**:

- **fassets**: [`Fassets object`]

  The [`Fassets object`] used in feature cross-communication.

  **SideBar**: `fassets` is actually injected by the [`routeAspect`] using
  `<StateRouter>`'s namedDependencies.  However, since
  **feature-router** is currently the only interface to
  `<StateRouter>`, we document it as part of this **routeCB** API.

- **appState**: Any

  The top-level [redux] application state to reason about.

**Return**: reactElm || null

<ul style="margin-left: 2em;">

a rendered component (i.e. [react] element) representing the screen to
display, or null for none (allowing downstream routes an opportunity).

</ul>

</ul>


### PRIORITY

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

The **PRIORITY** container promotes a small number of defined
constants.  This is strictly a convenience, as any integer can be
used.

Priorities are integer values that are used to minimize a routes
registration order.  Higher priority routes are given precedence
(i.e. executed before lower priority routes).  Routes with the same
priority are executed in their registration order.  While a priority
can be any integer number, for your convenience, a small number of
**PRIORITY** constants are provided:

```js
import {PRIORITY} from 'feature-router';

// usage:
PRIORITY.HIGH     // ... 100
PRIORITY.STANDARD // ...  50 ... the default (when NOT specified)
PRIORITY.LOW      // ...  10
```

For more information, please refer to [Route Priorities].

</ul>


## Potential Need for Polyfills

The implementation of this library employs modern es2015+ JavaScript
constructs.  Even though the library distribution is transpiled to
[es5](https://en.wikipedia.org/wiki/ECMAScript#5th_Edition) _(the
least common denominator)_, **polyfills may be required** if you are
using an antiquated JavaScript engine _(such as the IE browser)_.

We take the approach that **polyfills are the responsibility of the
client app**.  This is a legitimate approach, as specified by the [W3C
Polyfill Findings](https://www.w3.org/2001/tag/doc/polyfills/)
_(specifically [Advice for library
authors](https://www.w3.org/2001/tag/doc/polyfills/#advice-for-library-and-framework-authors))_.

- polyfills should only be introduced one time _(during code expansion
  of the app)_
- a library should not pollute the global name space _(by including
  polyfills at the library level)_
- a library should not needlessly increase it's bundle size _(by
  including polyfills that are unneeded in a majority of target
  environments)_

As it turns out, **app-level polyfills are not hard to implement**,
with the advent of third-party utilities, such as babel:

- simply import [babel-polyfill](https://babeljs.io/docs/en/babel-polyfill.html)
- or use babel's
  [babel-preset-env](https://babeljs.io/docs/en/babel-preset-env.html)
  in conjunction with babel 7's `"useBuiltins": "usage"` option

**If your target JavaScript engine is inadequate, it will generate
native run-time errors, and you will need to address the polyfills.**
Unfortunately, in many cases these errors can be very obscure _(even
to seasoned developers)_.  The following [Babel Feature
Request](https://github.com/babel/babel/issues/8089) _(if/when
implemented)_ is intended to address this issue.


<!--- *** REFERENCE LINKS *** ---> 

<!--- **feature-router** ---> 
[Usage]:             #usage
[A Closer Look]:    #a-closer-look
[Route Priorities]: #route-priorities
[`routeAspect`]:    #routeaspect-aspect
[`featureRoute()`]: #featureroute
[`routeCB()`]:      #routecb
[`PRIORITY`]:       #priority


<!--- feature-u ---> 
[feature-u]:              https://feature-u.js.org/
[`launchApp()`]:          https://feature-u.js.org/cur/api.html#launchApp
[`createFeature()`]:      https://feature-u.js.org/cur/api.html#createFeature
[`managedExpansion()`]:   https://feature-u.js.org/cur/api.html#managedExpansion
[`Feature`]:              https://feature-u.js.org/cur/api.html#Feature
[`Fassets object`]:       https://feature-u.js.org/cur/api.html#Fassets
[`Aspect`]:               https://feature-u.js.org/cur/api.html#Aspect
[Managed Code Expansion]: https://feature-u.js.org/cur/crossCommunication.html#managed-code-expansion
[Cross Feature Communication]: https://feature-u.js.org/cur/crossCommunication.html

<!--- react ---> 
[react]:            https://reactjs.org/
[react-web]:        https://reactjs.org/
[react-native]:     https://facebook.github.io/react-native/
[expo]:             https://expo.io/


<!--- redux ---> 
[redux]:            https://redux.js.org/
