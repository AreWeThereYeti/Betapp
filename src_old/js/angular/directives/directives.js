var betApp = angular.module('betApp', [])
	.directive('ngApp', function() {
	    return {
	    controller:AppCtrl,
	    link:function(scope,element,attrs){
			scope.init();
			}
		}
	})