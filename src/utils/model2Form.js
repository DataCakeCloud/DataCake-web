const map = {};

export function tag(Component, label) {
  return function dec(target, name, descriptor) {
    map[name] = { Component, label };
  };
}
