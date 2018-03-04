import {routeAspect}  from '..'; // module under test

// NOTE: Because of the way extended Aspect properties are managed (in
//       global module space) we can only invoke ONE routeAspect.genesis()
//       per unit test module.
//       ... that is why this test is isolated here
//       ... BECAUSE: routeAspect.genesis() invokes feature-u's: extendAspectProperty()
//       ... NOTE: this may go away when we refactor to use Aspect.config object
describe('routeAspect() genesis2 tests', () => {

  test('requires config.fallbackElm$ to be configured', () => {
    expect(routeAspect.genesis())
      .toMatch(/aspect requires config.fallbackElm/);
  });

});
