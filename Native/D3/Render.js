Elm.Native.D3 = Elm.Native.D3 || {};
Elm.Native.D3.Render = {};
Elm.Native.D3.Render.make = function(elm) {
  'use strict';

  elm.Native = elm.Native || {};
  elm.Native.D3 = elm.Native.D3 || {};
  elm.Native.D3.Render = elm.Native.D3.Render || {};
  if (elm.Native.D3.Render.values) return elm.Native.D3.Render.values;

  var newElement = Elm.Graphics.Element.make(elm).newElement;
  var id = Elm.Native.D3.Cast.make(elm).id;

  function run(k) {
    return function(selection) {
      return k(id, selection);
    };
  }

  function render(model) {
    var root = d3.select('body')
      .append('div')
      .datum(model.datum);
    var node = root.node();

    root.call(run(model.selection));

    return node;
  }

  function update(node, _old, _new) {
    d3.select(node)
        .datum(_new.datum)
        .call(run(_new.selection));

    return true;
  }

  function render_selection(width, height, selection, datum) {
    return A3(newElement, width, height, {
      'ctor'   : 'Custom',
      'type'   : 'D3',
      'render' : render,
      'update' : update,
      'model'  : { 
        'height' : height,
        'width' : width,
        'selection' : selection,
        'datum' : datum
      }
    });
  }

  return elm.Native.D3.Render.values = {
    render : F4(render_selection)
  };
}
