

/* User controller with angularjs */
function AppCtrl($scope, $http) {

	$scope.shortName = 'WebSqlDB';
	$scope.version = '1.0';
	$scope.displayName = 'WebSqlDB';
	$scope.maxSize = 65535;

	$scope.init = function(){	   
/* 		debugging function */

/* 	 	$scope.dropTables();  */

/* 		End of debugging functions */
		/* Initializing dbs */
		$scope.initializeDB();
		/* 		Checking user data */
		
		$scope.checkValidation();
		$scope.pushBetDBToObject();
	}

		/* 	Pressing the button in bet modal */
	$scope.SaveBet = function () {
		console.log("button is pressed");
		$scope.AddValuesToDB($scope.bets)
		$scope.checkIfBetIsSynced();	

    // Clear input fields after push
    $scope.bet 	= "";
    $scope.name = "";
	};

	/* --------------  Database ---------------- */	 	
	/* 		Initialize database */
	$scope.initializeDB = function(){	 
		// This alert is used to make sure the application is loaded correctly
		// you can comment this out once you have the application working
		console.log("DEBUGGING: we are in the InitializeDB function");
		
		if (!window.openDatabase) {
			// not all mobile devices support databases  if it does not, the following alert will display
			// indicating the device will not be albe to run this application
			alert('Databases are not supported in this browser.');
			return;
		}
	 
		// this line tries to open the database base locally on the device
		// if it does not exist, it will create it and return a database object stored in variable db
		if(!$scope.db){
			$scope.db = openDatabase($scope.shortName, $scope.version, $scope.displayName, $scope.maxSize);
		}	
		// this line will try to create the table User in the database justcreated/openned
			$scope.db.transaction(function(tx){
				 
				// this line actually creates the table User if it does not exist and sets up the three columns and their types
				// note the UserId column is an auto incrementing column which is useful if you want to pull back distinct rows
				// easily from the table.
				tx.executeSql( 'CREATE TABLE IF NOT EXISTS Auth(email varchar, password varchar)', []);
				tx.executeSql( 'CREATE TABLE IF NOT EXISTS Bet(Id INTEGER PRIMARY KEY AUTOINCREMENT, _bet_description varchar, _name varchar, _timestamp int, _comments varchar, _is_synced)', []);
				
				},
				function error(err){alert('error on init local db ' + err)}, function success(){console.log("database created")}
			) 
		}
		$scope.checkValidation = function(){
				// initial variables
			
			$scope.db.transaction(function (tx){
				tx.executeSql('SELECT * FROM Auth', [], function (tx, result){  // Fetch records from WebSQL
					var dataset = result.rows; 
					if (dataset.length == 0 ){
						$scope.loadAndShowRegistrationPage()
					}
					else if(!!dataset.length){
						$scope.email = dataset.item(0).email;
						$scope.password = dataset.item(0).password;
					}
				});
			});	
		}		
	
		// this is the function that puts values into the database from page #home
	$scope.AddValuesToDB = function(bet) {
		// this is the section that actually inserts the values into the User table
		$scope.db.transaction(function(transaction) {
			transaction.executeSql('INSERT INTO Bet(_bet_description, _name) VALUES ("'+bet.bet+'", "'+bet.name+'")');	
		},function error(err){alert('error on save to local db : ' + err.err)}, function success(){});
		return false;
	}
	
	$scope.pushBetDBToObject = function (){
		$scope.bets = [];
		console.log("bets er" + $scope.bets);
		$scope.db.transaction(function (tx){
			tx.executeSql('SELECT * FROM Bet', [], function (tx, result){	 
				var dataset = result.rows; 
				for (var i = 0, item = null; i < dataset.length; i++) {

					item = dataset.item(i);
					
					$scope.$apply(
						$scope.bets.push({
							bet: item['_bet_description'],
							name: item['_name']
						})
					);
				}
			});
		},function error(err){
			console.log(err)
		}, function success(){});
	}
	
		$scope.checkIfBetIsSynced = function (){
		$scope.betsToPush = [];
		console.log("Checker om bets er synced");
		$scope.db.transaction(function (tx){
			tx.executeSql('SELECT * FROM Bet', [], function (tx, result){	 
				var dataset = result.rows; 
				for (var i = 0, item = null; i < dataset.length; i++) {
					item = dataset.item(i);
					console.log("item[_is_synced] er : " + item['_is_synced'])
					if(item['_is_synced'] == null){
						$scope.$apply(
							$scope.betsToPush.push({
								bet: item['_bet_description'],
								name: item['_name']
							})
						);
						$scope.PushToServer($scope.betsToPush[$scope.betsToPush.length - 1], $http)

						console.log($scope.betsToPush);
					}	
				}
			});
		},function error(err){
			console.log(err)
		}, function success(){});

	}

	$scope.dropTables = function(){

		shortName = 'WebSqlDB';
		version = '1.0';
		displayName = 'WebSqlDB';
		maxSize = 65535;
	
		db = openDatabase(shortName, version, displayName, maxSize);

		db.transaction(function(tx){

			// IMPORTANT FOR DEBUGGING!!!!
			// you can uncomment these next twp lines if you want the table Trip and the table Auth to be empty each time the application runs
			tx.executeSql( 'DROP TABLE Bet');
			tx.executeSql( 'DROP TABLE Auth');
		})
	}
	
	$scope.setBetToSynced = function (){
		$scope.db.transaction(function(transaction) {
			transaction.executeSql('UPDATE Bet SET _is_synced = 1',[]); // Inserted between "set" and "_is_finished" for reference : _end_timestamp ="'+trip.end_timestamp+'", _end_location ="'+trip.end_location+'", _end_address ="'+trip.end_address+'", _end_comments ="'+trip.end_comments+'",
			},function error(err){console.log('Error setting _is_synced to 1 '); console.log(err)}, function success(){}
		);
		return false;
	}
		
	
			/* Add data to server, ANGULAR*/
	$scope.PushToServer = function(bet, $http){
		$scope.method = 'POST';
	  $scope.url = 'http://betappserver.herokuapp.com'; //Change to server address
		$http({
			method	: $scope.method, 
			url			: $scope.url + "/bets",
			data    : angular.toJson(bet),  
			})
			.success(function(data, status, headers, config) {
		    // this callback will be called asynchronously
		    // when the response is available
		    console.log("Success!!" + status)
		    if(status == 200){
			  	$scope.setBetToSynced();
		    }
		  })
		  .error(function(data, status, headers, config) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		    console.log("Error")
			console.log("Success!!" + status)
			
			/* Needs to check if something needs to be synced. Server needs to tell app when the bet is synced in order to ensure data.
			Check below for inspiration

				if(!!msg.responseText && !!msg.responseText.err_ids){				
					if(JSON.parse(msg.responseText).err_ids != 0){	
						$scope.dropRowsSynced(JSON.parse(msg.responseText).err_ids)
					}
				}

				else if(msg.status == 401){
					$scope.resetAccessToken()
				}	
				
				else if(msg.status == 404){
					console.log("404 error ")				
				}
			*/
		    
	  });
  }
/*   Registration */
  $scope.loadAndShowRegistrationPage = function(){
	  $('#validation_form').modal('show')
  }
  
  $scope.submitToken = function($event){
		// this is the section that actually inserts the values into the User table
		console.log('submitting access token')
		$event.preventDefault();
		$scope.$root.db.transaction(function(transaction) {
			transaction.executeSql('INSERT INTO AUTH (email, password) VALUES ("'+$scope.user.mail+'", "'+$scope.user.password+'")',[]);
			},function error(err){
				alert("Ups, noget gik galt. Prøv venligst igen")
				console.log(err)
			}, function success(){
			$('#validation_form').modal('hide');
			}
		);
		
		return false;
	}
	
};