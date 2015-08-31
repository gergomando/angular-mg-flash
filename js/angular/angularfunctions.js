var myApp = angular.module('chart-x', ['ngSanitize','ngAnimate','ui.bootstrap','flashMessage'], function($interpolateProvider) {
    $interpolateProvider.startSymbol('[%');
    $interpolateProvider.endSymbol('%]');
});