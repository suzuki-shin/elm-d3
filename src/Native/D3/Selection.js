Elm.Native.D3 = Elm.Native.D3 || {};
Elm.Native.D3.Selection = {};
Elm.Native.D3.Selection.make = function(elm) {
  'use strict';

  /*
   * A Brief Explanation of What's Going On
   *
   * At the core of D3 is the concept of a selection—a collection of DOM
   * elements to which you can associate data and apply transformations,
   * filters, and subselections. Some of these operations mutate elements in
   * the selection, while others create distinct subselections. The user
   * combines operations using either method chaining or by sequencing
   * statements in JavaScript, i.e., the semicolon.
   *
   * A selection encapsulates some state, operations transform that state and
   * then return to some implicit context that will apply further operations to
   * the selection. In other words an operation returns to some continuation.
   * This code models that pattern explicitly. A `Selection a` is a function
   * that takes a continuation and a selection, performs some stateful
   * operations to the selection, possibly creating a new one even, and then
   * passes that to the continuation. You can think of `Selection a` as being
   * an alias for a type that looks something like this:
   *
   *   (selection -> index -> unit) -> selection -> index -> unit
   *
   * This approach ensures that all operations that produce `Selection a`s are
   * pure functions. All effects are encapsulated in closures and deferred
   * until the Elm runtime decides that the `Selection a` should be rendered or
   * updated. In order to make the Elm runtime aware of the `Selection a`, you
   * have to turn it into an `Element` by calling the `render` function. You
   * can find the render function in the D3 Elm module. See Native/D3/Render.js
   * for its implementation.
   *
   * Note that the index parameter is introduced to support the `static`
   * selection below. The goal is to have static elements preserve both the
   * data and index of its context, as well as propagate that down other
   * selections. D3 typically does this bookeeping, but the implentation of
   * `static`—and in fact `static` as a concept—require that this library
   * perform the bookeeping explicity. See `bind` and `static` for situations
   * where the handing of the index are different than in all the other
   * functions.
   */

  elm.Native = elm.Native || {};
  elm.Native.D3 = elm.Native.D3 || {};
  elm.Native.D3.Selection = elm.Native.D3.Selection || {};
  if (elm.Native.D3.Selection.values) return elm.Native.D3.Selection.values;

  var JS = Elm.Native.D3.JavaScript.make(elm);
  var Json = Elm.Native.Json.make(elm);
  var Cast = Elm.Native.D3.Cast.make(elm);
  var Gensym = Elm.Native.D3.Gensym.make(elm);

  function safeJson(fn) {
    return function(a, i) {
      return Json.toJS(A2(fn, a, JS.toInt(i)));
    };
  }

  function safeOptEvaluator(fn) {
    return function (a, i) {
      var result = A2(fn, a, JS.toInt(i));
      return result.ctor == "Just" ? JS.fromString(result._0) : null;
    };
  }

  function safeEvaluator(fn) {
    return function (a, i) {
      return JS.fromString(A2(fn, a, JS.toInt(i)));
    };
  }

  function safePredicate(fn) {
    return function (a, i) {
      return JS.fromBool(A2(fn, a, JS.toInt(i)));
    };
  }

  function elm_sequence(s1, s2) {
    return function(k, selection, i) {
      s1(Cast.id, selection, i);
      s2(Cast.id, selection, i);
      return k(selection, i);
    };
  }

  function elm_chain(s1, s2) {
    return function(k, selection, i) {
      return s1(function(_selection, j) {
        return s2(k, _selection, j);
      }, selection, i);
    };
  }

  function elm_select(selector) {
    var selector = JS.fromString(selector);
    return function(k, selection, i) {
      return k(selection.select(selector), i);
    };
  }

  function elm_selectAll(selector) {
    var selector = JS.fromString(selector);
    return function(k, selection, i) {
      return k(selection.selectAll(selector), i);
    };
  }

  function elm_append(element) {
    var element = JS.fromString(element);
    return function(k, selection, i) {
      return k(selection.append(element), i);
    };
  }

  /* NB: Index bookkeeping is different, as bind ignores the index of the
   * context. */
  function elm_bind(s, fn) {
    return function(k, selection, i) {
      return s(function(_selection, _) {
        var bind = _selection.data(function (d) { return JS.fromList(fn(d)); });
        return k(bind);
      }, selection, i);
    };
  }

  function elm_chain_widget(w, s) {
    return function(k, selection, i) {
      return w(function(_selection, j) {
        s(Cast.id, _selection, j);
        return k(_selection, j);
      }, selection, i);
    };
  }

  function elm_embed(w) {
    return function(k, selection, i) {
      w(Cast.id, selection, i);
      return k(selection, i);
    }
  }

  function elm_enter(k, selection, i) {
    return k(selection.enter(), i);
  }

  function elm_exit(k, selection, i) {
    return k(selection.exit(), i);
  }

  function elm_update(k, selection, i) {
    return k(selection, i);
  }

  function elm_remove(k, selection, i) {
    return k(selection.remove(), i);
  }

  /* NB: Index bookkeeping is different, as static ignores the index of the
   * context. */
  function elm_static(element) {
    var element = JS.fromString(element),
        static_class = Gensym.gensym('static');

    return function(k, selection, i) {
      return selection.each(Cast.safeIndexed(i, function(d, i) {
        var s = d3.select(this),
            static_ = s.select('.' + static_class);

        static_ = static_.size() == 0 ? s.append(element) : static_;

        var result = k(static_, i);
        static_.classed(static_class, true);
        return result;
      }));
    };
  }

  function elm_classed(name, valfn) {
    name = JS.fromString(name);
    valfn = Cast.safeValfn(valfn, safePredicate);
    return function(k, selection, i) {
      return k(selection.classed(name, Cast.safeIndexed(i, valfn)), i);
    };
  }

  function elm_attr(name, valfn) {
    name = JS.fromString(name);
    valfn = Cast.safeValfn(valfn, safeEvaluator);
    return function(k, selection, i) {
      return k(selection.attr(name, Cast.safeIndexed(i, valfn)), i);
    };
  }

  function elm_style(name, valfn) {
    name = JS.fromString(name);
    valfn = Cast.safeValfn(valfn, safeEvaluator);
    return function(k, selection, i) {
      return k(selection.style(name, Cast.safeIndexed(i, valfn)), i);
    };
  }

  function elm_property(name, valfn) {
    name = JS.fromString(name);
    valfn = Cast.safeValfn(valfn, safeJson);
    return function(k, selection, i) {
      return k(selection.property(name, Cast.safeIndexed(i, valfn)), i);
    };
  }

  function elm_html(valfn) {
    valfn = Cast.safeValfn(valfn, safeEvaluator);
    return function(k, selection, i) {
      return k(selection.html(Cast.safeIndexed(i, valfn)), i);
    };
  }

  function elm_text(valfn) {
    valfn = Cast.safeValfn(valfn, safeEvaluator);
    return function(k, selection, i) {
      return k(selection.text(Cast.safeIndexed(i, valfn)), i);
    };
  }

  return elm.Native.D3.values = {
    version : JS.toString(d3.version),
    sequence : F2(elm_sequence),
    chain : F2(elm_chain),
    select : elm_select,
    selectAll : elm_selectAll,
    append : elm_append,
    static_ : elm_static,
    bind : F2(elm_bind),
    chain_widget : F2(elm_chain_widget),
    embed : elm_embed,
    enter : elm_enter,
    exit : elm_exit,
    update : elm_update,
    remove : elm_remove,
    classed : F2(elm_classed),
    attr : F2(elm_attr),
    style : F2(elm_style),
    property : F2(elm_property),
    html : elm_html,
    text : elm_text
  };
};
