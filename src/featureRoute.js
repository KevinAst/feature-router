import verify         from './util/verify';
import isFunction     from 'lodash.isfunction';


// NOTE: See README for complete description
export const PRIORITY = {
  HIGH:     100,
  STANDARD:  50, // the default (when not specified)
  LOW:       10,
};


// NOTE: See README for complete description
export default function featureRoute({content,
                                      priority=PRIORITY.STANDARD,
                                      ...unknownArgs}={}) {

  // validate parameters
  const check = verify.prefix('featureRoute() parameter violation: ');

  check(content,             'content is required');
  check(isFunction(content), 'content must be a function');

  check(Number.isInteger(priority), `priority (when supplied) must be an integer ... ${priority}`);

  const unknownArgKeys = Object.keys(unknownArgs);
  check(unknownArgKeys.length===0,  `unrecognized named parameter(s): ${unknownArgKeys}`);

  // embellish/return the supplied content
  content.routePriority = priority;
  return content;
}
