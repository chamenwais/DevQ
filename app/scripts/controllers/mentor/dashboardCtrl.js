﻿'use strict';

var devQ = angular.module('devQ');

devQ.controller('dashboardCtrl', ['$scope', '$state', 'authService', 'firebaseService', '$idle', function ($scope, $state, authService, firebaseService, $idle) {

    firebaseService.getMentor($scope.user.id).then(function (res) {
        $scope.mentor = res;
        if ($scope.mentor.title === undefined) {
            $state.go('cohort');
        }
        $scope.isMonitorMode = function () {
            if ($scope.mentor.status === 'Monitor') {
                return true;
            } else
                return false;
        };
    });

    $scope.questionStatusFilter = 'Red';

    $scope.statusClass = function (mentor) {
        if (mentor) {
            if (mentor.status === 'Available') {
                return 'status-light-green';
            } else if (mentor.status === 'Busy') {
                return 'status-light-yellow';
            } else {
                return 'status-light-red';
            }
        }
    };

    $scope.setOpacity = function (mentor) {
        if (mentor) {
            if (mentor.status === 'Away') {
                return 'opacity';
            }
        }
    };

    $scope.toggleStatus = function () {
        if ($scope.mentor.status === 'Available') {
            $scope.mentor.status = 'Away';
            $scope.mentor.$save();
        } else {
            $scope.mentor.status = 'Available';
            $scope.mentor.$save();
        }
    };
    
    var body = document.getElementById('body');

    $scope.toggleMonitorMode = function () {
        if ($scope.mentor.status !== 'Monitor') {
            $scope.mentor.status = 'Monitor';
            $scope.mentor.$save();
        } else {
            $scope.mentor.status = 'Available';
            $scope.mentor.$save();
        }
    };

    $scope.activateMonitorMode = function () {
        $scope.mentor.status = 'Monitor';
    };

    $scope.logOff = function () {
        $scope.mentor.status = 'Away';
        $scope.mentor.$save();
        authService.logOut().then(function () {
            $state.go('mentor');
        });
    };

    $scope.addCohort = function () {
        var cohort = {};
        cohort.status = true;
        cohort.name = $scope.cohortName;
        $scope.cohorts.$add(cohort);
        $scope.cohortName = '';
    };

    $scope.removeCohort = function (cohort) {
        cohort.status = false;
        $scope.cohorts.$save(cohort);
    };

    $scope.viewCohort = function (cohort) {
        $state.go('secure.mentor.queue', { queueId: cohort.$id, mentorId: $scope.mentor.$id });
    };

    $scope.viewCohortAssignments = function (cohort) {
        $state.go('secure.mentor.cohortAssignments', { cohortId: cohort.$id, mentorId: $scope.mentor.$id });
    };


    $scope.events = [];


    $scope.$on('$idleTimeout', function() {
        $scope.mentor.status = 'Away'
        $scope.mentor.$save();
    });




    var closeWindow = function() {
        $scope.mentor.status = 'Away';
        $scope.mentor.$save();
    }

    window.addEventListener("beforeunload", function(e) {
        return closeWindow();
    });







}]).config(function($idleProvider, $keepaliveProvider) {
    $idleProvider.idleDuration(108000);
    $idleProvider.warningDuration(5); 
    $keepaliveProvider.interval(2);
})
.run(function($idle){
    $idle.watch();
});


