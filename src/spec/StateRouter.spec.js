import {StateRouter}  from '../StateRouter'; // module under test NOTE: we are picking up the "named" export ... the RAW class (without the connect() wrapper)
import {featureRoute,
        PRIORITY}   from '..';
import {logf}       from '../StateRouter'; // to enable logs

// enable logging ONLY to insure NO run-time errors in our logging probes
logf.enable();

// NOTE NOTE NOTE:
// This spec is testing the programmatic algorithm of this <StateRouter> React Component Class

describe('StateRouter Component Tests', () => {

  const routes = [
    featureRoute({                 // originalOrder: 0
      priority: PRIORITY.STANDARD,
      content({app, appState}) {
        if (appState==='appState2')
          return 'appState2Component';
        return null;
      },
    }),
    featureRoute({                 // originalOrder: 1
      priority: PRIORITY.HIGH,
      content({app, appState}) {
        if (appState==='appState1')
          return 'appState1Component';
        return null;
      },
    }),
    featureRoute({                 // originalOrder: 2
      priority: PRIORITY.STANDARD,
      content({app, appState}) {
        if (appState==='appState3')
          return 'appState3Component';
        return null;
      },
    }),
  ];

  const stateRouter = new StateRouter({
    routes,
    appState:    'will be reset in tests',
    fallbackElm: 'myFallbackElm',
    namedDependencies: {
      app: 'my app',
    },
  });
  // GREAT: should work for our algorithm tests
  // console.log(`stateRouter routes: `, stateRouter.props.routes);
  // stateRouter routes:  [
  //   { [Function: content] routePriority: 100, originalOrder: 1 },
  //   { [Function: content] routePriority: 50, originalOrder: 0 },
  //   { [Function: content] routePriority: 50, originalOrder: 2 }
  // ]
  // 
  // console.log(`stateRouter: `, stateRouter);
  // stateRouter:  StateRouter {
  //   props:
  //         { routes: [ [Object], [Object], [Object] ],
  //           appState: 'my appState',
  //           fallbackElm: 'my fallbackElm',
  //           namedDependencies: { app: 'my app' } },
  //   context: undefined,
  //   refs: {},
  //   updater:
  //           { isMounted: [Function: isMounted],
  //             enqueueForceUpdate: [Function: enqueueForceUpdate],
  //             enqueueReplaceState: [Function: enqueueReplaceState],
  //             enqueueSetState: [Function: enqueueSetState] } }

  // *** --------------------------------------------------------------------------------
  // BAD: NO WORKY for our algorithm tests
  // const stateRouter = <StateRouter routes={routes}
  //                                  appState={'my appState'}
  //                                  fallbackElm={'my fallbackElm'}
  //                                  namedDependencies={{
  //                                    app: 'my app',
  //                                  }}/>;
  // console.log(`stateRouter: `, stateRouter);
  // stateRouter:  { 
  //   '$$typeof': Symbol(react.element),
  //   type: { [Function: Connect]
  //     WrappedComponent: [Function: StateRouter],
  //           displayName: 'Connect(StateRouter)',
  //           childContextTypes: { storeSubscription: [Object] },
  //           contextTypes: { store: [Object], storeSubscription: [Object] },
  //           propTypes: { store: [Object], storeSubscription: [Object] } },
  //   key: null,
  //   ref: null,
  //   props:
  //         { routes: [ [Object], [Object], [Object] ],
  //           appState: 'my appState',
  //           fallbackElm: 'my fallbackElm',
  //           namedDependencies: { app: 'my app' } },
  //   _owner: null,
  //   _store: {}
  // }


  // *** --------------------------------------------------------------------------------
  test('validate order of routes', () => {
    const actualOrder = stateRouter.props.routes.map( (route) => route.originalOrder );
    expect(actualOrder)
      .toEqual([1, 0, 2]);
  });


  // *** --------------------------------------------------------------------------------
  describe('componentWillUpdate()', () => {

    let hookInvoked = false;

    test('not configured', () => {
      stateRouter.componentWillUpdate();
      expect(hookInvoked)
        .toBe(false);
    });

    test('configured', () => {
      stateRouter.props.componentWillUpdateHook = function() {
        hookInvoked = true;
      };
      stateRouter.componentWillUpdate();
      stateRouter.props.componentWillUpdateHook = null;
      expect(hookInvoked)
        .toBe(true);
    });

  });


  // *** --------------------------------------------------------------------------------
  describe('render()', () => {

    test('appState1', () => {
      stateRouter.props.appState = 'appState1';
      expect(stateRouter.render())
        .toBe('appState1Component');
    });

    test('appState2', () => {
      stateRouter.props.appState = 'appState2';
      expect(stateRouter.render())
        .toBe('appState2Component');
    });

    test('appState3', () => {
      stateRouter.props.appState = 'appState3';
      expect(stateRouter.render())
        .toBe('appState3Component');
    });

    // NOTE: we have already tested that fallbackElm has been configured/supplied
    //       see: routeAspect.genesis2.spec.js
    test('appState999', () => {
      stateRouter.props.appState = 'appState999';
      expect(stateRouter.render())
        .toBe('myFallbackElm');
    });
  });

});

