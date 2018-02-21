import {routeAspect}  from '..'; // STOP USING: '../../tooling/ModuleUnderTest';

describe('routeAspect() tests', () => {

  test('name', () => {
    expect( routeAspect.name)
      .toEqual('route');
  });

});
