

exports.join = function(value, arg) {
   return value.join(arg);
}

exports.slice = function(value, arg) {
   var bits = arg.split(':');
   return value.slice.apply(value, bits);
}