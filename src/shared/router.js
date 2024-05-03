export class Router {
  #routes = [];

  get(pattern, handler) {
    this.#addRoute("GET", pattern, handler);
  }
  post(pattern, handler) {
    this.#addRoute("POST", pattern, handler);
  }
  put(pattern, handler) {
    this.#addRoute("PUT", pattern, handler);
  }
  delete(pattern, handler) {
    this.#addRoute("DELETE", pattern, handler);
  }

  #addRoute(method, pattern, handler) {
    const regex = this.#patternToRegex(pattern);
    this.#routes.push({ method, pattern, handler, regex });
  }

  #patternToRegex(pattern) {
    const escapedPattern = pattern.replace(/\//g, "\\/");
    const parameterizedPattern = escapedPattern.replace(/:\w+/g, "([^/]+)");
    const wildcardPattern = parameterizedPattern.replace(/\*/g, "([^/]+)");
    const regexPattern = `^${wildcardPattern}(?:\\/?)$`;
    return new RegExp(regexPattern);
  }

  #matchPattern(pattern, path) {
    const regex = this.#patternToRegex(pattern);
    return regex.test(path);
  }

  #findRoute(method, path) {
    return this.#routes.find(
      (route) =>
        route.method === method && this.#matchPattern(route.pattern, path)
    );
  }

  #mergeParams(tokens, params) {
    return tokens.reduce((acc, token, index) => {
      const key = token === "*" ? index : token.slice(1);
      return { ...acc, [key]: params[index] };
    }, {});
  }

  #getParams(pattern, path) {
    const regex = this.#patternToRegex(pattern);
    const tokens = pattern.match(regex).slice(1);
    const params = path.match(regex).slice(1);
    return this.#mergeParams(tokens, params);
  }

  async handle(pathname, method = "GET") {
    const route = this.#findRoute(method, pathname);
    if (!route) {
      throw new Error(`Route not found: ${method} ${pathname}`);
    }
    const params = this.#getParams(route.pattern, pathname);
    return await route.handler(params);
  }
}
