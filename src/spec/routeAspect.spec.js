import {routeAspect}  from '..'; // module under test
import {logf}         from '../routeAspect'; // ?? JUST to enable logs

// temporarly turn on logging (just for fun)
logf.enable(); // ??

describe('routeAspect() tests', () => {

  describe('validate routeAspect.name', () => {
    test('name', () => {
      expect( routeAspect.name)
        .toEqual('route');
    });
  });


  describe('genesis()', () => {

    test('requires fallbackElm to be configured', () => {
      expect(routeAspect.genesis())
        .toMatch(/aspect requires fallbackElm to be configured/);
    });

    // ?? due to the way BLA must be in seperate test module
    test.skip('fallbackElm supplied', () => {
      routeAspect.fallbackElm = 'my simulated fallbackElm';
      expect(routeAspect.genesis())
        .toBe(null);
    });

  });


});
