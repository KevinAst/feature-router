import {routeAspect, 
        featureRoute}   from '..';             // module under test
import {createFeature}  from 'feature-u';      // peerDependency:
import {logf}           from '../routeAspect'; // to enable logs

// enable logging ONLY to insure NO run-time errors in our logging probes
logf.enable();

describe('routeAspect() tests', () => {

  const app = 'simulatedApp';

  // *** --------------------------------------------------------------------------------
  describe('validate routeAspect.name', () => {
    test('name', () => {
      expect( routeAspect.name)
        .toEqual('route');
    });
  });


  // *** --------------------------------------------------------------------------------
  describe('genesis()', () => {

    test('config.fallbackElm$ supplied', () => {
      routeAspect.config.fallbackElm$ = 'my simulated fallbackElm';
      expect(routeAspect.genesis())
        .toBe(null);
    });

    test('requires config.fallbackElm$ to be configured', () => {
      routeAspect.config.fallbackElm$ = null;
      expect(routeAspect.genesis())
        .toMatch(/aspect requires config.fallbackElm/);
    });

  });


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
        route: ({app, appState}) => 'simulated reactElm',
      }) ) )
        .toMatch(/must be a routeCB or routeCB\[\]/);
    });

    test('valid route', () => {
      expect( routeAspect.validateFeatureContent( createFeature({
        name:  'featureWithValidRoute',
        route: featureRoute({ content: ({app, appState}) => 'simulated reactElm' }),
      }) ) )
        .toBe(null);
    });

    test('valid route array', () => {
      expect( routeAspect.validateFeatureContent( createFeature({
        name:  'featureWithValidRoutes',
        route: [
          featureRoute({ content: ({app, appState}) => 'simulated reactElm1' }),
          featureRoute({ content: ({app, appState}) => 'simulated reactElm2' }),
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
      routeAspect.assembleFeatureContent(app, [feature1, feature2, feature3]);
      expect(routeAspect.routes)
        .toEqual([ // our simulated routes with .featureName appended
          {"featureName": "feature1"},
          {"featureName": "feature3"},
          {"featureName": "feature3"}
        ]);
    });

    test('configuration NOT used when routes found', () => {
      routeAspect.config.allowNoRoutes$ = ['MY Simulated Route'];
      routeAspect.assembleFeatureContent(app, [feature1, feature2, feature3]);
      routeAspect.config.allowNoRoutes$ = null; // reset
      expect(routeAspect.routes)
        .toEqual([ // our simulated routes with .featureName appended
                   {"featureName": "feature1"},
                   {"featureName": "feature3"},
                   {"featureName": "feature3"}
        ]);
    });

    test('NO routes (DEFAULT)', () => {
      expect( () => routeAspect.assembleFeatureContent(app, [feature2]) )
        .toThrow(/found NO routes within your features/);
      // THROWS: ***ERROR*** feature-router found NO routes within your features ... did you forget to register Feature.route aspects in your features? (please refer to the feature-router docs to see how to override this behavior).
    });

    test('NO routes (CONFIGURED to NO-OP)', () => {
      routeAspect.config.allowNoRoutes$ = true;
      routeAspect.assembleFeatureContent(app, [feature2]);
      expect( routeAspect.routes )
      .toEqual([]);
    });

    test('NO routes (CONFIGURED to our routes)', () => {
      routeAspect.config.allowNoRoutes$ = ['MY Simulated Route'];
      routeAspect.assembleFeatureContent(app, [feature2]);
      expect( routeAspect.routes )
        .toEqual(['MY Simulated Route']);
    });

  });


  // *** --------------------------------------------------------------------------------
  describe('initialRootAppElm()', () => {

    test('test no-op with NO routes', () => {
      routeAspect.routes = []; // NO routes
      expect(routeAspect.initialRootAppElm(app, 'simulated_curRootAppElm'))
        .toBe('simulated_curRootAppElm');
    });

    test('test routeAspect AFTER rootAppElm defined', () => {
      routeAspect.routes = ['MY Simulated Route']; // with routes
      expect( () => routeAspect.initialRootAppElm(app, 'simulated_curRootAppElm ALREADY DEFINED') )
        .toThrow(/register routeAspect .* before other Aspects that inject content in the rootAppElm/);
      // THROWS: ***ERROR*** Please register routeAspect (from feature-router) before other Aspects that inject content in the rootAppElm ... <StateRouter> does NOT support children.
    });

    test('test success', () => {
      routeAspect.routes = ['MY Simulated Route']; // with routes
      expect( routeAspect.initialRootAppElm(app, null) )
        .toBeTruthy();
    });

  });

});
