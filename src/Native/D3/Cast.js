Elm.Native.D3 = Elm.Native.D3 || {};
Elm.Native.D3.Cast = {};
Elm.Native.D3.Cast.make = function(elm) {
  'use strict';

  elm.Native = elm.Native || {};
  elm.Native.D3 = elm.Native.D3 || {};
  elm.Native.D3.Cast = elm.Native.D3.Cast || {};
  if (elm.Native.D3.Cast.values) return elm.Native.D3.Cast.values;

  function safeValfn(valfn, caster) {
    return typeof valfn == 'function'
      ? caster(valfn)
      : valfn;
  };

  function safeIndexed(i, valfn) {
    return typeof valfn == "function" && typeof i != "undefined"
      ? function(d, _) { return valfn.call(this, d, i); }
      : valfn;
  }

  function id(x) { return x; }

  return elm.Native.D3.Cast.values = {
    safeValfn : safeValfn,
    safeIndexed : safeIndexed,
    id : id
  };
};
