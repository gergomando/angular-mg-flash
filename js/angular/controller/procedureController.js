myApp.controller('procedureController', ['$scope', '$rootScope', '$http', '$location','$modal','notify', function($scope, $rootScope, $http, $location,$modal, notify) {
	$scope.event = true;
    $scope.activeElementID = false;
    $scope.activeTab = {procedure: true};
    $scope.activeElement = {};
    $scope.proceduresWithCategories = {};
    $scope.patientID = window.location.pathname.split('/')[2];
    $scope.procedureSearch = '';
    $scope.formData = {};
    $scope.activeElement.caseID = '0';
    $scope.showCrownTab = false;
    $scope.surfaces = 
    {
       0:{name:'Mesial',code:'surface_mesial',type:'single' },
       1:{name:'Incisal / Occlusal',code: 'surface_occlusal',type: 'single'},
       2:{name:'Distal',code : 'surface_distal',type:'single'},
       3:{name:'Lingual',code: 'surface_lingual',type:'single'},
       4:{name:'Facial / Buccal',code: 'surface_buccal_facial',type:'single'},
       5:{name:'DO / DI',code: 'surface_dodi',type:'multiple'},
       6:{name:'MO / MI',code: 'surface_momi',type:'multiple'},
       7:{name:'MOD / MID',code:'surface_modmid',type:'multiple'}
    };

    $scope.surfaceBitPair = {
        1:'M',2:'O',3:'MO',4:'D',5:'MD',6:'DO',7:'MOD',8:'L',
        9:'ML',10:'OL',11:'MOL',12:'DL',13:'MDL',14:'DOL',15:'MODL',16:'B',
        17:'MB',18:'O',19:'MOB',20:'DB',21:'MDB',22:'DOB',23:'MODB',24:'LB',
        25:'MLB',26:'OLB',27:'MOLB',28:'DLB',29:'MDLB',30:'DOLB',31:'MODLB'
    };

    $http.get('/base/procedures-by-category')
        .success(function(data, status, headers, config) {
            $scope.proceduresWithCategories = data.results;
        });

    $scope.activateTab = function(tab) {
        $scope.activeTab = {}; //reset
        $scope.activeTab[tab] = true;
    }

	$scope.addNewProcedure = function() {
		$scope.event = false;
	}

	$scope.backToEvents = function() {
		$scope.event = true;
	}

    $rootScope.setAsActive = function(elementID) {
        if ('id' in $scope.activeElement){
            $rootScope.chartElements[ $scope.activeElement.id ]['active'] = false;
        }
        
        $rootScope.chartElements[elementID]['active'] = true;
        $scope.activeElement.id = parseInt(elementID);
        $scope.activateTab('procedure');

        $('.activeElement').empty();
        $(".tooth_" + elementID).clone(true).appendTo('.activeElement');

        for(i = 0; i < 8; i++) $scope.surfaces[i].selected = false;
        $rootScope.chartElements[$scope.activeElement.id].surfaceState = 0;

    }

    $scope.hasSelectedElements = function() {
        total = 0;
        angular.forEach($rootScope.chartElements, function(value,key) {
            if(value.selected) total++;
        });
        if(total > 0)
            return true;
        else 
            return false;
    }

    $scope.selectProcedure = function(procedureID,procedureDescription) {
    	$scope.activeElement.procedureID = procedureID;        
        $scope.activeElement.procedureDescription = procedureDescription;
        $scope.activateTab('surface');
        $scope.showCrownTab = procedureID == 26;   

        first = true;
        angular.forEach($rootScope.existingAppointments, function(value,key) {
            if(first) $scope.activeElement.appointmentID = key;
            first = false;
        });

        first = true; 
        angular.forEach($rootScope.cases, function(value,key) {
            if(first) $scope.activeElement.caseID = key;
            first = false;
        });   
    }

    $scope.selectCondition = function(conditionID) {
        condition = -1;
        if (conditionID == 1)
            condition = 'condition_1';

        if (conditionID == 4)
            condition = 'condition_2';

        if (conditionID == 2)
            condition = 'condition_3';

        if (condition == -1)
            return;

        var confirmAddCondition = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'confirmAddCondition',
            controller: 'ModalInstanceCtrl',
            size: 'md',
        });

        confirmAddCondition.result.then(function () {
            $rootScope.chartElements[$scope.activeElement.id][condition] = !$rootScope.chartElements[$scope.activeElement.id][condition];
            
            $rootScope.getEventLoading = true;
            
            $http.post('/patient/' + $scope.patientID + '/newcondition', {
                        id: $scope.activeElement.id,
                        condition_id: conditionID,
                        _method: 'post'
            }).success(function() {
                $rootScope.getPatientChartEvents();
                notify('New condition added!');
            });
        });
    }

    $scope.selectSurface = function(surfaceID,activeElementID) {
        var surfaceBit = [1,2,4,8,16];

        if (surfaceID in surfaceBit){
            
            if ($scope.surfaces[5].selected || $scope.surfaces[6].selected || $scope.surfaces[7].selected)
                $rootScope.chartElements[activeElementID].surfaceState = 0;
            
            for (i = 5; i < 8; i++) $scope.surfaces[i].selected = false;

            $rootScope.chartElements[activeElementID].surfaceState = $rootScope.chartElements[activeElementID].surfaceState ^ surfaceBit[surfaceID];
            
            $('.activeElement .tooth_surface').hide();            
            $('.activeElement .surface_' + $scope.surfaceBitPair[$rootScope.chartElements[activeElementID].surfaceState]).show();
        }
        else {
            if ($scope.surfaces[surfaceID].selected == true) {
                for (i = 0; i < 8; i++) $scope.surfaces[i].selected = false;
                
                $scope.surfaces[surfaceID].selected = true;
                
                if (surfaceID == 5) $rootScope.chartElements[activeElementID].surfaceState = 6;
                if (surfaceID == 6) $rootScope.chartElements[activeElementID].surfaceState = 3; 
                if (surfaceID == 7) $rootScope.chartElements[activeElementID].surfaceState = 7;
                
                $('.activeElement .tooth_surface').hide();            
                $('.activeElement .surface_' + $scope.surfaceBitPair[$rootScope.chartElements[activeElementID].surfaceState]).show();

            }
            else 
                $rootScope.chartElements[activeElementID].surfaceState = 0;
        }
        
        if (!$scope.showCrownTab)
            $scope.readyToCase = true;
    }

    $scope.surfaceNext = function() {
        if ($scope.showCrownTab)
            $scope.activateTab('additional');
        else
            $scope.readyToCase = true;
    }

    $scope.additionalNext = function() {
        $scope.activateTab('addTo');
    }

	$rootScope.$on('notificationNewElement', function (event, value) {
        $scope.selectFirstElementIfNeed();
  	})

	$scope.addToCase = function() {
        $scope.selectedSurfaces = [];
        
        angular.forEach($scope.surfaces, function(value,key) {
            if (value.selected) {
                if (value.type == 'single')
                    $scope.selectedSurfaces.push(value.code);
                else
                    $scope.selectedSurfaces = value.code;

                $scope.selectedSurfacesType = value.type;
            } 
        });

		$http.post('/patient/' + $scope.patientID + '/newprocedure', {
		 			event:  $scope.activeElement,
                    selectedSurfaces: $scope.selectedSurfaces,
                    selectedSurfacesType: $scope.selectedSurfacesType,
		 			_method: 'post',

		});
        


        $rootScope.chartElements[ $scope.activeElement.id ].selected = false;
        $('.tooth_' + $scope.activeElement.id + ' ' + '.tooth-selected').toggle();

        $scope.activeElement = {};
        $scope.selectFirstElementIfNeed();

        $rootScope.getPatientChartEvents();

        $scope.readyToCase = false;
        notify('New procedure added!');

	}

    $scope.selectFirstElementIfNeed = function() {
        if (( 'id' in $scope.activeElement ))
            return;
        
        firstElement = parseInt(Object.keys($rootScope.chartElements)[0]);
        $rootScope.setAsActive(firstElement);
    }


}]);
