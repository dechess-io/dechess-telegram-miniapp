/*!
 * Stockfish.js (http://github.com/nmrugg/stockfish.js)
 * License: GPL
 */ var STOCKFISH = (function () {
  function load_stockfish(console, WasmPath) {
    if (
      typeof navigator !== 'undefined' &&
      (/MSIE|Trident|Edge/i.test(navigator.userAgent) ||
        (/Safari/i.test(navigator.userAgent) && !/Chrome|CriOS/i.test(navigator.userAgent)))
    ) {
      var dateNow = Date.now
    }
    var Module = { wasmBinaryFile: WasmPath }
    if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {}
    var moduleOverrides = {}
    for (var key in Module) {
      if (Module.hasOwnProperty(key)) {
        moduleOverrides[key] = Module[key]
      }
    }
    var ENVIRONMENT_IS_WEB = false
    var ENVIRONMENT_IS_WORKER = false
    var ENVIRONMENT_IS_NODE = false
    var ENVIRONMENT_IS_SHELL = false
    if (Module['ENVIRONMENT']) {
      if (Module['ENVIRONMENT'] === 'WEB') {
        ENVIRONMENT_IS_WEB = true
      } else if (Module['ENVIRONMENT'] === 'WORKER') {
        ENVIRONMENT_IS_WORKER = true
      } else if (Module['ENVIRONMENT'] === 'NODE') {
        ENVIRONMENT_IS_NODE = true
      } else if (Module['ENVIRONMENT'] === 'SHELL') {
        ENVIRONMENT_IS_SHELL = true
      } else {
        throw new Error(
          "The provided Module['ENVIRONMENT'] value is not valid. It must be one of: WEB|WORKER|NODE|SHELL."
        )
      }
    } else {
      ENVIRONMENT_IS_WEB = typeof window === 'object'
      ENVIRONMENT_IS_WORKER = typeof importScripts === 'function'
      ENVIRONMENT_IS_NODE =
        typeof process === 'object' &&
        typeof require === 'function' &&
        !ENVIRONMENT_IS_WEB &&
        !ENVIRONMENT_IS_WORKER
      ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER
    }
    if (ENVIRONMENT_IS_NODE) {
      if (!Module['print']) Module['print'] = console.log
      if (!Module['printErr']) Module['printErr'] = console.warn
      var nodeFS
      var nodePath
      Module['read'] = function shell_read(filename, binary) {
        if (!nodeFS) nodeFS = require('fs')
        if (!nodePath) nodePath = require('path')
        filename = nodePath['normalize'](filename)
        var ret = nodeFS['readFileSync'](filename)
        return binary ? ret : ret.toString()
      }
      Module['readBinary'] = function readBinary(filename) {
        var ret = Module['read'](filename, true)
        if (!ret.buffer) {
          ret = new Uint8Array(ret)
        }
        assert(ret.buffer)
        return ret
      }
      Module['load'] = function load(f) {
        globalEval(read(f))
      }
      if (!Module['thisProgram']) {
        if (process['argv'].length > 1) {
          Module['thisProgram'] = process['argv'][1].replace(/\\/g, '/')
        } else {
          Module['thisProgram'] = 'unknown-program'
        }
      }
      Module['arguments'] = process['argv'].slice(2)
      if (typeof module !== 'undefined') {
        module['exports'] = Module
      }
      process['on']('uncaughtException', function (ex) {
        if (!(ex instanceof ExitStatus)) {
          throw ex
        }
      })
      Module['inspect'] = function () {
        return '[Emscripten Module object]'
      }
    } else if (ENVIRONMENT_IS_SHELL) {
      if (!Module['print']) Module['print'] = print
      if (typeof printErr != 'undefined') Module['printErr'] = printErr
      if (typeof read != 'undefined') {
        Module['read'] = read
      } else {
        Module['read'] = function shell_read() {
          throw 'no read() available'
        }
      }
      Module['readBinary'] = function readBinary(f) {
        if (typeof readbuffer === 'function') {
          return new Uint8Array(readbuffer(f))
        }
        var data = read(f, 'binary')
        assert(typeof data === 'object')
        return data
      }
      if (typeof scriptArgs != 'undefined') {
        Module['arguments'] = scriptArgs
      } else if (typeof arguments != 'undefined') {
        Module['arguments'] = arguments
      }
      if (typeof quit === 'function') {
        Module['quit'] = function (status, toThrow) {
          quit(status)
        }
      }
    } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      Module['read'] = function shell_read(url) {
        var xhr = new XMLHttpRequest()
        xhr.open('GET', url, false)
        xhr.send(null)
        return xhr.responseText
      }
      if (ENVIRONMENT_IS_WORKER) {
        Module['readBinary'] = function readBinary(url) {
          var xhr = new XMLHttpRequest()
          xhr.open('GET', url, false)
          xhr.responseType = 'arraybuffer'
          xhr.send(null)
          return new Uint8Array(xhr.response)
        }
      }
      Module['readAsync'] = function readAsync(url, onload, onerror) {
        var xhr = new XMLHttpRequest()
        xhr.open('GET', url, true)
        xhr.responseType = 'arraybuffer'
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
            onload(xhr.response)
          } else {
            onerror()
          }
        }
        xhr.onerror = onerror
        xhr.send(null)
      }
      if (typeof arguments != 'undefined') {
        Module['arguments'] = arguments
      }
      if (typeof console !== 'undefined') {
        if (!Module['print'])
          Module['print'] = function shell_print(x) {
            console.log(x)
          }
        if (!Module['printErr'])
          Module['printErr'] = function shell_printErr(x) {
            console.warn(x)
          }
      } else {
        var TRY_USE_DUMP = false
        if (!Module['print'])
          Module['print'] =
            TRY_USE_DUMP && typeof dump !== 'undefined'
              ? function (x) {
                  dump(x)
                }
              : function (x) {}
      }
      if (ENVIRONMENT_IS_WORKER) {
        Module['load'] = importScripts
      }
      if (typeof Module['setWindowTitle'] === 'undefined') {
        Module['setWindowTitle'] = function (title) {
          document.title = title
        }
      }
    } else {
      throw 'Unknown runtime environment. Where are we?'
    }
    function globalEval(x) {
      eval.call(null, x)
    }
    if (!Module['load'] && Module['read']) {
      Module['load'] = function load(f) {
        globalEval(Module['read'](f))
      }
    }
    if (!Module['print']) {
      Module['print'] = function () {}
    }
    if (!Module['printErr']) {
      Module['printErr'] = Module['print']
    }
    if (!Module['arguments']) {
      Module['arguments'] = []
    }
    if (!Module['thisProgram']) {
      Module['thisProgram'] = './this.program'
    }
    if (!Module['quit']) {
      Module['quit'] = function (status, toThrow) {
        throw toThrow
      }
    }
    Module.print = Module['print']
    Module.printErr = Module['printErr']
    Module['preRun'] = []
    Module['postRun'] = []
    for (var key in moduleOverrides) {
      if (moduleOverrides.hasOwnProperty(key)) {
        Module[key] = moduleOverrides[key]
      }
    }
    moduleOverrides = undefined
    var Runtime = {
      setTempRet0: function (value) {
        tempRet0 = value
        return value
      },
      getTempRet0: function () {
        return tempRet0
      },
      stackSave: function () {
        return STACKTOP
      },
      stackRestore: function (stackTop) {
        STACKTOP = stackTop
      },
      getNativeTypeSize: function (type) {
        switch (type) {
          case 'i1':
          case 'i8':
            return 1
          case 'i16':
            return 2
          case 'i32':
            return 4
          case 'i64':
            return 8
          case 'float':
            return 4
          case 'double':
            return 8
          default: {
            if (type[type.length - 1] === '*') {
              return Runtime.QUANTUM_SIZE
            } else if (type[0] === 'i') {
              var bits = parseInt(type.substr(1))
              assert(bits % 8 === 0)
              return bits / 8
            } else {
              return 0
            }
          }
        }
      },
      getNativeFieldSize: function (type) {
        return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE)
      },
      STACK_ALIGN: 16,
      prepVararg: function (ptr, type) {
        if (type === 'double' || type === 'i64') {
          if (ptr & 7) {
            assert((ptr & 7) === 4)
            ptr += 4
          }
        } else {
          assert((ptr & 3) === 0)
        }
        return ptr
      },
      getAlignSize: function (type, size, vararg) {
        if (!vararg && (type == 'i64' || type == 'double')) return 8
        if (!type) return Math.min(size, 8)
        return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE)
      },
      dynCall: function (sig, ptr, args) {
        if (args && args.length) {
          return Module['dynCall_' + sig].apply(null, [ptr].concat(args))
        } else {
          return Module['dynCall_' + sig].call(null, ptr)
        }
      },
      functionPointers: [],
      addFunction: function (func) {
        for (var i = 0; i < Runtime.functionPointers.length; i++) {
          if (!Runtime.functionPointers[i]) {
            Runtime.functionPointers[i] = func
            return 2 * (1 + i)
          }
        }
        throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.'
      },
      removeFunction: function (index) {
        Runtime.functionPointers[(index - 2) / 2] = null
      },
      warnOnce: function (text) {
        if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {}
        if (!Runtime.warnOnce.shown[text]) {
          Runtime.warnOnce.shown[text] = 1
          Module.printErr(text)
        }
      },
      funcWrappers: {},
      getFuncWrapper: function (func, sig) {
        if (!func) return
        assert(sig)
        if (!Runtime.funcWrappers[sig]) {
          Runtime.funcWrappers[sig] = {}
        }
        var sigCache = Runtime.funcWrappers[sig]
        if (!sigCache[func]) {
          if (sig.length === 1) {
            sigCache[func] = function dynCall_wrapper() {
              return Runtime.dynCall(sig, func)
            }
          } else if (sig.length === 2) {
            sigCache[func] = function dynCall_wrapper(arg) {
              return Runtime.dynCall(sig, func, [arg])
            }
          } else {
            sigCache[func] = function dynCall_wrapper() {
              return Runtime.dynCall(sig, func, Array.prototype.slice.call(arguments))
            }
          }
        }
        return sigCache[func]
      },
      getCompilerSetting: function (name) {
        throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work'
      },
      stackAlloc: function (size) {
        var ret = STACKTOP
        STACKTOP = (STACKTOP + size) | 0
        STACKTOP = (STACKTOP + 15) & -16
        return ret
      },
      staticAlloc: function (size) {
        var ret = STATICTOP
        STATICTOP = (STATICTOP + size) | 0
        STATICTOP = (STATICTOP + 15) & -16
        return ret
      },
      dynamicAlloc: function (size) {
        var ret = HEAP32[DYNAMICTOP_PTR >> 2]
        var end = ((ret + size + 15) | 0) & -16
        HEAP32[DYNAMICTOP_PTR >> 2] = end
        if (end >= TOTAL_MEMORY) {
          var success = enlargeMemory()
          if (!success) {
            HEAP32[DYNAMICTOP_PTR >> 2] = ret
            return 0
          }
        }
        return ret
      },
      alignMemory: function (size, quantum) {
        var ret = (size = Math.ceil(size / (quantum ? quantum : 16)) * (quantum ? quantum : 16))
        return ret
      },
      makeBigInt: function (low, high, unsigned) {
        var ret = unsigned
          ? +(low >>> 0) + +(high >>> 0) * 4294967296
          : +(low >>> 0) + +(high | 0) * 4294967296
        return ret
      },
      GLOBAL_BASE: 1024,
      QUANTUM_SIZE: 4,
      __dummy__: 0,
    }
    Module['Runtime'] = Runtime
    var ABORT = 0
    var EXITSTATUS = 0
    function assert(condition, text) {
      if (!condition) {
        abort('Assertion failed: ' + text)
      }
    }
    function getCFunc(ident) {
      var func = Module['_' + ident]
      if (!func) {
        try {
          func = eval('_' + ident)
        } catch (e) {}
      }
      assert(
        func,
        'Cannot call unknown function ' +
          ident +
          ' (perhaps LLVM optimizations or closure removed it?)'
      )
      return func
    }
    var cwrap, ccall
    ;(function () {
      var JSfuncs = {
        stackSave: function () {
          Runtime.stackSave()
        },
        stackRestore: function () {
          Runtime.stackRestore()
        },
        arrayToC: function (arr) {
          var ret = Runtime.stackAlloc(arr.length)
          writeArrayToMemory(arr, ret)
          return ret
        },
        stringToC: function (str) {
          var ret = 0
          if (str !== null && str !== undefined && str !== 0) {
            var len = (str.length << 2) + 1
            ret = Runtime.stackAlloc(len)
            stringToUTF8(str, ret, len)
          }
          return ret
        },
      }
      var toC = { string: JSfuncs['stringToC'], array: JSfuncs['arrayToC'] }
      ccall = function ccallFunc(ident, returnType, argTypes, args, opts) {
        var func = getCFunc(ident)
        var cArgs = []
        var stack = 0
        if (args) {
          for (var i = 0; i < args.length; i++) {
            var converter = toC[argTypes[i]]
            if (converter) {
              if (stack === 0) stack = Runtime.stackSave()
              cArgs[i] = converter(args[i])
            } else {
              cArgs[i] = args[i]
            }
          }
        }
        var ret = func.apply(null, cArgs)
        if (returnType === 'string') ret = Pointer_stringify(ret)
        if (stack !== 0) {
          if (opts && opts.async) {
            EmterpreterAsync.asyncFinalizers.push(function () {
              Runtime.stackRestore(stack)
            })
            return
          }
          Runtime.stackRestore(stack)
        }
        return ret
      }
      var sourceRegex =
        /^function\s*[a-zA-Z$_0-9]*\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/
      function parseJSFunc(jsfunc) {
        var parsed = jsfunc.toString().match(sourceRegex).slice(1)
        return { arguments: parsed[0], body: parsed[1], returnValue: parsed[2] }
      }
      var JSsource = null
      function ensureJSsource() {
        if (!JSsource) {
          JSsource = {}
          for (var fun in JSfuncs) {
            if (JSfuncs.hasOwnProperty(fun)) {
              JSsource[fun] = parseJSFunc(JSfuncs[fun])
            }
          }
        }
      }
      cwrap = function cwrap(ident, returnType, argTypes) {
        argTypes = argTypes || []
        var cfunc = getCFunc(ident)
        var numericArgs = argTypes.every(function (type) {
          return type === 'number'
        })
        var numericRet = returnType !== 'string'
        if (numericRet && numericArgs) {
          return cfunc
        }
        var argNames = argTypes.map(function (x, i) {
          return '$' + i
        })
        var funcstr = '(function(' + argNames.join(',') + ') {'
        var nargs = argTypes.length
        if (!numericArgs) {
          ensureJSsource()
          funcstr += 'var stack = ' + JSsource['stackSave'].body + ';'
          for (var i = 0; i < nargs; i++) {
            var arg = argNames[i],
              type = argTypes[i]
            if (type === 'number') continue
            var convertCode = JSsource[type + 'ToC']
            funcstr += 'var ' + convertCode.arguments + ' = ' + arg + ';'
            funcstr += convertCode.body + ';'
            funcstr += arg + '=(' + convertCode.returnValue + ');'
          }
        }
        var cfuncname = parseJSFunc(function () {
          return cfunc
        }).returnValue
        funcstr += 'var ret = ' + cfuncname + '(' + argNames.join(',') + ');'
        if (!numericRet) {
          var strgfy = parseJSFunc(function () {
            return Pointer_stringify
          }).returnValue
          funcstr += 'ret = ' + strgfy + '(ret);'
        }
        if (!numericArgs) {
          ensureJSsource()
          funcstr += JSsource['stackRestore'].body.replace('()', '(stack)') + ';'
        }
        funcstr += 'return ret})'
        return eval(funcstr)
      }
    })()
    Module['ccall'] = ccall
    Module['cwrap'] = cwrap
    function setValue(ptr, value, type, noSafe) {
      type = type || 'i8'
      if (type.charAt(type.length - 1) === '*') type = 'i32'
      switch (type) {
        case 'i1':
          HEAP8[ptr >> 0] = value
          break
        case 'i8':
          HEAP8[ptr >> 0] = value
          break
        case 'i16':
          HEAP16[ptr >> 1] = value
          break
        case 'i32':
          HEAP32[ptr >> 2] = value
          break
        case 'i64':
          ;(tempI64 = [
            value >>> 0,
            ((tempDouble = value),
            +Math_abs(tempDouble) >= 1
              ? tempDouble > 0
                ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
                : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (HEAP32[ptr >> 2] = tempI64[0]),
            (HEAP32[(ptr + 4) >> 2] = tempI64[1])
          break
        case 'float':
          HEAPF32[ptr >> 2] = value
          break
        case 'double':
          HEAPF64[ptr >> 3] = value
          break
        default:
          abort('invalid type for setValue: ' + type)
      }
    }
    Module['setValue'] = setValue
    function getValue(ptr, type, noSafe) {
      type = type || 'i8'
      if (type.charAt(type.length - 1) === '*') type = 'i32'
      switch (type) {
        case 'i1':
          return HEAP8[ptr >> 0]
        case 'i8':
          return HEAP8[ptr >> 0]
        case 'i16':
          return HEAP16[ptr >> 1]
        case 'i32':
          return HEAP32[ptr >> 2]
        case 'i64':
          return HEAP32[ptr >> 2]
        case 'float':
          return HEAPF32[ptr >> 2]
        case 'double':
          return HEAPF64[ptr >> 3]
        default:
          abort('invalid type for setValue: ' + type)
      }
      return null
    }
    Module['getValue'] = getValue
    var ALLOC_NORMAL = 0
    var ALLOC_STACK = 1
    var ALLOC_STATIC = 2
    var ALLOC_DYNAMIC = 3
    var ALLOC_NONE = 4
    Module['ALLOC_NORMAL'] = ALLOC_NORMAL
    Module['ALLOC_STACK'] = ALLOC_STACK
    Module['ALLOC_STATIC'] = ALLOC_STATIC
    Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC
    Module['ALLOC_NONE'] = ALLOC_NONE
    function allocate(slab, types, allocator, ptr) {
      var zeroinit, size
      if (typeof slab === 'number') {
        zeroinit = true
        size = slab
      } else {
        zeroinit = false
        size = slab.length
      }
      var singleType = typeof types === 'string' ? types : null
      var ret
      if (allocator == ALLOC_NONE) {
        ret = ptr
      } else {
        ret = [
          typeof _malloc === 'function' ? _malloc : Runtime.staticAlloc,
          Runtime.stackAlloc,
          Runtime.staticAlloc,
          Runtime.dynamicAlloc,
        ][allocator === undefined ? ALLOC_STATIC : allocator](
          Math.max(size, singleType ? 1 : types.length)
        )
      }
      if (zeroinit) {
        var ptr = ret,
          stop
        assert((ret & 3) == 0)
        stop = ret + (size & ~3)
        for (; ptr < stop; ptr += 4) {
          HEAP32[ptr >> 2] = 0
        }
        stop = ret + size
        while (ptr < stop) {
          HEAP8[ptr++ >> 0] = 0
        }
        return ret
      }
      if (singleType === 'i8') {
        if (slab.subarray || slab.slice) {
          HEAPU8.set(slab, ret)
        } else {
          HEAPU8.set(new Uint8Array(slab), ret)
        }
        return ret
      }
      var i = 0,
        type,
        typeSize,
        previousType
      while (i < size) {
        var curr = slab[i]
        if (typeof curr === 'function') {
          curr = Runtime.getFunctionIndex(curr)
        }
        type = singleType || types[i]
        if (type === 0) {
          i++
          continue
        }
        if (type == 'i64') type = 'i32'
        setValue(ret + i, curr, type)
        if (previousType !== type) {
          typeSize = Runtime.getNativeTypeSize(type)
          previousType = type
        }
        i += typeSize
      }
      return ret
    }
    Module['allocate'] = allocate
    function getMemory(size) {
      if (!staticSealed) return Runtime.staticAlloc(size)
      if (!runtimeInitialized) return Runtime.dynamicAlloc(size)
      return _malloc(size)
    }
    Module['getMemory'] = getMemory
    function Pointer_stringify(ptr, length) {
      if (length === 0 || !ptr) return ''
      var hasUtf = 0
      var t
      var i = 0
      while (1) {
        t = HEAPU8[(ptr + i) >> 0]
        hasUtf |= t
        if (t == 0 && !length) break
        i++
        if (length && i == length) break
      }
      if (!length) length = i
      var ret = ''
      if (hasUtf < 128) {
        var MAX_CHUNK = 1024
        var curr
        while (length > 0) {
          curr = String.fromCharCode.apply(
            String,
            HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK))
          )
          ret = ret ? ret + curr : curr
          ptr += MAX_CHUNK
          length -= MAX_CHUNK
        }
        return ret
      }
      return Module['UTF8ToString'](ptr)
    }
    Module['Pointer_stringify'] = Pointer_stringify
    function AsciiToString(ptr) {
      var str = ''
      while (1) {
        var ch = HEAP8[ptr++ >> 0]
        if (!ch) return str
        str += String.fromCharCode(ch)
      }
    }
    Module['AsciiToString'] = AsciiToString
    function stringToAscii(str, outPtr) {
      return writeAsciiToMemory(str, outPtr, false)
    }
    Module['stringToAscii'] = stringToAscii
    var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined
    function UTF8ArrayToString(u8Array, idx) {
      var endPtr = idx
      while (u8Array[endPtr]) ++endPtr
      if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
        return UTF8Decoder.decode(u8Array.subarray(idx, endPtr))
      } else {
        var u0, u1, u2, u3, u4, u5
        var str = ''
        while (1) {
          u0 = u8Array[idx++]
          if (!u0) return str
          if (!(u0 & 128)) {
            str += String.fromCharCode(u0)
            continue
          }
          u1 = u8Array[idx++] & 63
          if ((u0 & 224) == 192) {
            str += String.fromCharCode(((u0 & 31) << 6) | u1)
            continue
          }
          u2 = u8Array[idx++] & 63
          if ((u0 & 240) == 224) {
            u0 = ((u0 & 15) << 12) | (u1 << 6) | u2
          } else {
            u3 = u8Array[idx++] & 63
            if ((u0 & 248) == 240) {
              u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | u3
            } else {
              u4 = u8Array[idx++] & 63
              if ((u0 & 252) == 248) {
                u0 = ((u0 & 3) << 24) | (u1 << 18) | (u2 << 12) | (u3 << 6) | u4
              } else {
                u5 = u8Array[idx++] & 63
                u0 = ((u0 & 1) << 30) | (u1 << 24) | (u2 << 18) | (u3 << 12) | (u4 << 6) | u5
              }
            }
          }
          if (u0 < 65536) {
            str += String.fromCharCode(u0)
          } else {
            var ch = u0 - 65536
            str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023))
          }
        }
      }
    }
    Module['UTF8ArrayToString'] = UTF8ArrayToString
    function UTF8ToString(ptr) {
      return UTF8ArrayToString(HEAPU8, ptr)
    }
    Module['UTF8ToString'] = UTF8ToString
    function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
      if (!(maxBytesToWrite > 0)) return 0
      var startIdx = outIdx
      var endIdx = outIdx + maxBytesToWrite - 1
      for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i)
        if (u >= 55296 && u <= 57343)
          u = (65536 + ((u & 1023) << 10)) | (str.charCodeAt(++i) & 1023)
        if (u <= 127) {
          if (outIdx >= endIdx) break
          outU8Array[outIdx++] = u
        } else if (u <= 2047) {
          if (outIdx + 1 >= endIdx) break
          outU8Array[outIdx++] = 192 | (u >> 6)
          outU8Array[outIdx++] = 128 | (u & 63)
        } else if (u <= 65535) {
          if (outIdx + 2 >= endIdx) break
          outU8Array[outIdx++] = 224 | (u >> 12)
          outU8Array[outIdx++] = 128 | ((u >> 6) & 63)
          outU8Array[outIdx++] = 128 | (u & 63)
        } else if (u <= 2097151) {
          if (outIdx + 3 >= endIdx) break
          outU8Array[outIdx++] = 240 | (u >> 18)
          outU8Array[outIdx++] = 128 | ((u >> 12) & 63)
          outU8Array[outIdx++] = 128 | ((u >> 6) & 63)
          outU8Array[outIdx++] = 128 | (u & 63)
        } else if (u <= 67108863) {
          if (outIdx + 4 >= endIdx) break
          outU8Array[outIdx++] = 248 | (u >> 24)
          outU8Array[outIdx++] = 128 | ((u >> 18) & 63)
          outU8Array[outIdx++] = 128 | ((u >> 12) & 63)
          outU8Array[outIdx++] = 128 | ((u >> 6) & 63)
          outU8Array[outIdx++] = 128 | (u & 63)
        } else {
          if (outIdx + 5 >= endIdx) break
          outU8Array[outIdx++] = 252 | (u >> 30)
          outU8Array[outIdx++] = 128 | ((u >> 24) & 63)
          outU8Array[outIdx++] = 128 | ((u >> 18) & 63)
          outU8Array[outIdx++] = 128 | ((u >> 12) & 63)
          outU8Array[outIdx++] = 128 | ((u >> 6) & 63)
          outU8Array[outIdx++] = 128 | (u & 63)
        }
      }
      outU8Array[outIdx] = 0
      return outIdx - startIdx
    }
    Module['stringToUTF8Array'] = stringToUTF8Array
    function stringToUTF8(str, outPtr, maxBytesToWrite) {
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
    }
    Module['stringToUTF8'] = stringToUTF8
    function lengthBytesUTF8(str) {
      var len = 0
      for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i)
        if (u >= 55296 && u <= 57343)
          u = (65536 + ((u & 1023) << 10)) | (str.charCodeAt(++i) & 1023)
        if (u <= 127) {
          ++len
        } else if (u <= 2047) {
          len += 2
        } else if (u <= 65535) {
          len += 3
        } else if (u <= 2097151) {
          len += 4
        } else if (u <= 67108863) {
          len += 5
        } else {
          len += 6
        }
      }
      return len
    }
    Module['lengthBytesUTF8'] = lengthBytesUTF8
    var UTF16Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-16le') : undefined
    function demangle(func) {
      var __cxa_demangle_func = Module['___cxa_demangle'] || Module['__cxa_demangle']
      if (__cxa_demangle_func) {
        try {
          var s = func.substr(1)
          var len = lengthBytesUTF8(s) + 1
          var buf = _malloc(len)
          stringToUTF8(s, buf, len)
          var status = _malloc(4)
          var ret = __cxa_demangle_func(buf, 0, 0, status)
          if (getValue(status, 'i32') === 0 && ret) {
            return Pointer_stringify(ret)
          }
        } catch (e) {
        } finally {
          if (buf) _free(buf)
          if (status) _free(status)
          if (ret) _free(ret)
        }
        return func
      }
      Runtime.warnOnce(
        'warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling'
      )
      return func
    }
    function demangleAll(text) {
      var regex = /__Z[\w\d_]+/g
      return text.replace(regex, function (x) {
        var y = demangle(x)
        return x === y ? x : x + ' [' + y + ']'
      })
    }
    function jsStackTrace() {
      var err = new Error()
      if (!err.stack) {
        try {
          throw new Error(0)
        } catch (e) {
          err = e
        }
        if (!err.stack) {
          return '(no stack trace available)'
        }
      }
      return err.stack.toString()
    }
    function stackTrace() {
      var js = jsStackTrace()
      if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']()
      return demangleAll(js)
    }
    Module['stackTrace'] = stackTrace
    var WASM_PAGE_SIZE = 65536
    var ASMJS_PAGE_SIZE = 16777216
    function alignUp(x, multiple) {
      if (x % multiple > 0) {
        x += multiple - (x % multiple)
      }
      return x
    }
    var HEAP, buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64
    function updateGlobalBuffer(buf) {
      Module['buffer'] = buffer = buf
    }
    function updateGlobalBufferViews() {
      Module['HEAP8'] = HEAP8 = new Int8Array(buffer)
      Module['HEAP16'] = HEAP16 = new Int16Array(buffer)
      Module['HEAP32'] = HEAP32 = new Int32Array(buffer)
      Module['HEAPU8'] = HEAPU8 = new Uint8Array(buffer)
      Module['HEAPU16'] = HEAPU16 = new Uint16Array(buffer)
      Module['HEAPU32'] = HEAPU32 = new Uint32Array(buffer)
      Module['HEAPF32'] = HEAPF32 = new Float32Array(buffer)
      Module['HEAPF64'] = HEAPF64 = new Float64Array(buffer)
    }
    var STATIC_BASE, STATICTOP, staticSealed
    var STACK_BASE, STACKTOP, STACK_MAX
    var DYNAMIC_BASE, DYNAMICTOP_PTR
    STATIC_BASE = STATICTOP = STACK_BASE = STACKTOP = STACK_MAX = DYNAMIC_BASE = DYNAMICTOP_PTR = 0
    staticSealed = false
    function abortOnCannotGrowMemory() {
      abort(
        'Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value ' +
          TOTAL_MEMORY +
          ', (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 '
      )
    }
    function enlargeMemory() {
      abortOnCannotGrowMemory()
    }
    var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880
    var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 67108864
    if (TOTAL_MEMORY < TOTAL_STACK)
      Module.printErr(
        'TOTAL_MEMORY should be larger than TOTAL_STACK, was ' +
          TOTAL_MEMORY +
          '! (TOTAL_STACK=' +
          TOTAL_STACK +
          ')'
      )
    if (Module['buffer']) {
      buffer = Module['buffer']
    } else {
      if (typeof WebAssembly === 'object' && typeof WebAssembly.Memory === 'function') {
        Module['wasmMemory'] = new WebAssembly.Memory({
          initial: TOTAL_MEMORY / WASM_PAGE_SIZE,
          maximum: TOTAL_MEMORY / WASM_PAGE_SIZE,
        })
        buffer = Module['wasmMemory'].buffer
      } else {
        buffer = new ArrayBuffer(TOTAL_MEMORY)
      }
    }
    updateGlobalBufferViews()
    function getTotalMemory() {
      return TOTAL_MEMORY
    }
    HEAP32[0] = 1668509029
    HEAP16[1] = 25459
    if (HEAPU8[2] !== 115 || HEAPU8[3] !== 99)
      throw 'Runtime error: expected the system to be little-endian!'
    Module['HEAP'] = HEAP
    Module['buffer'] = buffer
    Module['HEAP8'] = HEAP8
    Module['HEAP16'] = HEAP16
    Module['HEAP32'] = HEAP32
    Module['HEAPU8'] = HEAPU8
    Module['HEAPU16'] = HEAPU16
    Module['HEAPU32'] = HEAPU32
    Module['HEAPF32'] = HEAPF32
    Module['HEAPF64'] = HEAPF64
    function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        var callback = callbacks.shift()
        if (typeof callback == 'function') {
          callback()
          continue
        }
        var func = callback.func
        if (typeof func === 'number') {
          if (callback.arg === undefined) {
            Module['dynCall_v'](func)
          } else {
            Module['dynCall_vi'](func, callback.arg)
          }
        } else {
          func(callback.arg === undefined ? null : callback.arg)
        }
      }
    }
    var __ATPRERUN__ = []
    var __ATINIT__ = []
    var __ATMAIN__ = []
    var __ATEXIT__ = []
    var __ATPOSTRUN__ = []
    var runtimeInitialized = false
    var runtimeExited = false
    function preRun() {
      if (Module['preRun']) {
        if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']]
        while (Module['preRun'].length) {
          addOnPreRun(Module['preRun'].shift())
        }
      }
      callRuntimeCallbacks(__ATPRERUN__)
    }
    function ensureInitRuntime() {
      if (runtimeInitialized) return
      runtimeInitialized = true
      callRuntimeCallbacks(__ATINIT__)
    }
    function preMain() {
      callRuntimeCallbacks(__ATMAIN__)
    }
    function exitRuntime() {
      callRuntimeCallbacks(__ATEXIT__)
      runtimeExited = true
    }
    function postRun() {
      if (Module['postRun']) {
        if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']]
        while (Module['postRun'].length) {
          addOnPostRun(Module['postRun'].shift())
        }
      }
      callRuntimeCallbacks(__ATPOSTRUN__)
    }
    function addOnPreRun(cb) {
      __ATPRERUN__.unshift(cb)
    }
    Module['addOnPreRun'] = addOnPreRun
    function addOnInit(cb) {
      __ATINIT__.unshift(cb)
    }
    Module['addOnInit'] = addOnInit
    function addOnPreMain(cb) {
      __ATMAIN__.unshift(cb)
    }
    Module['addOnPreMain'] = addOnPreMain
    function addOnExit(cb) {
      __ATEXIT__.unshift(cb)
    }
    Module['addOnExit'] = addOnExit
    function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb)
    }
    Module['addOnPostRun'] = addOnPostRun
    function intArrayFromString(stringy, dontAddNull, length) {
      var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1
      var u8array = new Array(len)
      var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length)
      if (dontAddNull) u8array.length = numBytesWritten
      return u8array
    }
    Module['intArrayFromString'] = intArrayFromString
    function intArrayToString(array) {
      var ret = []
      for (var i = 0; i < array.length; i++) {
        var chr = array[i]
        if (chr > 255) {
          chr &= 255
        }
        ret.push(String.fromCharCode(chr))
      }
      return ret.join('')
    }
    Module['intArrayToString'] = intArrayToString
    function writeStringToMemory(string, buffer, dontAddNull) {
      Runtime.warnOnce(
        'writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!'
      )
      var lastChar, end
      if (dontAddNull) {
        end = buffer + lengthBytesUTF8(string)
        lastChar = HEAP8[end]
      }
      stringToUTF8(string, buffer, Infinity)
      if (dontAddNull) HEAP8[end] = lastChar
    }
    Module['writeStringToMemory'] = writeStringToMemory
    function writeArrayToMemory(array, buffer) {
      HEAP8.set(array, buffer)
    }
    Module['writeArrayToMemory'] = writeArrayToMemory
    function writeAsciiToMemory(str, buffer, dontAddNull) {
      for (var i = 0; i < str.length; ++i) {
        HEAP8[buffer++ >> 0] = str.charCodeAt(i)
      }
      if (!dontAddNull) HEAP8[buffer >> 0] = 0
    }
    Module['writeAsciiToMemory'] = writeAsciiToMemory
    if (!Math['imul'] || Math['imul'](4294967295, 5) !== -5)
      Math['imul'] = function imul(a, b) {
        var ah = a >>> 16
        var al = a & 65535
        var bh = b >>> 16
        var bl = b & 65535
        return (al * bl + ((ah * bl + al * bh) << 16)) | 0
      }
    Math.imul = Math['imul']
    if (!Math['fround']) {
      var froundBuffer = new Float32Array(1)
      Math['fround'] = function (x) {
        froundBuffer[0] = x
        return froundBuffer[0]
      }
    }
    Math.fround = Math['fround']
    if (!Math['clz32'])
      Math['clz32'] = function (x) {
        x = x >>> 0
        for (var i = 0; i < 32; i++) {
          if (x & (1 << (31 - i))) return i
        }
        return 32
      }
    Math.clz32 = Math['clz32']
    if (!Math['trunc'])
      Math['trunc'] = function (x) {
        return x < 0 ? Math.ceil(x) : Math.floor(x)
      }
    Math.trunc = Math['trunc']
    var Math_abs = Math.abs
    var Math_cos = Math.cos
    var Math_sin = Math.sin
    var Math_tan = Math.tan
    var Math_acos = Math.acos
    var Math_asin = Math.asin
    var Math_atan = Math.atan
    var Math_atan2 = Math.atan2
    var Math_exp = Math.exp
    var Math_log = Math.log
    var Math_sqrt = Math.sqrt
    var Math_ceil = Math.ceil
    var Math_floor = Math.floor
    var Math_pow = Math.pow
    var Math_imul = Math.imul
    var Math_fround = Math.fround
    var Math_round = Math.round
    var Math_min = Math.min
    var Math_clz32 = Math.clz32
    var Math_trunc = Math.trunc
    var runDependencies = 0
    var runDependencyWatcher = null
    var dependenciesFulfilled = null
    function getUniqueRunDependency(id) {
      return id
    }
    function addRunDependency(id) {
      runDependencies++
      if (Module['monitorRunDependencies']) {
        Module['monitorRunDependencies'](runDependencies)
      }
    }
    Module['addRunDependency'] = addRunDependency
    function removeRunDependency(id) {
      runDependencies--
      if (Module['monitorRunDependencies']) {
        Module['monitorRunDependencies'](runDependencies)
      }
      if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
          clearInterval(runDependencyWatcher)
          runDependencyWatcher = null
        }
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled
          dependenciesFulfilled = null
          callback()
        }
      }
    }
    Module['removeRunDependency'] = removeRunDependency
    Module['preloadedImages'] = {}
    Module['preloadedAudios'] = {}
    var memoryInitializer = null
    function integrateWasmJS() {
      var method = Module['wasmJSMethod'] || 'native-wasm'
      Module['wasmJSMethod'] = method
      var wasmTextFile = Module['wasmTextFile'] || 'stockfish.wast'
      var wasmBinaryFile = Module['wasmBinaryFile'] || 'stockfish.wasm'
      var asmjsCodeFile = Module['asmjsCodeFile'] || 'stockfish.temp.asm.js'
      if (typeof Module['locateFile'] === 'function') {
        wasmTextFile = Module['locateFile'](wasmTextFile)
        wasmBinaryFile = Module['locateFile'](wasmBinaryFile)
        asmjsCodeFile = Module['locateFile'](asmjsCodeFile)
      }
      var wasmPageSize = 64 * 1024
      var asm2wasmImports = {
        'f64-rem': function (x, y) {
          return x % y
        },
        'f64-to-int': function (x) {
          return x | 0
        },
        'i32s-div': function (x, y) {
          return ((x | 0) / (y | 0)) | 0
        },
        'i32u-div': function (x, y) {
          return ((x >>> 0) / (y >>> 0)) >>> 0
        },
        'i32s-rem': function (x, y) {
          return (x | 0) % (y | 0) | 0
        },
        'i32u-rem': function (x, y) {
          return (x >>> 0) % (y >>> 0) >>> 0
        },
        debugger: function () {
          debugger
        },
      }
      var info = { global: null, env: null, asm2wasm: asm2wasmImports, parent: Module }
      var exports = null
      function lookupImport(mod, base) {
        var lookup = info
        if (mod.indexOf('.') < 0) {
          lookup = (lookup || {})[mod]
        } else {
          var parts = mod.split('.')
          lookup = (lookup || {})[parts[0]]
          lookup = (lookup || {})[parts[1]]
        }
        if (base) {
          lookup = (lookup || {})[base]
        }
        if (lookup === undefined) {
          abort('bad lookupImport to (' + mod + ').' + base)
        }
        return lookup
      }
      function mergeMemory(newBuffer) {
        var oldBuffer = Module['buffer']
        if (newBuffer.byteLength < oldBuffer.byteLength) {
          Module['printErr'](
            'the new buffer in mergeMemory is smaller than the previous one. in native wasm, we should grow memory here'
          )
        }
        var oldView = new Int8Array(oldBuffer)
        var newView = new Int8Array(newBuffer)
        if (!memoryInitializer) {
          oldView.set(
            newView.subarray(Module['STATIC_BASE'], Module['STATIC_BASE'] + Module['STATIC_BUMP']),
            Module['STATIC_BASE']
          )
        }
        newView.set(oldView)
        updateGlobalBuffer(newBuffer)
        updateGlobalBufferViews()
      }
      var WasmTypes = { none: 0, i32: 1, i64: 2, f32: 3, f64: 4 }
      function fixImports(imports) {
        if (!0) return imports
        var ret = {}
        for (var i in imports) {
          var fixed = i
          if (fixed[0] == '_') fixed = fixed.substr(1)
          ret[fixed] = imports[i]
        }
        return ret
      }
      function getBinary() {
        try {
          var binary
          if (Module['wasmBinary']) {
            binary = Module['wasmBinary']
            binary = new Uint8Array(binary)
          } else if (Module['readBinary']) {
            binary = Module['readBinary'](wasmBinaryFile)
          } else {
            throw "on the web, we need the wasm binary to be preloaded and set on Module['wasmBinary']. emcc.py will do that for you when generating HTML (but not JS)"
          }
          return binary
        } catch (err) {
          abort(err)
        }
      }
      function doNativeWasm(global, env, providedBuffer) {
        if (typeof WebAssembly !== 'object') {
          Module['printErr']('no native wasm support detected')
          return false
        }
        if (!(Module['wasmMemory'] instanceof WebAssembly.Memory)) {
          Module['printErr']('no native wasm Memory in use')
          return false
        }
        env['memory'] = Module['wasmMemory']
        info['global'] = { NaN: NaN, Infinity: Infinity }
        info['global.Math'] = global.Math
        info['env'] = env
        function receiveInstance(instance) {
          exports = instance.exports
          if (exports.memory) mergeMemory(exports.memory)
          Module['asm'] = exports
          Module['usingWasm'] = true
          removeRunDependency('wasm-instantiate')
        }
        addRunDependency('wasm-instantiate')
        if (Module['instantiateWasm']) {
          try {
            return Module['instantiateWasm'](info, receiveInstance)
          } catch (e) {
            Module['printErr']('Module.instantiateWasm callback failed with error: ' + e)
            return false
          }
        }
        var instance
        try {
          instance = new WebAssembly.Instance(new WebAssembly.Module(getBinary()), info)
        } catch (e) {
          Module['printErr']('failed to compile wasm module: ' + e)
          if (e.toString().indexOf('imported Memory with incompatible size') >= 0) {
            Module['printErr'](
              'Memory size incompatibility issues may be due to changing TOTAL_MEMORY at runtime to something too large. Use ALLOW_MEMORY_GROWTH to allow any size memory (and also make sure not to set TOTAL_MEMORY at runtime to something smaller than it was at compile time).'
            )
          }
          return false
        }
        receiveInstance(instance)
        return exports
      }
      Module['asmPreload'] = Module['asm']
      var asmjsReallocBuffer = Module['reallocBuffer']
      var wasmReallocBuffer = function (size) {
        var PAGE_MULTIPLE = Module['usingWasm'] ? WASM_PAGE_SIZE : ASMJS_PAGE_SIZE
        size = alignUp(size, PAGE_MULTIPLE)
        var old = Module['buffer']
        var oldSize = old.byteLength
        if (Module['usingWasm']) {
          try {
            var result = Module['wasmMemory'].grow((size - oldSize) / wasmPageSize)
            if (result !== (-1 | 0)) {
              return (Module['buffer'] = Module['wasmMemory'].buffer)
            } else {
              return null
            }
          } catch (e) {
            return null
          }
        } else {
          exports['__growWasmMemory']((size - oldSize) / wasmPageSize)
          return Module['buffer'] !== old ? Module['buffer'] : null
        }
      }
      Module['reallocBuffer'] = function (size) {
        if (finalMethod === 'asmjs') {
          return asmjsReallocBuffer(size)
        } else {
          return wasmReallocBuffer(size)
        }
      }
      var finalMethod = ''
      Module['asm'] = function (global, env, providedBuffer) {
        global = fixImports(global)
        env = fixImports(env)
        if (!env['table']) {
          var TABLE_SIZE = Module['wasmTableSize']
          if (TABLE_SIZE === undefined) TABLE_SIZE = 1024
          var MAX_TABLE_SIZE = Module['wasmMaxTableSize']
          if (typeof WebAssembly === 'object' && typeof WebAssembly.Table === 'function') {
            if (MAX_TABLE_SIZE !== undefined) {
              env['table'] = new WebAssembly.Table({
                initial: TABLE_SIZE,
                maximum: MAX_TABLE_SIZE,
                element: 'anyfunc',
              })
            } else {
              env['table'] = new WebAssembly.Table({ initial: TABLE_SIZE, element: 'anyfunc' })
            }
          } else {
            env['table'] = new Array(TABLE_SIZE)
          }
          Module['wasmTable'] = env['table']
        }
        if (!env['memoryBase']) {
          env['memoryBase'] = Module['STATIC_BASE']
        }
        if (!env['tableBase']) {
          env['tableBase'] = 0
        }
        var exports
        exports = doNativeWasm(global, env, providedBuffer)
        if (!exports)
          abort(
            'no binaryen method succeeded. consider enabling more options, like interpreting, if you want that: https://github.com/kripken/emscripten/wiki/WebAssembly#binaryen-methods'
          )
        return exports
      }
      var methodHandler = Module['asm']
    }
    integrateWasmJS()
    var ASM_CONSTS = []
    STATIC_BASE = Runtime.GLOBAL_BASE
    STATICTOP = STATIC_BASE + 1118304
    __ATINIT__.push(
      {
        func: function () {
          __GLOBAL__I_000101()
        },
      },
      {
        func: function () {
          __GLOBAL__sub_I_position_cpp()
        },
      },
      {
        func: function () {
          __GLOBAL__sub_I_iostream_cpp()
        },
      },
      {
        func: function () {
          __GLOBAL__sub_I_ucioption_cpp()
        },
      },
      {
        func: function () {
          __GLOBAL__sub_I_uci_cpp()
        },
      },
      {
        func: function () {
          __GLOBAL__sub_I_tt_cpp()
        },
      },
      {
        func: function () {
          __GLOBAL__sub_I_timeman_cpp()
        },
      },
      {
        func: function () {
          __GLOBAL__sub_I_thread_cpp()
        },
      },
      {
        func: function () {
          __GLOBAL__sub_I_search_cpp()
        },
      },
      {
        func: function () {
          __GLOBAL__sub_I_psqt_cpp()
        },
      },
      {
        func: function () {
          __GLOBAL__sub_I_bitbase_cpp()
        },
      },
      {
        func: function () {
          __GLOBAL__sub_I_pawns_cpp()
        },
      },
      {
        func: function () {
          __GLOBAL__sub_I_movepick_cpp()
        },
      },
      {
        func: function () {
          __GLOBAL__sub_I_movegen_cpp()
        },
      },
      {
        func: function () {
          __GLOBAL__sub_I_misc_cpp()
        },
      },
      {
        func: function () {
          __GLOBAL__sub_I_material_cpp()
        },
      },
      {
        func: function () {
          __GLOBAL__sub_I_main_cpp()
        },
      },
      {
        func: function () {
          __GLOBAL__sub_I_evaluate_cpp()
        },
      },
      {
        func: function () {
          __GLOBAL__sub_I_endgame_cpp()
        },
      },
      {
        func: function () {
          __GLOBAL__sub_I_bitboard_cpp()
        },
      }
    )
    memoryInitializer =
      Module['wasmJSMethod'].indexOf('asmjs') >= 0 ||
      Module['wasmJSMethod'].indexOf('interpret-asm2wasm') >= 0
        ? 'stockfish.js.mem'
        : null
    var STATIC_BUMP = 1118304
    Module['STATIC_BASE'] = STATIC_BASE
    Module['STATIC_BUMP'] = STATIC_BUMP
    var tempDoublePtr = STATICTOP
    STATICTOP += 16
    function _emscripten_get_now() {
      abort()
    }
    function _emscripten_get_now_is_monotonic() {
      return (
        ENVIRONMENT_IS_NODE ||
        typeof dateNow !== 'undefined' ||
        ((ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) &&
          self['performance'] &&
          self['performance']['now'])
      )
    }
    var ERRNO_CODES = {
      EPERM: 1,
      ENOENT: 2,
      ESRCH: 3,
      EINTR: 4,
      EIO: 5,
      ENXIO: 6,
      E2BIG: 7,
      ENOEXEC: 8,
      EBADF: 9,
      ECHILD: 10,
      EAGAIN: 11,
      EWOULDBLOCK: 11,
      ENOMEM: 12,
      EACCES: 13,
      EFAULT: 14,
      ENOTBLK: 15,
      EBUSY: 16,
      EEXIST: 17,
      EXDEV: 18,
      ENODEV: 19,
      ENOTDIR: 20,
      EISDIR: 21,
      EINVAL: 22,
      ENFILE: 23,
      EMFILE: 24,
      ENOTTY: 25,
      ETXTBSY: 26,
      EFBIG: 27,
      ENOSPC: 28,
      ESPIPE: 29,
      EROFS: 30,
      EMLINK: 31,
      EPIPE: 32,
      EDOM: 33,
      ERANGE: 34,
      ENOMSG: 42,
      EIDRM: 43,
      ECHRNG: 44,
      EL2NSYNC: 45,
      EL3HLT: 46,
      EL3RST: 47,
      ELNRNG: 48,
      EUNATCH: 49,
      ENOCSI: 50,
      EL2HLT: 51,
      EDEADLK: 35,
      ENOLCK: 37,
      EBADE: 52,
      EBADR: 53,
      EXFULL: 54,
      ENOANO: 55,
      EBADRQC: 56,
      EBADSLT: 57,
      EDEADLOCK: 35,
      EBFONT: 59,
      ENOSTR: 60,
      ENODATA: 61,
      ETIME: 62,
      ENOSR: 63,
      ENONET: 64,
      ENOPKG: 65,
      EREMOTE: 66,
      ENOLINK: 67,
      EADV: 68,
      ESRMNT: 69,
      ECOMM: 70,
      EPROTO: 71,
      EMULTIHOP: 72,
      EDOTDOT: 73,
      EBADMSG: 74,
      ENOTUNIQ: 76,
      EBADFD: 77,
      EREMCHG: 78,
      ELIBACC: 79,
      ELIBBAD: 80,
      ELIBSCN: 81,
      ELIBMAX: 82,
      ELIBEXEC: 83,
      ENOSYS: 38,
      ENOTEMPTY: 39,
      ENAMETOOLONG: 36,
      ELOOP: 40,
      EOPNOTSUPP: 95,
      EPFNOSUPPORT: 96,
      ECONNRESET: 104,
      ENOBUFS: 105,
      EAFNOSUPPORT: 97,
      EPROTOTYPE: 91,
      ENOTSOCK: 88,
      ENOPROTOOPT: 92,
      ESHUTDOWN: 108,
      ECONNREFUSED: 111,
      EADDRINUSE: 98,
      ECONNABORTED: 103,
      ENETUNREACH: 101,
      ENETDOWN: 100,
      ETIMEDOUT: 110,
      EHOSTDOWN: 112,
      EHOSTUNREACH: 113,
      EINPROGRESS: 115,
      EALREADY: 114,
      EDESTADDRREQ: 89,
      EMSGSIZE: 90,
      EPROTONOSUPPORT: 93,
      ESOCKTNOSUPPORT: 94,
      EADDRNOTAVAIL: 99,
      ENETRESET: 102,
      EISCONN: 106,
      ENOTCONN: 107,
      ETOOMANYREFS: 109,
      EUSERS: 87,
      EDQUOT: 122,
      ESTALE: 116,
      ENOTSUP: 95,
      ENOMEDIUM: 123,
      EILSEQ: 84,
      EOVERFLOW: 75,
      ECANCELED: 125,
      ENOTRECOVERABLE: 131,
      EOWNERDEAD: 130,
      ESTRPIPE: 86,
    }
    function ___setErrNo(value) {
      if (Module['___errno_location']) HEAP32[Module['___errno_location']() >> 2] = value
      return value
    }
    function _clock_gettime(clk_id, tp) {
      var now
      if (clk_id === 0) {
        now = Date.now()
      } else if (clk_id === 1 && _emscripten_get_now_is_monotonic()) {
        now = _emscripten_get_now()
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL)
        return -1
      }
      HEAP32[tp >> 2] = (now / 1e3) | 0
      HEAP32[(tp + 4) >> 2] = ((now % 1e3) * 1e3 * 1e3) | 0
      return 0
    }
    function ___assert_fail(condition, filename, line, func) {
      ABORT = true
      throw (
        'Assertion failed: ' +
        Pointer_stringify(condition) +
        ', at: ' +
        [
          filename ? Pointer_stringify(filename) : 'unknown filename',
          line,
          func ? Pointer_stringify(func) : 'unknown function',
        ] +
        ' at ' +
        stackTrace()
      )
    }
    function _pthread_cond_signal() {
      return 0
    }
    function _abort() {
      Module['abort']()
    }
    function _pthread_cond_destroy() {
      return 0
    }
    function _pthread_create() {
      return 11
    }
    function ___lock() {}
    function ___unlock() {}
    function ___atomic_load_8(ptr, memmodel) {
      return (Runtime.setTempRet0(HEAP32[(ptr + 4) >> 2]), HEAP32[ptr >> 2]) | 0
    }
    function __exit(status) {
      Module['exit'](status)
    }
    function _exit(status) {
      __exit(status)
    }
    var SYSCALLS = {
      varargs: 0,
      get: function (varargs) {
        SYSCALLS.varargs += 4
        var ret = HEAP32[(SYSCALLS.varargs - 4) >> 2]
        return ret
      },
      getStr: function () {
        var ret = Pointer_stringify(SYSCALLS.get())
        return ret
      },
      get64: function () {
        var low = SYSCALLS.get(),
          high = SYSCALLS.get()
        if (low >= 0) assert(high === 0)
        else assert(high === -1)
        return low
      },
      getZero: function () {
        assert(SYSCALLS.get() === 0)
      },
    }
    function ___syscall91(which, varargs) {
      SYSCALLS.varargs = varargs
      try {
        var addr = SYSCALLS.get(),
          len = SYSCALLS.get()
        var info = SYSCALLS.mappings[addr]
        if (!info) return 0
        if (len === info.len) {
          var stream = FS.getStream(info.fd)
          SYSCALLS.doMsync(addr, stream, len, info.flags)
          FS.munmap(stream)
          SYSCALLS.mappings[addr] = null
          if (info.allocated) {
            _free(info.malloc)
          }
        }
        return 0
      } catch (e) {
        if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
        return -e.errno
      }
    }
    function _pthread_attr_setstacksize() {}
    function ___syscall54(which, varargs) {
      SYSCALLS.varargs = varargs
      try {
        return 0
      } catch (e) {
        if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
        return -e.errno
      }
    }
    function ___atomic_store_8(ptr, vall, valh, memmodel) {
      HEAP32[ptr >> 2] = vall
      HEAP32[(ptr + 4) >> 2] = valh
    }
    var _environ = STATICTOP
    STATICTOP += 16
    function ___buildEnvironment(env) {
      var MAX_ENV_VALUES = 64
      var TOTAL_ENV_SIZE = 1024
      var poolPtr
      var envPtr
      if (!___buildEnvironment.called) {
        ___buildEnvironment.called = true
        ENV['USER'] = ENV['LOGNAME'] = 'web_user'
        ENV['PATH'] = '/'
        ENV['PWD'] = '/'
        ENV['HOME'] = '/home/web_user'
        ENV['LANG'] = 'C'
        ENV['_'] = Module['thisProgram']
        poolPtr = allocate(TOTAL_ENV_SIZE, 'i8', ALLOC_STATIC)
        envPtr = allocate(MAX_ENV_VALUES * 4, 'i8*', ALLOC_STATIC)
        HEAP32[envPtr >> 2] = poolPtr
        HEAP32[_environ >> 2] = envPtr
      } else {
        envPtr = HEAP32[_environ >> 2]
        poolPtr = HEAP32[envPtr >> 2]
      }
      var strings = []
      var totalSize = 0
      for (var key in env) {
        if (typeof env[key] === 'string') {
          var line = key + '=' + env[key]
          strings.push(line)
          totalSize += line.length
        }
      }
      if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error('Environment size exceeded TOTAL_ENV_SIZE!')
      }
      var ptrSize = 4
      for (var i = 0; i < strings.length; i++) {
        var line = strings[i]
        writeAsciiToMemory(line, poolPtr)
        HEAP32[(envPtr + i * ptrSize) >> 2] = poolPtr
        poolPtr += line.length + 1
      }
      HEAP32[(envPtr + strings.length * ptrSize) >> 2] = 0
    }
    var ENV = {}
    function _getenv(name) {
      if (name === 0) return 0
      name = Pointer_stringify(name)
      if (!ENV.hasOwnProperty(name)) return 0
      if (_getenv.ret) _free(_getenv.ret)
      _getenv.ret = allocate(intArrayFromString(ENV[name]), 'i8', ALLOC_NORMAL)
      return _getenv.ret
    }
    function _pthread_attr_init(attr) {
      return 0
    }
    function ___map_file(pathname, size) {
      ___setErrNo(ERRNO_CODES.EPERM)
      return -1
    }
    function _pthread_join() {}
    function ___syscall5(which, varargs) {
      SYSCALLS.varargs = varargs
      try {
        var pathname = SYSCALLS.getStr(),
          flags = SYSCALLS.get(),
          mode = SYSCALLS.get()
        var stream = FS.open(pathname, flags, mode)
        return stream.fd
      } catch (e) {
        if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
        return -e.errno
      }
    }
    function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src + num), dest)
      return dest
    }
    function ___syscall6(which, varargs) {
      SYSCALLS.varargs = varargs
      try {
        var stream = SYSCALLS.getStreamFromFD()
        FS.close(stream)
        return 0
      } catch (e) {
        if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
        return -e.errno
      }
    }
    function __ZSt18uncaught_exceptionv() {
      return !!__ZSt18uncaught_exceptionv.uncaught_exception
    }
    var _llvm_pow_f64 = Math_pow
    var cttz_i8 = allocate(
      [
        8, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1,
        0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0,
        1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2,
        0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0,
        2, 0, 1, 0, 7, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1,
        0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0,
        1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3,
        0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0,
        3, 0, 1, 0, 2, 0, 1, 0,
      ],
      'i8',
      ALLOC_STATIC
    )
    function _llvm_cttz_i32(x) {
      x = x | 0
      var ret = 0
      ret = HEAP8[(cttz_i8 + (x & 255)) >> 0] | 0
      if ((ret | 0) < 8) return ret | 0
      ret = HEAP8[(cttz_i8 + ((x >> 8) & 255)) >> 0] | 0
      if ((ret | 0) < 8) return (ret + 8) | 0
      ret = HEAP8[(cttz_i8 + ((x >> 16) & 255)) >> 0] | 0
      if ((ret | 0) < 8) return (ret + 16) | 0
      return ((HEAP8[(cttz_i8 + (x >>> 24)) >> 0] | 0) + 24) | 0
    }
    function _llvm_cttz_i64(l, h) {
      var ret = _llvm_cttz_i32(l)
      if (ret == 32) ret += _llvm_cttz_i32(h)
      return (Runtime.setTempRet0(0), ret) | 0
    }
    function __isLeapYear(year) {
      return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
    }
    function __arraySum(array, index) {
      var sum = 0
      for (var i = 0; i <= index; sum += array[i++]);
      return sum
    }
    var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    function __addDays(date, days) {
      var newDate = new Date(date.getTime())
      while (days > 0) {
        var leap = __isLeapYear(newDate.getFullYear())
        var currentMonth = newDate.getMonth()
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth]
        if (days > daysInCurrentMonth - newDate.getDate()) {
          days -= daysInCurrentMonth - newDate.getDate() + 1
          newDate.setDate(1)
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth + 1)
          } else {
            newDate.setMonth(0)
            newDate.setFullYear(newDate.getFullYear() + 1)
          }
        } else {
          newDate.setDate(newDate.getDate() + days)
          return newDate
        }
      }
      return newDate
    }
    function _strftime(s, maxsize, format, tm) {
      var tm_zone = HEAP32[(tm + 40) >> 2]
      var date = {
        tm_sec: HEAP32[tm >> 2],
        tm_min: HEAP32[(tm + 4) >> 2],
        tm_hour: HEAP32[(tm + 8) >> 2],
        tm_mday: HEAP32[(tm + 12) >> 2],
        tm_mon: HEAP32[(tm + 16) >> 2],
        tm_year: HEAP32[(tm + 20) >> 2],
        tm_wday: HEAP32[(tm + 24) >> 2],
        tm_yday: HEAP32[(tm + 28) >> 2],
        tm_isdst: HEAP32[(tm + 32) >> 2],
        tm_gmtoff: HEAP32[(tm + 36) >> 2],
        tm_zone: tm_zone ? Pointer_stringify(tm_zone) : '',
      }
      var pattern = Pointer_stringify(format)
      var EXPANSION_RULES_1 = {
        '%c': '%a %b %d %H:%M:%S %Y',
        '%D': '%m/%d/%y',
        '%F': '%Y-%m-%d',
        '%h': '%b',
        '%r': '%I:%M:%S %p',
        '%R': '%H:%M',
        '%T': '%H:%M:%S',
        '%x': '%m/%d/%y',
        '%X': '%H:%M:%S',
      }
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule])
      }
      var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      var MONTHS = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ]
      function leadingSomething(value, digits, character) {
        var str = typeof value === 'number' ? value.toString() : value || ''
        while (str.length < digits) {
          str = character[0] + str
        }
        return str
      }
      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, '0')
      }
      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : value > 0 ? 1 : 0
        }
        var compare
        if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
            compare = sgn(date1.getDate() - date2.getDate())
          }
        }
        return compare
      }
      function getFirstWeekStartDate(janFourth) {
        switch (janFourth.getDay()) {
          case 0:
            return new Date(janFourth.getFullYear() - 1, 11, 29)
          case 1:
            return janFourth
          case 2:
            return new Date(janFourth.getFullYear(), 0, 3)
          case 3:
            return new Date(janFourth.getFullYear(), 0, 2)
          case 4:
            return new Date(janFourth.getFullYear(), 0, 1)
          case 5:
            return new Date(janFourth.getFullYear() - 1, 11, 31)
          case 6:
            return new Date(janFourth.getFullYear() - 1, 11, 30)
        }
      }
      function getWeekBasedYear(date) {
        var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday)
        var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4)
        var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4)
        var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear)
        var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear)
        if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
          if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
            return thisDate.getFullYear() + 1
          } else {
            return thisDate.getFullYear()
          }
        } else {
          return thisDate.getFullYear() - 1
        }
      }
      var EXPANSION_RULES_2 = {
        '%a': function (date) {
          return WEEKDAYS[date.tm_wday].substring(0, 3)
        },
        '%A': function (date) {
          return WEEKDAYS[date.tm_wday]
        },
        '%b': function (date) {
          return MONTHS[date.tm_mon].substring(0, 3)
        },
        '%B': function (date) {
          return MONTHS[date.tm_mon]
        },
        '%C': function (date) {
          var year = date.tm_year + 1900
          return leadingNulls((year / 100) | 0, 2)
        },
        '%d': function (date) {
          return leadingNulls(date.tm_mday, 2)
        },
        '%e': function (date) {
          return leadingSomething(date.tm_mday, 2, ' ')
        },
        '%g': function (date) {
          return getWeekBasedYear(date).toString().substring(2)
        },
        '%G': function (date) {
          return getWeekBasedYear(date)
        },
        '%H': function (date) {
          return leadingNulls(date.tm_hour, 2)
        },
        '%I': function (date) {
          var twelveHour = date.tm_hour
          if (twelveHour == 0) twelveHour = 12
          else if (twelveHour > 12) twelveHour -= 12
          return leadingNulls(twelveHour, 2)
        },
        '%j': function (date) {
          return leadingNulls(
            date.tm_mday +
              __arraySum(
                __isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR,
                date.tm_mon - 1
              ),
            3
          )
        },
        '%m': function (date) {
          return leadingNulls(date.tm_mon + 1, 2)
        },
        '%M': function (date) {
          return leadingNulls(date.tm_min, 2)
        },
        '%n': function () {
          return '\n'
        },
        '%p': function (date) {
          if (date.tm_hour >= 0 && date.tm_hour < 12) {
            return 'AM'
          } else {
            return 'PM'
          }
        },
        '%S': function (date) {
          return leadingNulls(date.tm_sec, 2)
        },
        '%t': function () {
          return '\t'
        },
        '%u': function (date) {
          var day = new Date(date.tm_year + 1900, date.tm_mon + 1, date.tm_mday, 0, 0, 0, 0)
          return day.getDay() || 7
        },
        '%U': function (date) {
          var janFirst = new Date(date.tm_year + 1900, 0, 1)
          var firstSunday =
            janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7 - janFirst.getDay())
          var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday)
          if (compareByDay(firstSunday, endDate) < 0) {
            var februaryFirstUntilEndMonth =
              __arraySum(
                __isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR,
                endDate.getMonth() - 1
              ) - 31
            var firstSundayUntilEndJanuary = 31 - firstSunday.getDate()
            var days = firstSundayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate()
            return leadingNulls(Math.ceil(days / 7), 2)
          }
          return compareByDay(firstSunday, janFirst) === 0 ? '01' : '00'
        },
        '%V': function (date) {
          var janFourthThisYear = new Date(date.tm_year + 1900, 0, 4)
          var janFourthNextYear = new Date(date.tm_year + 1901, 0, 4)
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear)
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear)
          var endDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday)
          if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
            return '53'
          }
          if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
            return '01'
          }
          var daysDifference
          if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
            daysDifference = date.tm_yday + 32 - firstWeekStartThisYear.getDate()
          } else {
            daysDifference = date.tm_yday + 1 - firstWeekStartThisYear.getDate()
          }
          return leadingNulls(Math.ceil(daysDifference / 7), 2)
        },
        '%w': function (date) {
          var day = new Date(date.tm_year + 1900, date.tm_mon + 1, date.tm_mday, 0, 0, 0, 0)
          return day.getDay()
        },
        '%W': function (date) {
          var janFirst = new Date(date.tm_year, 0, 1)
          var firstMonday =
            janFirst.getDay() === 1
              ? janFirst
              : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1)
          var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday)
          if (compareByDay(firstMonday, endDate) < 0) {
            var februaryFirstUntilEndMonth =
              __arraySum(
                __isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR,
                endDate.getMonth() - 1
              ) - 31
            var firstMondayUntilEndJanuary = 31 - firstMonday.getDate()
            var days = firstMondayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate()
            return leadingNulls(Math.ceil(days / 7), 2)
          }
          return compareByDay(firstMonday, janFirst) === 0 ? '01' : '00'
        },
        '%y': function (date) {
          return (date.tm_year + 1900).toString().substring(2)
        },
        '%Y': function (date) {
          return date.tm_year + 1900
        },
        '%z': function (date) {
          var off = date.tm_gmtoff
          var ahead = off >= 0
          off = Math.abs(off) / 60
          off = (off / 60) * 100 + (off % 60)
          return (ahead ? '+' : '-') + String('0000' + off).slice(-4)
        },
        '%Z': function (date) {
          return date.tm_zone
        },
        '%%': function () {
          return '%'
        },
      }
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.indexOf(rule) >= 0) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date))
        }
      }
      var bytes = intArrayFromString(pattern, false)
      if (bytes.length > maxsize) {
        return 0
      }
      writeArrayToMemory(bytes, s)
      return bytes.length - 1
    }
    function _strftime_l(s, maxsize, format, tm) {
      return _strftime(s, maxsize, format, tm)
    }
    function ___atomic_fetch_add_8(ptr, vall, valh, memmodel) {
      var l = HEAP32[ptr >> 2]
      var h = HEAP32[(ptr + 4) >> 2]
      HEAP32[ptr >> 2] = _i64Add(l, h, vall, valh)
      HEAP32[(ptr + 4) >> 2] = Runtime['getTempRet0']()
      return (Runtime.setTempRet0(h), l) | 0
    }
    function _pthread_mutex_destroy() {}
    function _pthread_cond_wait() {
      return 0
    }
    function ___syscall140(which, varargs) {
      SYSCALLS.varargs = varargs
      try {
        var stream = SYSCALLS.getStreamFromFD(),
          offset_high = SYSCALLS.get(),
          offset_low = SYSCALLS.get(),
          result = SYSCALLS.get(),
          whence = SYSCALLS.get()
        var offset = offset_low
        FS.llseek(stream, offset, whence)
        HEAP32[result >> 2] = stream.position
        if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null
        return 0
      } catch (e) {
        if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
        return -e.errno
      }
    }
    function _emscripten_set_main_loop_timing(mode, value) {
      Browser.mainLoop.timingMode = mode
      Browser.mainLoop.timingValue = value
      if (!Browser.mainLoop.func) {
        return 1
      }
      if (mode == 0) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
          var timeUntilNextTick =
            Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now()) | 0
          setTimeout(Browser.mainLoop.runner, timeUntilNextTick)
        }
        Browser.mainLoop.method = 'timeout'
      } else if (mode == 1) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
          Browser.requestAnimationFrame(Browser.mainLoop.runner)
        }
        Browser.mainLoop.method = 'rAF'
      } else if (mode == 2) {
        if (!window['setImmediate']) {
          var setImmediates = []
          var emscriptenMainLoopMessageId = 'setimmediate'
          function Browser_setImmediate_messageHandler(event) {
            if (event.source === window && event.data === emscriptenMainLoopMessageId) {
              event.stopPropagation()
              setImmediates.shift()()
            }
          }
          window.addEventListener('message', Browser_setImmediate_messageHandler, true)
          window['setImmediate'] = function Browser_emulated_setImmediate(func) {
            setImmediates.push(func)
            if (ENVIRONMENT_IS_WORKER) {
              if (Module['setImmediates'] === undefined) Module['setImmediates'] = []
              Module['setImmediates'].push(func)
              window.postMessage({ target: emscriptenMainLoopMessageId })
            } else window.postMessage(emscriptenMainLoopMessageId, '*')
          }
        }
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
          window['setImmediate'](Browser.mainLoop.runner)
        }
        Browser.mainLoop.method = 'immediate'
      }
      return 0
    }
    function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop, arg, noSetTiming) {
      Module['noExitRuntime'] = true
      assert(
        !Browser.mainLoop.func,
        'emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.'
      )
      Browser.mainLoop.func = func
      Browser.mainLoop.arg = arg
      var browserIterationFunc
      if (typeof arg !== 'undefined') {
        browserIterationFunc = function () {
          Module['dynCall_vi'](func, arg)
        }
      } else {
        browserIterationFunc = function () {
          Module['dynCall_v'](func)
        }
      }
      var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop
      Browser.mainLoop.runner = function Browser_mainLoop_runner() {
        if (ABORT) return
        if (Browser.mainLoop.queue.length > 0) {
          var start = Date.now()
          var blocker = Browser.mainLoop.queue.shift()
          blocker.func(blocker.arg)
          if (Browser.mainLoop.remainingBlockers) {
            var remaining = Browser.mainLoop.remainingBlockers
            var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining)
            if (blocker.counted) {
              Browser.mainLoop.remainingBlockers = next
            } else {
              next = next + 0.5
              Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9
            }
          }
          console.log(
            'main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + ' ms'
          )
          Browser.mainLoop.updateStatus()
          if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return
          setTimeout(Browser.mainLoop.runner, 0)
          return
        }
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return
        Browser.mainLoop.currentFrameNumber = (Browser.mainLoop.currentFrameNumber + 1) | 0
        if (
          Browser.mainLoop.timingMode == 1 &&
          Browser.mainLoop.timingValue > 1 &&
          Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0
        ) {
          Browser.mainLoop.scheduler()
          return
        } else if (Browser.mainLoop.timingMode == 0) {
          Browser.mainLoop.tickStartTime = _emscripten_get_now()
        }
        if (Browser.mainLoop.method === 'timeout' && Module.ctx) {
          Module.printErr(
            'Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!'
          )
          Browser.mainLoop.method = ''
        }
        Browser.mainLoop.runIter(browserIterationFunc)
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return
        if (typeof SDL === 'object' && SDL.audio && SDL.audio.queueNewAudioData)
          SDL.audio.queueNewAudioData()
        Browser.mainLoop.scheduler()
      }
      if (!noSetTiming) {
        if (fps && fps > 0) _emscripten_set_main_loop_timing(0, 1e3 / fps)
        else _emscripten_set_main_loop_timing(1, 1)
        Browser.mainLoop.scheduler()
      }
      if (simulateInfiniteLoop) {
        throw 'SimulateInfiniteLoop'
      }
    }
    var Browser = {
      mainLoop: {
        scheduler: null,
        method: '',
        currentlyRunningMainloop: 0,
        func: null,
        arg: 0,
        timingMode: 0,
        timingValue: 0,
        currentFrameNumber: 0,
        queue: [],
        pause: function () {
          Browser.mainLoop.scheduler = null
          Browser.mainLoop.currentlyRunningMainloop++
        },
        resume: function () {
          Browser.mainLoop.currentlyRunningMainloop++
          var timingMode = Browser.mainLoop.timingMode
          var timingValue = Browser.mainLoop.timingValue
          var func = Browser.mainLoop.func
          Browser.mainLoop.func = null
          _emscripten_set_main_loop(func, 0, false, Browser.mainLoop.arg, true)
          _emscripten_set_main_loop_timing(timingMode, timingValue)
          Browser.mainLoop.scheduler()
        },
        updateStatus: function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...'
            var remaining = Browser.mainLoop.remainingBlockers
            var expected = Browser.mainLoop.expectedBlockers
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')')
              } else {
                Module['setStatus'](message)
              }
            } else {
              Module['setStatus']('')
            }
          }
        },
        runIter: function (func) {
          if (ABORT) return
          if (Module['preMainLoop']) {
            var preRet = Module['preMainLoop']()
            if (preRet === false) {
              return
            }
          }
          try {
            func()
          } catch (e) {
            if (e instanceof ExitStatus) {
              return
            } else {
              if (e && typeof e === 'object' && e.stack)
                Module.printErr('exception thrown: ' + [e, e.stack])
              throw e
            }
          }
          if (Module['postMainLoop']) Module['postMainLoop']()
        },
      },
      isFullscreen: false,
      pointerLock: false,
      moduleContextCreatedCallbacks: [],
      workers: [],
      init: function () {
        if (!Module['preloadPlugins']) Module['preloadPlugins'] = []
        if (Browser.initted) return
        Browser.initted = true
        try {
          new Blob()
          Browser.hasBlobConstructor = true
        } catch (e) {
          Browser.hasBlobConstructor = false
          console.log('warning: no blob constructor, cannot create blobs with mimetypes')
        }
        Browser.BlobBuilder =
          typeof MozBlobBuilder != 'undefined'
            ? MozBlobBuilder
            : typeof WebKitBlobBuilder != 'undefined'
              ? WebKitBlobBuilder
              : !Browser.hasBlobConstructor
                ? console.log('warning: no BlobBuilder')
                : null
        Browser.URLObject =
          typeof window != 'undefined' ? (window.URL ? window.URL : window.webkitURL) : undefined
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log(
            'warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.'
          )
          Module.noImageDecoding = true
        }
        var imagePlugin = {}
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name)
        }
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) })
              if (b.size !== byteArray.length) {
                b = new Blob([new Uint8Array(byteArray).buffer], {
                  type: Browser.getMimetype(name),
                })
              }
            } catch (e) {
              Runtime.warnOnce(
                'Blob constructor present but fails: ' + e + '; falling back to blob builder'
              )
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder()
            bb.append(new Uint8Array(byteArray).buffer)
            b = bb.getBlob()
          }
          var url = Browser.URLObject.createObjectURL(b)
          var img = new Image()
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded')
            var canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            var ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
            Module['preloadedImages'][name] = canvas
            Browser.URLObject.revokeObjectURL(url)
            if (onload) onload(byteArray)
          }
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded')
            if (onerror) onerror()
          }
          img.src = url
        }
        Module['preloadPlugins'].push(imagePlugin)
        var audioPlugin = {}
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 }
        }
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false
          function finish(audio) {
            if (done) return
            done = true
            Module['preloadedAudios'][name] = audio
            if (onload) onload(byteArray)
          }
          function fail() {
            if (done) return
            done = true
            Module['preloadedAudios'][name] = new Audio()
            if (onerror) onerror()
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) })
            } catch (e) {
              return fail()
            }
            var url = Browser.URLObject.createObjectURL(b)
            var audio = new Audio()
            audio.addEventListener(
              'canplaythrough',
              function () {
                finish(audio)
              },
              false
            )
            audio.onerror = function audio_onerror(event) {
              if (done) return
              console.log(
                'warning: browser could not fully decode audio ' +
                  name +
                  ', trying slower base64 approach'
              )
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
                var PAD = '='
                var ret = ''
                var leftchar = 0
                var leftbits = 0
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i]
                  leftbits += 8
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits - 6)) & 63
                    leftbits -= 6
                    ret += BASE[curr]
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar & 3) << 4]
                  ret += PAD + PAD
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar & 15) << 2]
                  ret += PAD
                }
                return ret
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray)
              finish(audio)
            }
            audio.src = url
            Browser.safeSetTimeout(function () {
              finish(audio)
            }, 1e4)
          } else {
            return fail()
          }
        }
        Module['preloadPlugins'].push(audioPlugin)
        function pointerLockChange() {
          Browser.pointerLock =
            document['pointerLockElement'] === Module['canvas'] ||
            document['mozPointerLockElement'] === Module['canvas'] ||
            document['webkitPointerLockElement'] === Module['canvas'] ||
            document['msPointerLockElement'] === Module['canvas']
        }
        var canvas = Module['canvas']
        if (canvas) {
          canvas.requestPointerLock =
            canvas['requestPointerLock'] ||
            canvas['mozRequestPointerLock'] ||
            canvas['webkitRequestPointerLock'] ||
            canvas['msRequestPointerLock'] ||
            function () {}
          canvas.exitPointerLock =
            document['exitPointerLock'] ||
            document['mozExitPointerLock'] ||
            document['webkitExitPointerLock'] ||
            document['msExitPointerLock'] ||
            function () {}
          canvas.exitPointerLock = canvas.exitPointerLock.bind(document)
          document.addEventListener('pointerlockchange', pointerLockChange, false)
          document.addEventListener('mozpointerlockchange', pointerLockChange, false)
          document.addEventListener('webkitpointerlockchange', pointerLockChange, false)
          document.addEventListener('mspointerlockchange', pointerLockChange, false)
          if (Module['elementPointerLock']) {
            canvas.addEventListener(
              'click',
              function (ev) {
                if (!Browser.pointerLock && Module['canvas'].requestPointerLock) {
                  Module['canvas'].requestPointerLock()
                  ev.preventDefault()
                }
              },
              false
            )
          }
        }
      },
      createContext: function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx
        var ctx
        var contextHandle
        if (useWebGL) {
          var contextAttributes = { antialias: false, alpha: false }
          if (webGLContextAttributes) {
            for (var attribute in webGLContextAttributes) {
              contextAttributes[attribute] = webGLContextAttributes[attribute]
            }
          }
          contextHandle = GL.createContext(canvas, contextAttributes)
          if (contextHandle) {
            ctx = GL.getContext(contextHandle).GLctx
          }
        } else {
          ctx = canvas.getContext('2d')
        }
        if (!ctx) return null
        if (setInModule) {
          if (!useWebGL)
            assert(
              typeof GLctx === 'undefined',
              'cannot set in module if GLctx is used, but we are a non-GL context that would replace it'
            )
          Module.ctx = ctx
          if (useWebGL) GL.makeContextCurrent(contextHandle)
          Module.useWebGL = useWebGL
          Browser.moduleContextCreatedCallbacks.forEach(function (callback) {
            callback()
          })
          Browser.init()
        }
        return ctx
      },
      destroyContext: function (canvas, useWebGL, setInModule) {},
      fullscreenHandlersInstalled: false,
      lockPointer: undefined,
      resizeCanvas: undefined,
      requestFullscreen: function (lockPointer, resizeCanvas, vrDevice) {
        Browser.lockPointer = lockPointer
        Browser.resizeCanvas = resizeCanvas
        Browser.vrDevice = vrDevice
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false
        if (typeof Browser.vrDevice === 'undefined') Browser.vrDevice = null
        var canvas = Module['canvas']
        function fullscreenChange() {
          Browser.isFullscreen = false
          var canvasContainer = canvas.parentNode
          if (
            (document['fullscreenElement'] ||
              document['mozFullScreenElement'] ||
              document['msFullscreenElement'] ||
              document['webkitFullscreenElement'] ||
              document['webkitCurrentFullScreenElement']) === canvasContainer
          ) {
            canvas.exitFullscreen =
              document['exitFullscreen'] ||
              document['cancelFullScreen'] ||
              document['mozCancelFullScreen'] ||
              document['msExitFullscreen'] ||
              document['webkitCancelFullScreen'] ||
              function () {}
            canvas.exitFullscreen = canvas.exitFullscreen.bind(document)
            if (Browser.lockPointer) canvas.requestPointerLock()
            Browser.isFullscreen = true
            if (Browser.resizeCanvas) Browser.setFullscreenCanvasSize()
          } else {
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer)
            canvasContainer.parentNode.removeChild(canvasContainer)
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize()
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullscreen)
          if (Module['onFullscreen']) Module['onFullscreen'](Browser.isFullscreen)
          Browser.updateCanvasDimensions(canvas)
        }
        if (!Browser.fullscreenHandlersInstalled) {
          Browser.fullscreenHandlersInstalled = true
          document.addEventListener('fullscreenchange', fullscreenChange, false)
          document.addEventListener('mozfullscreenchange', fullscreenChange, false)
          document.addEventListener('webkitfullscreenchange', fullscreenChange, false)
          document.addEventListener('MSFullscreenChange', fullscreenChange, false)
        }
        var canvasContainer = document.createElement('div')
        canvas.parentNode.insertBefore(canvasContainer, canvas)
        canvasContainer.appendChild(canvas)
        canvasContainer.requestFullscreen =
          canvasContainer['requestFullscreen'] ||
          canvasContainer['mozRequestFullScreen'] ||
          canvasContainer['msRequestFullscreen'] ||
          (canvasContainer['webkitRequestFullscreen']
            ? function () {
                canvasContainer['webkitRequestFullscreen'](Element['ALLOW_KEYBOARD_INPUT'])
              }
            : null) ||
          (canvasContainer['webkitRequestFullScreen']
            ? function () {
                canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT'])
              }
            : null)
        if (vrDevice) {
          canvasContainer.requestFullscreen({ vrDisplay: vrDevice })
        } else {
          canvasContainer.requestFullscreen()
        }
      },
      requestFullScreen: function (lockPointer, resizeCanvas, vrDevice) {
        Module.printErr(
          'Browser.requestFullScreen() is deprecated. Please call Browser.requestFullscreen instead.'
        )
        Browser.requestFullScreen = function (lockPointer, resizeCanvas, vrDevice) {
          return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice)
        }
        return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice)
      },
      nextRAF: 0,
      fakeRequestAnimationFrame: function (func) {
        var now = Date.now()
        if (Browser.nextRAF === 0) {
          Browser.nextRAF = now + 1e3 / 60
        } else {
          while (now + 2 >= Browser.nextRAF) {
            Browser.nextRAF += 1e3 / 60
          }
        }
        var delay = Math.max(Browser.nextRAF - now, 0)
        setTimeout(func, delay)
      },
      requestAnimationFrame: function requestAnimationFrame(func) {
        if (typeof window === 'undefined') {
          Browser.fakeRequestAnimationFrame(func)
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame =
              window['requestAnimationFrame'] ||
              window['mozRequestAnimationFrame'] ||
              window['webkitRequestAnimationFrame'] ||
              window['msRequestAnimationFrame'] ||
              window['oRequestAnimationFrame'] ||
              Browser.fakeRequestAnimationFrame
          }
          window.requestAnimationFrame(func)
        }
      },
      safeCallback: function (func) {
        return function () {
          if (!ABORT) return func.apply(null, arguments)
        }
      },
      allowAsyncCallbacks: true,
      queuedAsyncCallbacks: [],
      pauseAsyncCallbacks: function () {
        Browser.allowAsyncCallbacks = false
      },
      resumeAsyncCallbacks: function () {
        Browser.allowAsyncCallbacks = true
        if (Browser.queuedAsyncCallbacks.length > 0) {
          var callbacks = Browser.queuedAsyncCallbacks
          Browser.queuedAsyncCallbacks = []
          callbacks.forEach(function (func) {
            func()
          })
        }
      },
      safeRequestAnimationFrame: function (func) {
        return Browser.requestAnimationFrame(function () {
          if (ABORT) return
          if (Browser.allowAsyncCallbacks) {
            func()
          } else {
            Browser.queuedAsyncCallbacks.push(func)
          }
        })
      },
      safeSetTimeout: function (func, timeout) {
        Module['noExitRuntime'] = true
        return setTimeout(function () {
          if (ABORT) return
          if (Browser.allowAsyncCallbacks) {
            func()
          } else {
            Browser.queuedAsyncCallbacks.push(func)
          }
        }, timeout)
      },
      safeSetInterval: function (func, timeout) {
        Module['noExitRuntime'] = true
        return setInterval(function () {
          if (ABORT) return
          if (Browser.allowAsyncCallbacks) {
            func()
          }
        }, timeout)
      },
      getMimetype: function (name) {
        return {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          bmp: 'image/bmp',
          ogg: 'audio/ogg',
          wav: 'audio/wav',
          mp3: 'audio/mpeg',
        }[name.substr(name.lastIndexOf('.') + 1)]
      },
      getUserMedia: function (func) {
        if (!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] || navigator['mozGetUserMedia']
        }
        window.getUserMedia(func)
      },
      getMovementX: function (event) {
        return event['movementX'] || event['mozMovementX'] || event['webkitMovementX'] || 0
      },
      getMovementY: function (event) {
        return event['movementY'] || event['mozMovementY'] || event['webkitMovementY'] || 0
      },
      getMouseWheelDelta: function (event) {
        var delta = 0
        switch (event.type) {
          case 'DOMMouseScroll':
            delta = event.detail
            break
          case 'mousewheel':
            delta = event.wheelDelta
            break
          case 'wheel':
            delta = event['deltaY']
            break
          default:
            throw 'unrecognized mouse wheel event: ' + event.type
        }
        return delta
      },
      mouseX: 0,
      mouseY: 0,
      mouseMovementX: 0,
      mouseMovementY: 0,
      touches: {},
      lastTouches: {},
      calculateMouseEvent: function (event) {
        if (Browser.pointerLock) {
          if (event.type != 'mousemove' && 'mozMovementX' in event) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event)
            Browser.mouseMovementY = Browser.getMovementY(event)
          }
          if (typeof SDL != 'undefined') {
            Browser.mouseX = SDL.mouseX + Browser.mouseMovementX
            Browser.mouseY = SDL.mouseY + Browser.mouseMovementY
          } else {
            Browser.mouseX += Browser.mouseMovementX
            Browser.mouseY += Browser.mouseMovementY
          }
        } else {
          var rect = Module['canvas'].getBoundingClientRect()
          var cw = Module['canvas'].width
          var ch = Module['canvas'].height
          var scrollX = typeof window.scrollX !== 'undefined' ? window.scrollX : window.pageXOffset
          var scrollY = typeof window.scrollY !== 'undefined' ? window.scrollY : window.pageYOffset
          if (
            event.type === 'touchstart' ||
            event.type === 'touchend' ||
            event.type === 'touchmove'
          ) {
            var touch = event.touch
            if (touch === undefined) {
              return
            }
            var adjustedX = touch.pageX - (scrollX + rect.left)
            var adjustedY = touch.pageY - (scrollY + rect.top)
            adjustedX = adjustedX * (cw / rect.width)
            adjustedY = adjustedY * (ch / rect.height)
            var coords = { x: adjustedX, y: adjustedY }
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords
              Browser.touches[touch.identifier] = coords
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              var last = Browser.touches[touch.identifier]
              if (!last) last = coords
              Browser.lastTouches[touch.identifier] = last
              Browser.touches[touch.identifier] = coords
            }
            return
          }
          var x = event.pageX - (scrollX + rect.left)
          var y = event.pageY - (scrollY + rect.top)
          x = x * (cw / rect.width)
          y = y * (ch / rect.height)
          Browser.mouseMovementX = x - Browser.mouseX
          Browser.mouseMovementY = y - Browser.mouseY
          Browser.mouseX = x
          Browser.mouseY = y
        }
      },
      asyncLoad: function (url, onload, onerror, noRunDep) {
        var dep = !noRunDep ? getUniqueRunDependency('al ' + url) : ''
        Module['readAsync'](
          url,
          function (arrayBuffer) {
            assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).')
            onload(new Uint8Array(arrayBuffer))
            if (dep) removeRunDependency(dep)
          },
          function (event) {
            if (onerror) {
              onerror()
            } else {
              throw 'Loading data file "' + url + '" failed.'
            }
          }
        )
        if (dep) addRunDependency(dep)
      },
      resizeListeners: [],
      updateResizeListeners: function () {
        var canvas = Module['canvas']
        Browser.resizeListeners.forEach(function (listener) {
          listener(canvas.width, canvas.height)
        })
      },
      setCanvasSize: function (width, height, noUpdates) {
        var canvas = Module['canvas']
        Browser.updateCanvasDimensions(canvas, width, height)
        if (!noUpdates) Browser.updateResizeListeners()
      },
      windowedWidth: 0,
      windowedHeight: 0,
      setFullscreenCanvasSize: function () {
        if (typeof SDL != 'undefined') {
          var flags = HEAPU32[(SDL.screen + Runtime.QUANTUM_SIZE * 0) >> 2]
          flags = flags | 8388608
          HEAP32[(SDL.screen + Runtime.QUANTUM_SIZE * 0) >> 2] = flags
        }
        Browser.updateResizeListeners()
      },
      setWindowedCanvasSize: function () {
        if (typeof SDL != 'undefined') {
          var flags = HEAPU32[(SDL.screen + Runtime.QUANTUM_SIZE * 0) >> 2]
          flags = flags & ~8388608
          HEAP32[(SDL.screen + Runtime.QUANTUM_SIZE * 0) >> 2] = flags
        }
        Browser.updateResizeListeners()
      },
      updateCanvasDimensions: function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative
          canvas.heightNative = hNative
        } else {
          wNative = canvas.widthNative
          hNative = canvas.heightNative
        }
        var w = wNative
        var h = hNative
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w / h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio'])
          } else {
            h = Math.round(w / Module['forcedAspectRatio'])
          }
        }
        if (
          (document['fullscreenElement'] ||
            document['mozFullScreenElement'] ||
            document['msFullscreenElement'] ||
            document['webkitFullscreenElement'] ||
            document['webkitCurrentFullScreenElement']) === canvas.parentNode &&
          typeof screen != 'undefined'
        ) {
          var factor = Math.min(screen.width / w, screen.height / h)
          w = Math.round(w * factor)
          h = Math.round(h * factor)
        }
        if (Browser.resizeCanvas) {
          if (canvas.width != w) canvas.width = w
          if (canvas.height != h) canvas.height = h
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty('width')
            canvas.style.removeProperty('height')
          }
        } else {
          if (canvas.width != wNative) canvas.width = wNative
          if (canvas.height != hNative) canvas.height = hNative
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty('width', w + 'px', 'important')
              canvas.style.setProperty('height', h + 'px', 'important')
            } else {
              canvas.style.removeProperty('width')
              canvas.style.removeProperty('height')
            }
          }
        }
      },
      wgetRequests: {},
      nextWgetRequestHandle: 0,
      getNextWgetRequestHandle: function () {
        var handle = Browser.nextWgetRequestHandle
        Browser.nextWgetRequestHandle++
        return handle
      },
    }
    function _emscripten_async_call(func, arg, millis) {
      Module['noExitRuntime'] = true
      function wrapper() {
        Runtime.getFuncWrapper(func, 'vi')(arg)
      }
      if (millis >= 0) {
        Browser.safeSetTimeout(wrapper, millis)
      } else {
        Browser.safeRequestAnimationFrame(wrapper)
      }
    }
    function ___syscall146(which, varargs) {
      SYSCALLS.varargs = varargs
      try {
        var stream = SYSCALLS.get(),
          iov = SYSCALLS.get(),
          iovcnt = SYSCALLS.get()
        var ret = 0
        if (!___syscall146.buffer) {
          ___syscall146.buffers = [null, [], []]
          ___syscall146.printChar = function (stream, curr) {
            var buffer = ___syscall146.buffers[stream]
            assert(buffer)
            if (curr === 0 || curr === 10) {
              ;(stream === 1 ? Module['print'] : Module['printErr'])(UTF8ArrayToString(buffer, 0))
              buffer.length = 0
            } else {
              buffer.push(curr)
            }
          }
        }
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAP32[(iov + i * 8) >> 2]
          var len = HEAP32[(iov + (i * 8 + 4)) >> 2]
          for (var j = 0; j < len; j++) {
            ___syscall146.printChar(stream, HEAPU8[ptr + j])
          }
          ret += len
        }
        return ret
      } catch (e) {
        if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
        return -e.errno
      }
    }
    function ___syscall221(which, varargs) {
      SYSCALLS.varargs = varargs
      try {
        return 0
      } catch (e) {
        if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
        return -e.errno
      }
    }
    function ___syscall145(which, varargs) {
      SYSCALLS.varargs = varargs
      try {
        var stream = SYSCALLS.getStreamFromFD(),
          iov = SYSCALLS.get(),
          iovcnt = SYSCALLS.get()
        return SYSCALLS.doReadv(stream, iov, iovcnt)
      } catch (e) {
        if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
        return -e.errno
      }
    }
    if (ENVIRONMENT_IS_NODE) {
      _emscripten_get_now = function _emscripten_get_now_actual() {
        var t = process['hrtime']()
        return t[0] * 1e3 + t[1] / 1e6
      }
    } else if (typeof dateNow !== 'undefined') {
      _emscripten_get_now = dateNow
    } else if (
      typeof self === 'object' &&
      self['performance'] &&
      typeof self['performance']['now'] === 'function'
    ) {
      _emscripten_get_now = function () {
        return self['performance']['now']()
      }
    } else if (typeof performance === 'object' && typeof performance['now'] === 'function') {
      _emscripten_get_now = function () {
        return performance['now']()
      }
    } else {
      _emscripten_get_now = Date.now
    }
    ___buildEnvironment(ENV)
    Module['requestFullScreen'] = function Module_requestFullScreen(
      lockPointer,
      resizeCanvas,
      vrDevice
    ) {
      Module.printErr(
        'Module.requestFullScreen is deprecated. Please call Module.requestFullscreen instead.'
      )
      Module['requestFullScreen'] = Module['requestFullscreen']
      Browser.requestFullScreen(lockPointer, resizeCanvas, vrDevice)
    }
    Module['requestFullscreen'] = function Module_requestFullscreen(
      lockPointer,
      resizeCanvas,
      vrDevice
    ) {
      Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice)
    }
    Module['requestAnimationFrame'] = function Module_requestAnimationFrame(func) {
      Browser.requestAnimationFrame(func)
    }
    Module['setCanvasSize'] = function Module_setCanvasSize(width, height, noUpdates) {
      Browser.setCanvasSize(width, height, noUpdates)
    }
    Module['pauseMainLoop'] = function Module_pauseMainLoop() {
      Browser.mainLoop.pause()
    }
    Module['resumeMainLoop'] = function Module_resumeMainLoop() {
      Browser.mainLoop.resume()
    }
    Module['getUserMedia'] = function Module_getUserMedia() {
      Browser.getUserMedia()
    }
    Module['createContext'] = function Module_createContext(
      canvas,
      useWebGL,
      setInModule,
      webGLContextAttributes
    ) {
      return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes)
    }
    __ATEXIT__.push(function () {
      var fflush = Module['_fflush']
      if (fflush) fflush(0)
      var printChar = ___syscall146.printChar
      if (!printChar) return
      var buffers = ___syscall146.buffers
      if (buffers[1].length) printChar(1, 10)
      if (buffers[2].length) printChar(2, 10)
    })
    DYNAMICTOP_PTR = allocate(1, 'i32', ALLOC_STATIC)
    STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP)
    STACK_MAX = STACK_BASE + TOTAL_STACK
    DYNAMIC_BASE = Runtime.alignMemory(STACK_MAX)
    HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE
    staticSealed = true
    Module['wasmTableSize'] = 730
    Module['wasmMaxTableSize'] = 730
    function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
      try {
        return Module['dynCall_iiiiiiii'](index, a1, a2, a3, a4, a5, a6, a7)
      } catch (e) {
        if (typeof e !== 'number' && e !== 'longjmp') throw e
        Module['setThrew'](1, 0)
      }
    }
    function invoke_iiii(index, a1, a2, a3) {
      try {
        return Module['dynCall_iiii'](index, a1, a2, a3)
      } catch (e) {
        if (typeof e !== 'number' && e !== 'longjmp') throw e
        Module['setThrew'](1, 0)
      }
    }
    function invoke_viiiii(index, a1, a2, a3, a4, a5) {
      try {
        Module['dynCall_viiiii'](index, a1, a2, a3, a4, a5)
      } catch (e) {
        if (typeof e !== 'number' && e !== 'longjmp') throw e
        Module['setThrew'](1, 0)
      }
    }
    function invoke_iiiiiid(index, a1, a2, a3, a4, a5, a6) {
      try {
        return Module['dynCall_iiiiiid'](index, a1, a2, a3, a4, a5, a6)
      } catch (e) {
        if (typeof e !== 'number' && e !== 'longjmp') throw e
        Module['setThrew'](1, 0)
      }
    }
    function invoke_vi(index, a1) {
      try {
        Module['dynCall_vi'](index, a1)
      } catch (e) {
        if (typeof e !== 'number' && e !== 'longjmp') throw e
        Module['setThrew'](1, 0)
      }
    }
    function invoke_vii(index, a1, a2) {
      try {
        Module['dynCall_vii'](index, a1, a2)
      } catch (e) {
        if (typeof e !== 'number' && e !== 'longjmp') throw e
        Module['setThrew'](1, 0)
      }
    }
    function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
      try {
        return Module['dynCall_iiiiiii'](index, a1, a2, a3, a4, a5, a6)
      } catch (e) {
        if (typeof e !== 'number' && e !== 'longjmp') throw e
        Module['setThrew'](1, 0)
      }
    }
    function invoke_iiiiid(index, a1, a2, a3, a4, a5) {
      try {
        return Module['dynCall_iiiiid'](index, a1, a2, a3, a4, a5)
      } catch (e) {
        if (typeof e !== 'number' && e !== 'longjmp') throw e
        Module['setThrew'](1, 0)
      }
    }
    function invoke_ii(index, a1) {
      try {
        return Module['dynCall_ii'](index, a1)
      } catch (e) {
        if (typeof e !== 'number' && e !== 'longjmp') throw e
        Module['setThrew'](1, 0)
      }
    }
    function invoke_viijii(index, a1, a2, a3, a4, a5, a6) {
      try {
        Module['dynCall_viijii'](index, a1, a2, a3, a4, a5, a6)
      } catch (e) {
        if (typeof e !== 'number' && e !== 'longjmp') throw e
        Module['setThrew'](1, 0)
      }
    }
    function invoke_iiiiij(index, a1, a2, a3, a4, a5, a6) {
      try {
        return Module['dynCall_iiiiij'](index, a1, a2, a3, a4, a5, a6)
      } catch (e) {
        if (typeof e !== 'number' && e !== 'longjmp') throw e
        Module['setThrew'](1, 0)
      }
    }
    function invoke_viii(index, a1, a2, a3) {
      try {
        Module['dynCall_viii'](index, a1, a2, a3)
      } catch (e) {
        if (typeof e !== 'number' && e !== 'longjmp') throw e
        Module['setThrew'](1, 0)
      }
    }
    function invoke_v(index) {
      try {
        Module['dynCall_v'](index)
      } catch (e) {
        if (typeof e !== 'number' && e !== 'longjmp') throw e
        Module['setThrew'](1, 0)
      }
    }
    function invoke_iiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
      try {
        return Module['dynCall_iiiiiiiii'](index, a1, a2, a3, a4, a5, a6, a7, a8)
      } catch (e) {
        if (typeof e !== 'number' && e !== 'longjmp') throw e
        Module['setThrew'](1, 0)
      }
    }
    function invoke_iiiii(index, a1, a2, a3, a4) {
      try {
        return Module['dynCall_iiiii'](index, a1, a2, a3, a4)
      } catch (e) {
        if (typeof e !== 'number' && e !== 'longjmp') throw e
        Module['setThrew'](1, 0)
      }
    }
    function invoke_viiiiii(index, a1, a2, a3, a4, a5, a6) {
      try {
        Module['dynCall_viiiiii'](index, a1, a2, a3, a4, a5, a6)
      } catch (e) {
        if (typeof e !== 'number' && e !== 'longjmp') throw e
        Module['setThrew'](1, 0)
      }
    }
    function invoke_iii(index, a1, a2) {
      try {
        return Module['dynCall_iii'](index, a1, a2)
      } catch (e) {
        if (typeof e !== 'number' && e !== 'longjmp') throw e
        Module['setThrew'](1, 0)
      }
    }
    function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
      try {
        return Module['dynCall_iiiiii'](index, a1, a2, a3, a4, a5)
      } catch (e) {
        if (typeof e !== 'number' && e !== 'longjmp') throw e
        Module['setThrew'](1, 0)
      }
    }
    function invoke_viiii(index, a1, a2, a3, a4) {
      try {
        Module['dynCall_viiii'](index, a1, a2, a3, a4)
      } catch (e) {
        if (typeof e !== 'number' && e !== 'longjmp') throw e
        Module['setThrew'](1, 0)
      }
    }
    Module.asmGlobalArg = {
      Math: Math,
      Int8Array: Int8Array,
      Int16Array: Int16Array,
      Int32Array: Int32Array,
      Uint8Array: Uint8Array,
      Uint16Array: Uint16Array,
      Uint32Array: Uint32Array,
      Float32Array: Float32Array,
      Float64Array: Float64Array,
      NaN: NaN,
      Infinity: Infinity,
    }
    Module.asmLibraryArg = {
      abort: abort,
      assert: assert,
      enlargeMemory: enlargeMemory,
      getTotalMemory: getTotalMemory,
      abortOnCannotGrowMemory: abortOnCannotGrowMemory,
      invoke_iiiiiiii: invoke_iiiiiiii,
      invoke_iiii: invoke_iiii,
      invoke_viiiii: invoke_viiiii,
      invoke_iiiiiid: invoke_iiiiiid,
      invoke_vi: invoke_vi,
      invoke_vii: invoke_vii,
      invoke_iiiiiii: invoke_iiiiiii,
      invoke_iiiiid: invoke_iiiiid,
      invoke_ii: invoke_ii,
      invoke_viijii: invoke_viijii,
      invoke_iiiiij: invoke_iiiiij,
      invoke_viii: invoke_viii,
      invoke_v: invoke_v,
      invoke_iiiiiiiii: invoke_iiiiiiiii,
      invoke_iiiii: invoke_iiiii,
      invoke_viiiiii: invoke_viiiiii,
      invoke_iii: invoke_iii,
      invoke_iiiiii: invoke_iiiiii,
      invoke_viiii: invoke_viiii,
      ___syscall221: ___syscall221,
      _pthread_cond_wait: _pthread_cond_wait,
      ___lock: ___lock,
      _emscripten_get_now_is_monotonic: _emscripten_get_now_is_monotonic,
      _llvm_pow_f64: _llvm_pow_f64,
      _abort: _abort,
      ___atomic_fetch_add_8: ___atomic_fetch_add_8,
      ___setErrNo: ___setErrNo,
      ___assert_fail: ___assert_fail,
      _pthread_join: _pthread_join,
      ___buildEnvironment: ___buildEnvironment,
      __isLeapYear: __isLeapYear,
      _clock_gettime: _clock_gettime,
      _strftime_l: _strftime_l,
      _llvm_cttz_i32: _llvm_cttz_i32,
      _emscripten_set_main_loop_timing: _emscripten_set_main_loop_timing,
      _emscripten_memcpy_big: _emscripten_memcpy_big,
      _pthread_attr_init: _pthread_attr_init,
      __ZSt18uncaught_exceptionv: __ZSt18uncaught_exceptionv,
      __exit: __exit,
      _strftime: _strftime,
      __arraySum: __arraySum,
      ___syscall91: ___syscall91,
      _pthread_cond_signal: _pthread_cond_signal,
      _pthread_mutex_destroy: _pthread_mutex_destroy,
      _pthread_attr_setstacksize: _pthread_attr_setstacksize,
      _getenv: _getenv,
      ___map_file: ___map_file,
      ___syscall54: ___syscall54,
      ___unlock: ___unlock,
      _pthread_create: _pthread_create,
      _emscripten_set_main_loop: _emscripten_set_main_loop,
      _emscripten_get_now: _emscripten_get_now,
      _llvm_cttz_i64: _llvm_cttz_i64,
      __addDays: __addDays,
      ___syscall6: ___syscall6,
      ___syscall5: ___syscall5,
      _emscripten_async_call: _emscripten_async_call,
      ___atomic_store_8: ___atomic_store_8,
      _pthread_cond_destroy: _pthread_cond_destroy,
      ___syscall140: ___syscall140,
      _exit: _exit,
      ___atomic_load_8: ___atomic_load_8,
      ___syscall145: ___syscall145,
      ___syscall146: ___syscall146,
      DYNAMICTOP_PTR: DYNAMICTOP_PTR,
      tempDoublePtr: tempDoublePtr,
      ABORT: ABORT,
      STACKTOP: STACKTOP,
      STACK_MAX: STACK_MAX,
      cttz_i8: cttz_i8,
    }
    var asm = Module['asm'](Module.asmGlobalArg, Module.asmLibraryArg, buffer)
    var stackSave = (Module['stackSave'] = asm['stackSave'])
    var __GLOBAL__sub_I_misc_cpp = (Module['__GLOBAL__sub_I_misc_cpp'] =
      asm['__GLOBAL__sub_I_misc_cpp'])
    var _uci_command = (Module['_uci_command'] = asm['_uci_command'])
    var _init = (Module['_init'] = asm['_init'])
    var __GLOBAL__sub_I_main_cpp = (Module['__GLOBAL__sub_I_main_cpp'] =
      asm['__GLOBAL__sub_I_main_cpp'])
    var __GLOBAL__sub_I_material_cpp = (Module['__GLOBAL__sub_I_material_cpp'] =
      asm['__GLOBAL__sub_I_material_cpp'])
    var establishStackSpace = (Module['establishStackSpace'] = asm['establishStackSpace'])
    var setThrew = (Module['setThrew'] = asm['setThrew'])
    var __GLOBAL__sub_I_endgame_cpp = (Module['__GLOBAL__sub_I_endgame_cpp'] =
      asm['__GLOBAL__sub_I_endgame_cpp'])
    var _llvm_ctlz_i64 = (Module['_llvm_ctlz_i64'] = asm['_llvm_ctlz_i64'])
    var stackRestore = (Module['stackRestore'] = asm['stackRestore'])
    var __GLOBAL__sub_I_bitbase_cpp = (Module['__GLOBAL__sub_I_bitbase_cpp'] =
      asm['__GLOBAL__sub_I_bitbase_cpp'])
    var _memset = (Module['_memset'] = asm['_memset'])
    var _sbrk = (Module['_sbrk'] = asm['_sbrk'])
    var _memcpy = (Module['_memcpy'] = asm['_memcpy'])
    var __GLOBAL__sub_I_movegen_cpp = (Module['__GLOBAL__sub_I_movegen_cpp'] =
      asm['__GLOBAL__sub_I_movegen_cpp'])
    var __GLOBAL__sub_I_position_cpp = (Module['__GLOBAL__sub_I_position_cpp'] =
      asm['__GLOBAL__sub_I_position_cpp'])
    var __GLOBAL__sub_I_pawns_cpp = (Module['__GLOBAL__sub_I_pawns_cpp'] =
      asm['__GLOBAL__sub_I_pawns_cpp'])
    var stackAlloc = (Module['stackAlloc'] = asm['stackAlloc'])
    var __GLOBAL__sub_I_ucioption_cpp = (Module['__GLOBAL__sub_I_ucioption_cpp'] =
      asm['__GLOBAL__sub_I_ucioption_cpp'])
    var getTempRet0 = (Module['getTempRet0'] = asm['getTempRet0'])
    var __GLOBAL__sub_I_bitboard_cpp = (Module['__GLOBAL__sub_I_bitboard_cpp'] =
      asm['__GLOBAL__sub_I_bitboard_cpp'])
    var setTempRet0 = (Module['setTempRet0'] = asm['setTempRet0'])
    var _i64Add = (Module['_i64Add'] = asm['_i64Add'])
    var __GLOBAL__sub_I_thread_cpp = (Module['__GLOBAL__sub_I_thread_cpp'] =
      asm['__GLOBAL__sub_I_thread_cpp'])
    var _pthread_mutex_unlock = (Module['_pthread_mutex_unlock'] = asm['_pthread_mutex_unlock'])
    var __GLOBAL__I_000101 = (Module['__GLOBAL__I_000101'] = asm['__GLOBAL__I_000101'])
    var _emscripten_get_global_libc = (Module['_emscripten_get_global_libc'] =
      asm['_emscripten_get_global_libc'])
    var __GLOBAL__sub_I_iostream_cpp = (Module['__GLOBAL__sub_I_iostream_cpp'] =
      asm['__GLOBAL__sub_I_iostream_cpp'])
    var __GLOBAL__sub_I_timeman_cpp = (Module['__GLOBAL__sub_I_timeman_cpp'] =
      asm['__GLOBAL__sub_I_timeman_cpp'])
    var _pthread_cond_broadcast = (Module['_pthread_cond_broadcast'] =
      asm['_pthread_cond_broadcast'])
    var _llvm_bswap_i32 = (Module['_llvm_bswap_i32'] = asm['_llvm_bswap_i32'])
    var _free = (Module['_free'] = asm['_free'])
    var runPostSets = (Module['runPostSets'] = asm['runPostSets'])
    var _round = (Module['_round'] = asm['_round'])
    var __GLOBAL__sub_I_tt_cpp = (Module['__GLOBAL__sub_I_tt_cpp'] = asm['__GLOBAL__sub_I_tt_cpp'])
    var _memmove = (Module['_memmove'] = asm['_memmove'])
    var __GLOBAL__sub_I_evaluate_cpp = (Module['__GLOBAL__sub_I_evaluate_cpp'] =
      asm['__GLOBAL__sub_I_evaluate_cpp'])
    var __GLOBAL__sub_I_psqt_cpp = (Module['__GLOBAL__sub_I_psqt_cpp'] =
      asm['__GLOBAL__sub_I_psqt_cpp'])
    var _malloc = (Module['_malloc'] = asm['_malloc'])
    var __GLOBAL__sub_I_search_cpp = (Module['__GLOBAL__sub_I_search_cpp'] =
      asm['__GLOBAL__sub_I_search_cpp'])
    var _pthread_mutex_lock = (Module['_pthread_mutex_lock'] = asm['_pthread_mutex_lock'])
    var __GLOBAL__sub_I_movepick_cpp = (Module['__GLOBAL__sub_I_movepick_cpp'] =
      asm['__GLOBAL__sub_I_movepick_cpp'])
    var __GLOBAL__sub_I_uci_cpp = (Module['__GLOBAL__sub_I_uci_cpp'] =
      asm['__GLOBAL__sub_I_uci_cpp'])
    var dynCall_iiiiiiii = (Module['dynCall_iiiiiiii'] = asm['dynCall_iiiiiiii'])
    var dynCall_iiii = (Module['dynCall_iiii'] = asm['dynCall_iiii'])
    var dynCall_viiiii = (Module['dynCall_viiiii'] = asm['dynCall_viiiii'])
    var dynCall_iiiiiid = (Module['dynCall_iiiiiid'] = asm['dynCall_iiiiiid'])
    var dynCall_vi = (Module['dynCall_vi'] = asm['dynCall_vi'])
    var dynCall_vii = (Module['dynCall_vii'] = asm['dynCall_vii'])
    var dynCall_iiiiiii = (Module['dynCall_iiiiiii'] = asm['dynCall_iiiiiii'])
    var dynCall_iiiiid = (Module['dynCall_iiiiid'] = asm['dynCall_iiiiid'])
    var dynCall_ii = (Module['dynCall_ii'] = asm['dynCall_ii'])
    var dynCall_viijii = (Module['dynCall_viijii'] = asm['dynCall_viijii'])
    var dynCall_iiiiij = (Module['dynCall_iiiiij'] = asm['dynCall_iiiiij'])
    var dynCall_viii = (Module['dynCall_viii'] = asm['dynCall_viii'])
    var dynCall_v = (Module['dynCall_v'] = asm['dynCall_v'])
    var dynCall_iiiiiiiii = (Module['dynCall_iiiiiiiii'] = asm['dynCall_iiiiiiiii'])
    var dynCall_iiiii = (Module['dynCall_iiiii'] = asm['dynCall_iiiii'])
    var dynCall_viiiiii = (Module['dynCall_viiiiii'] = asm['dynCall_viiiiii'])
    var dynCall_iii = (Module['dynCall_iii'] = asm['dynCall_iii'])
    var dynCall_iiiiii = (Module['dynCall_iiiiii'] = asm['dynCall_iiiiii'])
    var dynCall_viiii = (Module['dynCall_viiii'] = asm['dynCall_viiii'])
    Runtime.stackAlloc = Module['stackAlloc']
    Runtime.stackSave = Module['stackSave']
    Runtime.stackRestore = Module['stackRestore']
    Runtime.establishStackSpace = Module['establishStackSpace']
    Runtime.setTempRet0 = Module['setTempRet0']
    Runtime.getTempRet0 = Module['getTempRet0']
    Module['asm'] = asm
    if (memoryInitializer) {
      if (typeof Module['locateFile'] === 'function') {
        memoryInitializer = Module['locateFile'](memoryInitializer)
      } else if (Module['memoryInitializerPrefixURL']) {
        memoryInitializer = Module['memoryInitializerPrefixURL'] + memoryInitializer
      }
      if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
        var data = Module['readBinary'](memoryInitializer)
        HEAPU8.set(data, Runtime.GLOBAL_BASE)
      } else {
        addRunDependency('memory initializer')
        var applyMemoryInitializer = function (data) {
          if (data.byteLength) data = new Uint8Array(data)
          HEAPU8.set(data, Runtime.GLOBAL_BASE)
          if (Module['memoryInitializerRequest']) delete Module['memoryInitializerRequest'].response
          removeRunDependency('memory initializer')
        }
        function doBrowserLoad() {
          Module['readAsync'](memoryInitializer, applyMemoryInitializer, function () {
            throw 'could not load memory initializer ' + memoryInitializer
          })
        }
        if (Module['memoryInitializerRequest']) {
          function useRequest() {
            var request = Module['memoryInitializerRequest']
            if (request.status !== 200 && request.status !== 0) {
              console.warn(
                'a problem seems to have happened with Module.memoryInitializerRequest, status: ' +
                  request.status +
                  ', retrying ' +
                  memoryInitializer
              )
              doBrowserLoad()
              return
            }
            applyMemoryInitializer(request.response)
          }
          if (Module['memoryInitializerRequest'].response) {
            setTimeout(useRequest, 0)
          } else {
            Module['memoryInitializerRequest'].addEventListener('load', useRequest)
          }
        } else {
          doBrowserLoad()
        }
      }
    }
    function ExitStatus(status) {
      this.name = 'ExitStatus'
      this.message = 'Program terminated with exit(' + status + ')'
      this.status = status
    }
    ExitStatus.prototype = new Error()
    ExitStatus.prototype.constructor = ExitStatus
    var initialStackTop
    var preloadStartTime = null
    var calledMain = false
    dependenciesFulfilled = function runCaller() {
      if (!Module['calledRun']) run()
      if (!Module['calledRun']) dependenciesFulfilled = runCaller
    }
    Module['callMain'] = Module.callMain = function callMain(args) {
      args = args || []
      ensureInitRuntime()
      var argc = args.length + 1
      function pad() {
        for (var i = 0; i < 4 - 1; i++) {
          argv.push(0)
        }
      }
      var argv = [allocate(intArrayFromString(Module['thisProgram']), 'i8', ALLOC_NORMAL)]
      pad()
      for (var i = 0; i < argc - 1; i = i + 1) {
        argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL))
        pad()
      }
      argv.push(0)
      argv = allocate(argv, 'i32', ALLOC_NORMAL)
      try {
        var ret = Module['_main'](argc, argv, 0)
        exit(ret, true)
      } catch (e) {
        if (e instanceof ExitStatus) {
          return
        } else if (e == 'SimulateInfiniteLoop') {
          Module['noExitRuntime'] = true
          return
        } else {
          var toLog = e
          if (e && typeof e === 'object' && e.stack) {
            toLog = [e, e.stack]
          }
          Module.printErr('exception thrown: ' + toLog)
          Module['quit'](1, e)
        }
      } finally {
        calledMain = true
      }
    }
    function run(args) {
      args = args || Module['arguments']
      if (preloadStartTime === null) preloadStartTime = Date.now()
      if (runDependencies > 0) {
        return
      }
      preRun()
      if (runDependencies > 0) return
      if (Module['calledRun']) return
      function doRun() {
        if (Module['calledRun']) return
        Module['calledRun'] = true
        if (ABORT) return
        ensureInitRuntime()
        preMain()
        if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']()
        if (Module['_main'] && shouldRunNow) Module['callMain'](args)
        postRun()
      }
      if (Module['setStatus']) {
        Module['setStatus']('Running...')
        setTimeout(function () {
          setTimeout(function () {
            Module['setStatus']('')
          }, 1)
          doRun()
        }, 1)
      } else {
        doRun()
      }
    }
    Module['run'] = Module.run = run
    function exit(status, implicit) {
      if (implicit && Module['noExitRuntime']) {
        return
      }
      if (Module['noExitRuntime']) {
      } else {
        ABORT = true
        EXITSTATUS = status
        STACKTOP = initialStackTop
        exitRuntime()
        if (Module['onExit']) Module['onExit'](status)
      }
      if (ENVIRONMENT_IS_NODE) {
        process['exit'](status)
      }
      Module['quit'](status, new ExitStatus(status))
    }
    Module['exit'] = Module.exit = exit
    var abortDecorators = []
    function abort(what) {
      if (Module['onAbort']) {
        Module['onAbort'](what)
      }
      if (what !== undefined) {
        Module.print(what)
        Module.printErr(what)
        what = JSON.stringify(what)
      } else {
        what = ''
      }
      ABORT = true
      EXITSTATUS = 1
      var extra =
        '\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.'
      var output = 'abort(' + what + ') at ' + stackTrace() + extra
      if (abortDecorators) {
        abortDecorators.forEach(function (decorator) {
          output = decorator(output, what)
        })
      }
      throw output
    }
    Module['abort'] = Module.abort = abort
    if (Module['preInit']) {
      if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']]
      while (Module['preInit'].length > 0) {
        Module['preInit'].pop()()
      }
    }
    var shouldRunNow = true
    if (Module['noInitialRun']) {
      shouldRunNow = false
    }
    Module['noExitRuntime'] = true
    run()
    var ourSetImmediate = (function (global, undefined) {
      'use strict'
      if (global.setImmediate) {
        try {
          return global.setImmediate.bind(global)
        } catch (e) {
          return global.setImmediate
        }
      }
      var nextHandle = 1
      var tasksByHandle = {}
      var currentlyRunningATask = false
      var doc = global.document
      var setImmediate
      function addFromSetImmediateArguments(args) {
        tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args)
        return nextHandle++
      }
      function partiallyApplied(handler) {
        var args = [].slice.call(arguments, 1)
        return function () {
          if (typeof handler === 'function') {
            handler.apply(undefined, args)
          } else {
            new Function('' + handler)()
          }
        }
      }
      function runIfPresent(handle) {
        if (currentlyRunningATask) {
          setTimeout(partiallyApplied(runIfPresent, handle), 0)
        } else {
          var task = tasksByHandle[handle]
          if (task) {
            currentlyRunningATask = true
            try {
              task()
            } finally {
              clearImmediate(handle)
              currentlyRunningATask = false
            }
          }
        }
      }
      function clearImmediate(handle) {
        delete tasksByHandle[handle]
      }
      function installNextTickImplementation() {
        setImmediate = function () {
          var handle = addFromSetImmediateArguments(arguments)
          process.nextTick(partiallyApplied(runIfPresent, handle))
          return handle
        }
      }
      function canUsePostMessage() {
        if (global.postMessage && !global.importScripts) {
          var postMessageIsAsynchronous = true
          var oldOnMessage = global.onmessage
          global.onmessage = function () {
            postMessageIsAsynchronous = false
          }
          global.postMessage('', '*')
          global.onmessage = oldOnMessage
          return postMessageIsAsynchronous
        }
      }
      function installPostMessageImplementation() {
        var messagePrefix = 'setImmediate$' + Math.random() + '$'
        var onGlobalMessage = function (event) {
          if (
            event.source === global &&
            typeof event.data === 'string' &&
            event.data.indexOf(messagePrefix) === 0
          ) {
            runIfPresent(+event.data.slice(messagePrefix.length))
          }
        }
        if (global.addEventListener) {
          global.addEventListener('message', onGlobalMessage, false)
        } else {
          global.attachEvent('onmessage', onGlobalMessage)
        }
        setImmediate = function () {
          var handle = addFromSetImmediateArguments(arguments)
          global.postMessage(messagePrefix + handle, '*')
          return handle
        }
      }
      function installMessageChannelImplementation() {
        var channel = new MessageChannel()
        channel.port1.onmessage = function (event) {
          var handle = event.data
          runIfPresent(handle)
        }
        setImmediate = function () {
          var handle = addFromSetImmediateArguments(arguments)
          channel.port2.postMessage(handle)
          return handle
        }
      }
      function installReadyStateChangeImplementation() {
        var html = doc.documentElement
        setImmediate = function () {
          var handle = addFromSetImmediateArguments(arguments)
          var script = doc.createElement('script')
          script.onreadystatechange = function () {
            runIfPresent(handle)
            script.onreadystatechange = null
            html.removeChild(script)
            script = null
          }
          html.appendChild(script)
          return handle
        }
      }
      function installSetTimeoutImplementation() {
        setImmediate = function () {
          var handle = addFromSetImmediateArguments(arguments)
          setTimeout(partiallyApplied(runIfPresent, handle), 0)
          return handle
        }
      }
      if ({}.toString.call(global.process) === '[object process]') {
        installNextTickImplementation()
      } else if (canUsePostMessage()) {
        installPostMessageImplementation()
      } else if (global.MessageChannel) {
        installMessageChannelImplementation()
      } else if (doc && 'onreadystatechange' in doc.createElement('script')) {
        installReadyStateChangeImplementation()
      } else {
        installSetTimeoutImplementation()
      }
      return setImmediate
    })(typeof self === 'undefined' ? (typeof global === 'undefined' ? this : global) : self)
    Browser.requestAnimationFrame = ourSetImmediate
    return Module
  }
  return function (WasmPath) {
    var myConsole,
      Module,
      workerObj,
      cmds = [],
      wait = typeof setImmediate === 'function' ? setImmediate : setTimeout
    myConsole = {
      log: function log(line) {
        if (workerObj.onmessage) {
          workerObj.onmessage(line)
        } else {
          console.error('You must set onmessage')
          console.info(line)
        }
      },
      time: function time(s) {
        if (typeof console !== 'undefined' && console.time) console.time(s)
      },
      timeEnd: function timeEnd(s) {
        if (typeof console !== 'undefined' && console.timeEnd) console.timeEnd(s)
      },
    }
    myConsole.warn = myConsole.log
    workerObj = {
      postMessage: function sendMessage(str, sync) {
        function ccall() {
          if (Module) {
            Module.ccall('uci_command', 'number', ['string'], [cmds.shift()])
          } else {
            setTimeout(ccall, 100)
          }
        }
        cmds.push(str)
        if (sync) {
          ccall()
        } else {
          wait(ccall, 1)
        }
      },
    }
    wait(function () {
      Module = load_stockfish(myConsole, WasmPath)
      if (Module.print) {
        Module.print = myConsole.log
      }
      if (Module.printErr) {
        Module.printErr = myConsole.log
      }
      Module.ccall('init', 'number', [], [])
    }, 1)
    return workerObj
  }
})()
;(function () {
  var isNode, stockfish
  function completer(line) {
    var completions = [
      'd',
      'eval',
      'exit',
      'flip',
      'go',
      'isready',
      'ponderhit',
      'position fen ',
      'position startpos',
      'position startpos moves',
      'quit',
      'setoption name Clear Hash value ',
      'setoption name Contempt value ',
      'setoption name Hash value ',
      'setoption name Minimum Thinking Time value ',
      'setoption name Move Overhead value ',
      'setoption name MultiPV value ',
      'setoption name Ponder value ',
      'setoption name Skill Level Maximum Error value ',
      'setoption name Skill Level Probability value ',
      'setoption name Skill Level value ',
      'setoption name Slow Mover value ',
      'setoption name Threads value ',
      'setoption name UCI_Chess960 value false',
      'setoption name UCI_Chess960 value true',
      'setoption name UCI_Variant value chess',
      'setoption name UCI_Variant value atomic',
      'setoption name UCI_Variant value crazyhouse',
      'setoption name UCI_Variant value giveaway',
      'setoption name UCI_Variant value horde',
      'setoption name UCI_Variant value kingofthehill',
      'setoption name UCI_Variant value racingkings',
      'setoption name UCI_Variant value relay',
      'setoption name UCI_Variant value threecheck',
      'setoption name nodestime value ',
      'stop',
      'uci',
      'ucinewgame',
    ]
    var completionsMid = [
      'binc ',
      'btime ',
      'confidence ',
      'depth ',
      'infinite ',
      'mate ',
      'maxdepth ',
      'maxtime ',
      'mindepth ',
      'mintime ',
      'moves ',
      'movestogo ',
      'movetime ',
      'ponder ',
      'searchmoves ',
      'shallow ',
      'winc ',
      'wtime ',
    ]
    function filter(c) {
      return c.indexOf(line) === 0
    }
    var hits = completions.filter(filter)
    if (!hits.length) {
      line = line.replace(/^.*\s/, '')
      if (line) {
        hits = completionsMid.filter(filter)
      } else {
        hits = completionsMid
      }
    }
    return [hits, line]
  }
  isNode =
    typeof global !== 'undefined' &&
    Object.prototype.toString.call(global.process) === '[object process]'
  if (isNode) {
    if (require.main === module) {
      stockfish = STOCKFISH(require('path').join(__dirname, 'stockfish.wasm'))
      stockfish.onmessage = function onlog(line) {
        console.log(line)
      }
      require('readline')
        .createInterface({
          input: process.stdin,
          output: process.stdout,
          completer: completer,
          historySize: 100,
        })
        .on('line', function online(line) {
          if (line) {
            if (line === 'quit' || line === 'exit') {
              process.exit()
            }
            stockfish.postMessage(line, true)
          }
        })
        .setPrompt('')
      process.stdin.on('end', function onend() {
        process.exit()
      })
    } else {
      module.exports = STOCKFISH
    }
  } else if (
    typeof onmessage !== 'undefined' &&
    (typeof window === 'undefined' || typeof window.document === 'undefined')
  ) {
    if (self && self.location && self.location.hash) {
      stockfish = STOCKFISH(self.location.hash.substr(1))
    } else {
      stockfish = STOCKFISH()
    }
    onmessage = function (event) {
      stockfish.postMessage(event.data, true)
    }
    stockfish.onmessage = function onlog(line) {
      postMessage(line)
    }
  }
})()
