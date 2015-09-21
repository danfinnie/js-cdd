angular.module('app', ['ui.ace']).controller('ctrl', function($scope) {
  $scope.tests = 'describe("kitten", function() {\n' +
    '  it("returns kitten", function() {\n' +
    '    expect(kitten()).toEqual("kitten");\n' +
    '  });\n' +
    '});\n';

  $scope.code = 'var kitten = function() {\n' +
    '  return "kitten";\n' +
    '};\n';

  $scope.aceConfig = {
    mode: "javascript",
    workerPath: "./",
    advanced: {
        fontSize: '16px'
    }
  };

  $scope.$watchGroup(['code', 'tests'], function() {
    window.jasmine = jasmineRequire.core(jasmineRequire);

    /**
     * Since this is being run in a browser and the results should populate to an HTML page, require the HTML-specific Jasmine code, injecting the same reference.
     */
    jasmineRequire.html(jasmine);

    /**
     * Create the Jasmine environment. This is used to run all specs in a project.
     */
    var env = jasmine.getEnv();

    /**
     * ## The Global Interface
     *
     * Build up the functions that will be exposed as the Jasmine public interface. A project can customize, rename or alias any of these functions as desired, provided the implementation remains unchanged.
     */
    var jasmineInterface = jasmineRequire.interface(jasmine, env);

    /**
     * Add all of the Jasmine global/public interface to the global scope, so a project can use the public interface directly. For example, calling `describe` in specs instead of `jasmine.getEnv().describe`.
     */
    extend(window, jasmineInterface);

    /**
     * ## Runner Parameters
     *
     * More browser specific code - wrap the query string in an object and to allow for getting/setting parameters from the runner user interface.
     */

    var queryString = new jasmine.QueryString({
      getWindowLocation: function() { return window.location; }
    });

    var catchingExceptions = queryString.getParam("catch");
    env.catchExceptions(typeof catchingExceptions === "undefined" ? true : catchingExceptions);

    var throwingExpectationFailures = queryString.getParam("throwFailures");
    env.throwOnExpectationFailure(throwingExpectationFailures);

    /**
     * ## Reporters
     * The `HtmlReporter` builds all of the HTML UI for the runner page. This reporter paints the dots, stars, and x's for specs, as well as all spec names and all failures (if any).
     */
    var htmlReporter = new jasmine.HtmlReporter({
      env: env,
      onRaiseExceptionsClick: function() { queryString.navigateWithNewParam("catch", !env.catchingExceptions()); },
      onThrowExpectationsClick: function() { queryString.navigateWithNewParam("throwFailures", !env.throwingExpectationFailures()); },
      addToExistingQueryString: function(key, value) { return queryString.fullStringWithNewParam(key, value); },
      getContainer: function() { return document.getElementById("results") },
      createElement: function() { return document.createElement.apply(document, arguments); },
      createTextNode: function() { return document.createTextNode.apply(document, arguments); },
      timer: new jasmine.Timer()
    });

    /**
     * The `jsApiReporter` also receives spec results, and is used by any environment that needs to extract the results  from JavaScript.
     */
    env.addReporter(jasmineInterface.jsApiReporter);
    env.addReporter(htmlReporter);

    /**
     * Filter which specs will be run by matching the start of the full name against the `spec` query param.
     */
    var specFilter = new jasmine.HtmlSpecFilter({
      filterString: function() { return queryString.getParam("spec"); }
    });

    env.specFilter = function(spec) {
      return specFilter.matches(spec.getFullName());
    };

    /**
     * Setting up timing functions to be able to be overridden. Certain browsers (Safari, IE 8, phantomjs) require this hack.
     */
    window.setTimeout = window.setTimeout;
    window.setInterval = window.setInterval;
    window.clearTimeout = window.clearTimeout;
    window.clearInterval = window.clearInterval;

    /**
     * ## Execution
     *
     * Replace the browser window's `onload`, ensure it's called, and then run all of the loaded specs. This includes initializing the `HtmlReporter` instance and then executing the loaded Jasmine environment. All of this will happen after all of the specs are loaded.
     */
    // var currentWindowOnload = window.onload;

    // window.onload = function() {
      // if (currentWindowOnload) {
        // currentWindowOnload();
      // }
    // };

    /**
     * Helper function for readability above.
     */
    function extend(destination, source) {
      for (var property in source) destination[property] = source[property];
      return destination;
    }

    eval($scope.code);
    eval($scope.tests);
      htmlReporter.initialize();
      env.execute();
  });
});
