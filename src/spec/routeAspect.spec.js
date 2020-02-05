import {createRouteAspect,
        featureRoute}   from '..';             // module under test
import {createFeature}  from 'feature-u';      // peerDependency:
import {logf}           from '../routeAspect'; // to enable logs

const routeAspect = createRouteAspect({fallbackElm: 'my simulated fallbackElm'});

// enable logging ONLY to insure NO run-time errors in our logging probes
logf.enable();

describe('routeAspect() tests', () => {

  const fassets = 'simulatedFassets';

  // *** --------------------------------------------------------------------------------
  describe('validate routeAspect.name', () => {
    test('name', () => {
      expect( routeAspect.name)
        .toEqual('route');
    });
  });

  // *** --------------------------------------------------------------------------------
  describe('validate createRouteAspect() parameter violation', () => {

    test('(null)', () => {
      expect( () => createRouteAspect(null) )
        .toThrow(/only named parameters may be supplied/);
      // THROW: createRouteAspect() parameter violation: only named parameters may be supplied
    });

    test('(123)', () => {
      expect( () => createRouteAspect(123) )
        .toThrow(/only named parameters may be supplied/);
      // THROW: createRouteAspect() parameter violation: only named parameters may be supplied
    });

    test('({name:null})', () => {
      expect( () => createRouteAspect({name:null}) )
        .toThrow(/name is required/);
      // THROW: createRouteAspect() parameter violation: name is required
    });

    test('({name:123})', () => {
      expect( () => createRouteAspect({name:123}) )
        .toThrow(/name must be a string/);
      // THROW: createRouteAspect() parameter violation: name must be a string
    });

    test("({name:'myRouter'}, 123)", () => {
      expect( () => createRouteAspect({name:'myRouter'}, 123) )
        .toThrow(/name:myRouter.*only named parameters can be specified.*2 positional parameters were found/);
      // THROW: createRouteAspect() parameter violation: name:myRouter ... unrecognized positional parameters (only named parameters can be specified) ... 2 positional parameters were found
    });

    test("({name:'myRouter', badParam1:1, badParam2:2})", () => {
      expect( () => createRouteAspect({name:'myRouter', badParam1:1, badParam2:2}) )
        .toThrow(/name:myRouter.*unrecognized named parameter.*badParam1,badParam2/);
      // THROW: createRouteAspect() parameter violation: name:myRouter ... unrecognized named parameter(s): badParam1,badParam2
    });

    test("({})", () => {
      expect( () => createRouteAspect({}) )
        .toThrow(/name:route.*fallbackElm is required/);
      // THROW: createRouteAspect() parameter violation: name:route ... fallbackElm is required (a reactElm)
    });

    test("({fallbackElm:'simFallbackElm', componentDidUpdateHook:123})", () => {
      expect( () => createRouteAspect({fallbackElm:'simFallbackElm', componentDidUpdateHook:123}) )
        .toThrow(/name:route.*componentDidUpdateHook must be a function/);
      // THROW: createRouteAspect() parameter violation: name:route ... componentDidUpdateHook must be a function (when supplied)
    });

    test("({fallbackElm:'simFallbackElm', componentDidUpdateHook:(p)=>p})", () => {
      expect( () => createRouteAspect({fallbackElm:'simFallbackElm', componentDidUpdateHook:(p)=>p}) )
        .not.toThrow();
    });

    test("({fallbackElm:'simFallbackElm', allowNoRoutes: 123})", () => {
      expect( () => createRouteAspect({fallbackElm:'simFallbackElm', allowNoRoutes: 123}) )
        .toThrow(/name:route.*allowNoRoutes must be a boolean -or- an array of routes/);
      // THROW: createRouteAspect() parameter violation: name:route ... allowNoRoutes must be a boolean -or- an array of routes
    });

    test("({fallbackElm:'simFallbackElm', allowNoRoutes: false})", () => {
      expect( () => createRouteAspect({fallbackElm:'simFallbackElm', allowNoRoutes: false}) )
        .not.toThrow();
    });

    test("({fallbackElm:'simFallbackElm', allowNoRoutes: true})", () => {
      expect( () => createRouteAspect({fallbackElm:'simFallbackElm', allowNoRoutes: true}) )
        .not.toThrow();
    });

    test("({fallbackElm:'simFallbackElm', allowNoRoutes: [1,2]})", () => {
      expect( () => createRouteAspect({fallbackElm:'simFallbackElm', allowNoRoutes: [1,2]}) )
        .not.toThrow();
    });

  });
  

  // *** --------------------------------------------------------------------------------
  // ?? obsolete?
  //? describe('genesis()', () => {
  //? 
  //?   // ?? obsolete?
  //?   test('config.fallbackElm$ supplied', () => {
  //?     routeAspect.config.fallbackElm$ = 'my simulated fallbackElm';
  //?     expect(routeAspect.genesis())
  //?       .toBe(null);
  //?   });
  //? 
  //?   // ?? obsolete?
  //?   test('requires config.fallbackElm$ to be configured', () => {
  //?     routeAspect.config.fallbackElm$ = null;
  //?     expect(routeAspect.genesis())
  //?       .toMatch(/aspect requires config.fallbackElm/);
  //?   });
  //? 
  //? });


  // *** --------------------------------------------------------------------------------
  describe('validateFeatureContent()', () => {

    test('route array must contain routes', () => {
      expect( routeAspect.validateFeatureContent( createFeature({
        name:  'featureWithArrayOfNonRoutes',
        route: ["I'm NOT a route"],
      }) ) )
        .toMatch(/must be a routeCB or routeCB\[\]/);
    });

    test('route non-array must contain a route', () => {
      expect( routeAspect.validateFeatureContent( createFeature({
        name:  'featureWithNonRoutes',
        route: "I'm NOT a route",
      }) ) )
        .toMatch(/must be a routeCB or routeCB\[\]/);
    });

    test('unprioritized route', () => {
      expect( routeAspect.validateFeatureContent( createFeature({
        name:  'featureWithUnprioritizedRoute',
        route: ({fassets, appState}) => 'simulated reactElm',
      }) ) )
        .toMatch(/must be a routeCB or routeCB\[\]/);
    });

    test('valid route', () => {
      expect( routeAspect.validateFeatureContent( createFeature({
        name:  'featureWithValidRoute',
        route: featureRoute({ content: ({fassets, appState}) => 'simulated reactElm' }),
      }) ) )
        .toBe(null);
    });

    test('valid route array', () => {
      expect( routeAspect.validateFeatureContent( createFeature({
        name:  'featureWithValidRoutes',
        route: [
          featureRoute({ content: ({fassets, appState}) => 'simulated reactElm1' }),
          featureRoute({ content: ({fassets, appState}) => 'simulated reactElm2' }),
        ],
      }) ) )
        .toBe(null);
    });

  });


  // *** --------------------------------------------------------------------------------
  describe('assembleFeatureContent()', () => {

    // Objects to allow .featureName property appendage
    const simulatedRoute1  = {};
    const simulatedRoute3a = {};
    const simulatedRoute3b = {};

    const feature1 = createFeature({
      name:  'feature1',
      route: simulatedRoute1,
    });

    const feature2 = createFeature({
      name:  'feature2',
    });

    const feature3 = createFeature({
      name:  'feature3',
      route: [simulatedRoute3a, simulatedRoute3b],
    });

    test('valid assemble with mixture', () => {
      routeAspect.assembleFeatureContent(fassets, [feature1, feature2, feature3]);
      expect(routeAspect.routes)
        .toEqual([ // our simulated routes with .featureName appended
          {"featureName": "feature1"},
          {"featureName": "feature3"},
          {"featureName": "feature3"}
        ]);
    });

    test('configuration NOT used when routes found', () => {
      routeAspect.config.allowNoRoutes$ = ['MY Simulated Route'];
      routeAspect.assembleFeatureContent(fassets, [feature1, feature2, feature3]);
      routeAspect.config.allowNoRoutes$ = null; // reset
      expect(routeAspect.routes)
        .toEqual([ // our simulated routes with .featureName appended
                   {"featureName": "feature1"},
                   {"featureName": "feature3"},
                   {"featureName": "feature3"}
        ]);
    });

    test('NO routes (DEFAULT)', () => {
      expect( () => routeAspect.assembleFeatureContent(fassets, [feature2]) )
        .toThrow(/found NO routes within your features/);
      // THROWS: ***ERROR*** feature-router found NO routes within your features ... did you forget to register Feature.route aspects in your features? (please refer to the feature-router docs to see how to override this behavior).
    });

    test('NO routes (CONFIGURED to NO-OP)', () => {
      routeAspect.config.allowNoRoutes$ = true;
      routeAspect.assembleFeatureContent(fassets, [feature2]);
      expect( routeAspect.routes )
      .toEqual([]);
    });

    test('NO routes (CONFIGURED to our routes)', () => {
      routeAspect.config.allowNoRoutes$ = ['MY Simulated Route'];
      routeAspect.assembleFeatureContent(fassets, [feature2]);
      expect( routeAspect.routes )
        .toEqual(['MY Simulated Route']);
    });

  });


  // *** --------------------------------------------------------------------------------
  describe('initialRootAppElm()', () => {

    test('test no-op with NO routes', () => {
      routeAspect.routes = []; // NO routes
      expect(routeAspect.initialRootAppElm(fassets, 'simulated_curRootAppElm'))
        .toBe('simulated_curRootAppElm');
    });

    test('test routeAspect AFTER rootAppElm defined', () => {
      routeAspect.routes = ['MY Simulated Route']; // with routes
      expect( () => routeAspect.initialRootAppElm(fassets, 'simulated_curRootAppElm ALREADY DEFINED') )
        .toThrow(/register routeAspect .* before other Aspects that inject content in the rootAppElm/);
      // THROWS: ***ERROR*** Please register routeAspect (from feature-router) before other Aspects that inject content in the rootAppElm ... <StateRouter> does NOT support children.
    });

    test('test success', () => {
      routeAspect.routes = ['MY Simulated Route']; // with routes
      expect( routeAspect.initialRootAppElm(fassets, null) )
        .toBeTruthy();
    });

  });

});
