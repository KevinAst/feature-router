import {routeAspect}  from '../../tooling/ModuleUnderTest';

describe('routeAspect() tests', () => {

  test('name', () => {
    expect( routeAspect.name)
      .toEqual('route');
  });

});
