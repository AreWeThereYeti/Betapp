angular.module('betapp.list', []).
    controller('BetListCtrl', function ($scope) {
        console.log('betlistcontroller');

    }).directive('betappList',function($rootScope){
        return {
            controller:'BetListCtrl',
            scope:true,
            link:function(scope,element,attrs){
                console.log('betlist directive');
            }
        }
    });



/* var betApp = angular.module('betApp', []); */
 
betApp.controller('BetListCtrl', function ($scope, $http) {
  

});
