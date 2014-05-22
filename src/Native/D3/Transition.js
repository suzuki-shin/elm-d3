Elm.Native.D3 = Elm.Native.D3 || {};
Elm.Native.D3.Transition = {};
Elm.Native.D3.Transition.make = function(elm) {
  'use strict';

  elm.Native = elm.Native || {};
  elm.Native.D3 = elm.Native.D3 || {};
  elm.Native.D3.Transition = elm.Native.D3.Transition || {};
  if (elm.Native.D3.Transition.values) return elm.Native.D3.Transition.values;

  var JS = Elm.Native.D3.JavaScript.make(elm);
  var Cast = Elm.Native.D3.Cast.make(elm);


  function safeTransition(fn) {
    return function (a, i) {
      return JS.fromInt(A2(fn, a, JS.toInt(i)));
    };
  }

  function elm_transition(k, selection, i) {
    return k(selection.transition(), i);
  }

  function elm_delay(valfn) {
    valfn = Cast.safeValfn(valfn, safeTransition);
    return function(k, selection, i) {
      return k(selection.delay(Cast.safeIndexed(i, valfn)), i);
    };
  }

  function elm_duration(valfn) {
    valfn = Cast.safeValfn(valfn);
    return function(k, selection, i) {
      return k(selection.duration(Cast.safeIndexed(i, valfn)), i);
    };
  }

  return elm.Native.D3.Transition.value = {
    transition : elm_transition,
    delay: elm_delay,
    duration : elm_duration
  };
};
