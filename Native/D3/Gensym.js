Elm.Native.D3 = Elm.Native.D3 || {};
Elm.Native.D3.Gensym = {};
Elm.Native.D3.Gensym.make = function(elm) {
  'use strict';

  elm.Native = elm.Native || {};
  elm.Native.D3 = elm.Native.D3 || {};
  elm.Native.D3.Gensym = elm.Native.D3.Gensym || {};
  if (elm.Native.D3.Gensym.values) return elm.Native.D3.Gensym.values;

  var i = 0;
  function gensym(str) {
    return str + (++i);
  }

  return elm.Native.D3.Gensym.values = {
    gensym : gensym
  };
};
