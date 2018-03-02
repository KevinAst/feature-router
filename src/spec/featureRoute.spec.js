import {featureRoute,
        PRIORITY}   from '..';

describe('featureRoute() Tests', () => {

  function myRoute({app, appState}) {
    return 'my fake route';
  }

  test('content is required', () => {
    expect( () => featureRoute() )
      .toThrow(/content is required/);
    // THROWS: featureRoute() parameter violation: content is required
  });

  test('content must be a function', () => {
    expect( () => featureRoute({
      content: "I'm NOT a function",
    }) )
      .toThrow(/content must be a function/);
    // THROWS: featureRoute() parameter violation: content must be a function
  });

  test('priority must be an integer', () => {
    expect( () => featureRoute({
      priority: "I'm NOT an integer",
      content:  myRoute,
    }) )
      .toThrow(/priority .* must be an integer/);
    // THROWS: featureRoute() parameter violation: priority (when supplied) must be an integer ... I'm NOT an integer
  });

  test('unrecognized named parameter', () => {
    expect( () => featureRoute({
      priority: PRIORITY.LOW,
      content:  myRoute,
      ouchy:    'bad parameter',
      dillweed: 'another bad parameter',
    }) )
      .toThrow(/unrecognized named parameter.*ouchy.*dillweed/);
    // THROWS: featureRoute() parameter violation: unrecognized named parameter(s): ouchy,dillweed
  });

  test('success WITH default priority embellishment', () => {
    featureRoute({
      content:  myRoute,
    });
    expect(myRoute.routePriority)
      .toBe(PRIORITY.STANDARD);
  });

  test('success WITH NON default priority embellishment', () => {
    featureRoute({
      priority: 999,
      content:  myRoute,
    });
    expect(myRoute.routePriority)
      .toBe(999);
  });

});
