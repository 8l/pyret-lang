define(["js/runtime-util", "js/namespace", "js/ffi-helpers"], function(util, Namespace, ffi) {
  return util.memoModule("string-dict2", function(runtime, namespace) {
    return runtime.loadJSModules(namespace, [ffi], function(F) {

      var O = runtime.makeObject;
      var F = runtime.makeFunction;
      var arity = runtime.checkArity;
      var get = runtime.getField;

      var brandMutable = runtime.namedBrander("string-dict");
      var brandImmutable = runtime.namedBrander("string-dict");

      var annMutable = runtime.makeBranderAnn(brandMutable, "StringDict");
      var annImmutable = runtime.makeBranderAnn(brandImmutable, "ImmutableStringDict");

      function applyBrand(brand, val) {
        return get(brand, "brand").app(val);
      }

      // Prepend a space to avoid conflicting with built-in names
      function mutableKey(s) {
        return " " + s;
      }

      function makeMutableStringDict(underlyingDict) {
        // NOTE(joe): getMutable/setMutable etc are internal to
        // makeMutableStringDict because they need to close over underlyingDict
        var getMutable = runtime.makeMethodFromFun(function(_, key) {
          runtime.checkArity(2, arguments, "get");
          runtime.checkString(key);
          var mkey = mutableKey(key);
          if(!underlyingDict[mkey]) {
            runtime.ffi.throwMessageException("Key " + key + " not found");
          }
          return underlyingDict[mkey]
        });

        var setMutable = runtime.makeMethodFromFun(function(self, key, val) {
          runtime.checkArity(3, arguments, "get");
          runtime.checkString(key);
          runtime.checkPyretVal(val);
          underlyingDict[mutableKey(key)] = val;
          return self;
        });

        var NYI = runtime.makeMethodFromFun(function(self) {
          runtime.ffi.throwMessageException("Not yet implemented");
        });

        var obj = O({
          get: getMutable,
          set: setMutable,
          remove: NYI,
          keys: NYI,
          "has-key": NYI,
          _equals: NYI,
          _torepr: NYI
        });
        return applyBrand(brandMutable, obj);
      }

      function createMutableStringDict() {
        arity(0, arguments, "make-string-dict");
        return makeMutableStringDict({});
      }

      function createMutableStringDictFromArray(array) {
        arity(1, arguments, "string-dict");
        runtime.checkArray(array);
        var dict = {};
        var len = array.length;
        if(len % 2 !== 0) {
          runtime.ffi.throwMessageException("Expected an even number of arguments to constructor for mutable dictionaries, got array of length " + len);
        }
        for(var i = 0; i < len; i += 2) {
          var key = array[i];
          var val = array[i + 1];
          runtime.checkString(key);
          dict[mutableKey(key)] = val;
        }
        return makeMutableStringDict(dict);
      }

      var NYIF = F(function() {
        runtime.ffi.throwMessageException("Not yet implemented");
      });


      return O({
        "provide-plus-types": O({
          types: {
            StringDict: annMutable,
            ImmutableStringDict: annImmutable
          },
          values: O({
            "make-string-dict": F(createMutableStringDict),
            "string-dict": O({
              make: F(createMutableStringDictFromArray)
            }),
            "make-immutable-string-dict": NYIF,
            "immutable-string-dict": O({
              make: NYIF
            })
          })
        }),
        "answer": runtime.nothing
      });

    });
  });
});

