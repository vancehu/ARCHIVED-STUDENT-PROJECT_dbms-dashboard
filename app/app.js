var app = angular.module('myApp', ['ui.bootstrap', 'ngRoute'], function($httpProvider) {
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    var param = function(obj) {
        var query = '',
            name, value, fullSubName, subName, subValue, innerObj, i;

        for (name in obj) {
            value = obj[name];

            if (value instanceof Array) {
                for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            } else if (value instanceof Object) {
                for (subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            } else if (value !== undefined && value !== null)
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }

        return query.length ? query.substr(0, query.length - 1) : query;
    };

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [

        function(data) {
            return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
        }
    ];
});

//Routing
app.config(function($routeProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: 'pages/home.html',
        })
        .when('/admin/:path', {
            templateUrl: 'pages/admin.html'
        })
        .when('/readonly/:path', {
            templateUrl: 'pages/readonly.html'
        })
        .when('/server/:path', {
            templateUrl: 'pages/readonly.html',
        })
        .otherwise({
            redirectTo: '/home'
        });
});
app.controller('LoginController', function($scope, $window, $http, $rootScope) {
    $scope.cid = "00000001";
    $scope.eid = "00000022";
    $scope.loginAdmin = function() {
        $http.post('server/account/admin.php', {
            'pwd': 'test'
        }).success(function(data) {
            if (angular.isDefined(data.status)) {
                $rootScope.addAlert(data.status);
                if (data.status.type === 'success') {
                    $window.location.href = "#/home";
                }
                $http.get('server/account/curr.php').success(function(data) {
                    $rootScope.currUser = data;
                });
            }

        });
    }
    $scope.loginEmployee = function() {
        $http.post('server/account/employee.php', {
            'eid': String($scope.eid),
            'pwd': String($scope.ePassword)
        }).success(function(data) {
            if (angular.isDefined(data.status)) {
                $rootScope.addAlert(data.status);
                if (data.status.type === 'success') {
                    $window.location.href = "#/home";
                }
                $http.get('server/account/curr.php').success(function(data) {
                    $rootScope.currUser = data;
                });
            }

        });
    }
    $scope.loginCustomer = function() {
        $http.post('server/account/customer.php', {
            'cid': String($scope.cid),
            'pwd': String($scope.cPassword)
        }).success(function(data) {
            if (angular.isDefined(data.status)) {
                $rootScope.addAlert(data.status);
                if (data.status.type === 'success') {
                    $window.location.href = "#/home";
                }
                $http.get('server/account/curr.php').success(function(data) {
                    $rootScope.currUser = data;
                });
            }

        });
    }
});


//navbar highlighting
app.controller('NavbarController', ['$http', '$scope', '$window', '$location', '$rootScope',
    function($http, $scope, $window, $location, $rootScope) {
        $scope.$on('$locationChangeStart', function(event) {
            //get login info
            $http.get('server/account/curr.php').success(function(data) {
                $rootScope.currUser = data;
            });
        });

        //return if logged in
        $rootScope.isLoggedIn = function() {
            if (angular.isDefined($rootScope.currUser)) {
                return angular.isDefined($rootScope.currUser.type);
            } else {
                return false;
            }
        };

        $rootScope.logOut = function() {
            $rootScope.currUser = [];
            $http.get('server/account/logout.php').success(function(data) {
                $window.location.href = "#/home";
                $window.location.reload();
            });
        };

    }
]);

app.controller('AlertCtrl', function($rootScope, $timeout) {
    $rootScope.alerts = [];

    $rootScope.addAlert = function(arg) {
        if ($rootScope.alerts.length > 0 && $rootScope.alerts[$rootScope.alerts.length - 1].msg === arg.msg) {} else {
            $rootScope.alerts.push(arg);
        }
        $timeout(function() {
            $rootScope.alerts.splice($rootScope.alerts.indexOf($rootScope.alerts), 1);
        }, 3000);
    };

    $rootScope.closeAlert = function(index) {
        $rootScope.alerts.splice(index, 1);
    };
});


//modal
app.controller('ModalController', function($scope, $modalInstance, arg) {
    $scope.valuePassed = arg;
    $scope.confirmDelete = function() {
        $modalInstance.close("delete");
    };
    $scope.cancelDelete = function() {
        $modalInstance.close("cancel");
    };
    $scope.okay = function() {
        $modalInstance.close("okay");
    };
});

app.controller('PageController', function($scope, $http, $modal, $routeParams, $filter) {

    //keyword validator
    $scope.isKeywordValid = function(arg) {
        return angular.isDefined(arg) && (arg !== "");
    };

    //Currency validator
    $scope.isCurrencyValid = function(arg) {
        return angular.isDefined(arg) && (/^\d+(\.\d{1,2})?$/).test(arg);
    };

    //Time validator
    $scope.isTimeValid = function(arg) {
        return angular.isDefined(arg) && !(isNaN(arg.getTime()));
    };
    //Positive integer validator
    $scope.isPosIntValid = function(arg) {
        return angular.isDefined(arg) && (/^\d+$/).test(arg);
    };

    $scope.path = $routeParams['path'];

    var ctrl = this;
    $http.get('schema/' + $scope.path + '.json').success(function(data) {
        $scope.cols = data.cols;
        $scope.pageinfo = data.pageinfo;
        ctrl.resetSearch();
        ctrl.applySearch();
    });

    this.resetSearch = function() {
        for (var i in $scope.cols) {
            col = $scope.cols[i];
            col.tag = undefined;
            col.search = [];
            col.search.option = col.defaultSortOrder;

            if (angular.isDefined($routeParams[col.name])) {
                col.search.input = $routeParams[col.name];
            }

            if (col.dataType === 'datapair') {

                // console.log("http://localhost/infsci2710/" + col.pair.source);
                $http.get(col.pair.source).success((function(col) {
                    return function(data) {
                        col.records = data.records;
                    }
                })(col));
            }
        }

        $scope.sortBy = $scope.pageinfo.key;
        $scope.sortOrder = '1';
        $scope.page = '1';
    };

    this.applySearch = function() {
        $scope.loadwaiting = true;
        var query = "";
        for (var i = 0; i < $scope.cols.length; i++) {
            col = $scope.cols[i];
            console.log($scope.sortBy);
            if (col.searchable === '1') {
                switch (col.dataType) {
                    //is
                    case "is":

                        if (!$scope.isKeywordValid(col.search.input)) {
                            col.tag = undefined;
                        } else {
                            if (col.search.option === '0') {
                                col.tag = col.tagTokens[0].token1 + col.search.input + col.tagTokens[0].token2;
                                query += col.name + "=" + col.search.input + "&";
                            } else {
                                col.tag = col.tagTokens[1].token1 + col.search.input + col.tagTokens[1].token2;
                                query += col.name + "_not=" + col.search.input + "&";
                            }
                        }
                        break;
                        //like
                    case "like":
                        if (!$scope.isKeywordValid(col.search.input)) {
                            col.tag = undefined;
                        } else {
                            if (col.search.option === '0') {
                                col.tag = col.tagTokens[0].token1 + col.search.input + col.tagTokens[0].token2;
                                query += col.name + "_like=" + col.search.input + "&";
                            } else {
                                col.tag = col.tagTokens[1].token1 + col.search.input + col.tagTokens[1].token2;
                                query += col.name + "_unlike=" + col.search.input + "&";
                            }
                        }
                        break;
                        //datapair
                    case "datapair":
                        if (!$scope.isKeywordValid(col.search.input)) {
                            col.tag = undefined;
                        } else {
                            if (col.search.option === '0') {
                                col.tag = col.tagTokens[0].token1 + col.search.input + col.tagTokens[0].token2;
                                query += col.name + "=" + col.search.input + "&";
                            } else {
                                col.tag = col.tagTokens[1].token1 + col.search.input + col.tagTokens[1].token2;
                                query += col.name + "_not=" + col.search.input + "&";
                            }
                        }
                        break;
                        //Currency
                    case "currency":
                        if (!$scope.isCurrencyValid(col.search.input1)) {
                            col.tag = undefined;
                        } else {
                            if (col.search.option === '0') {
                                col.tag = col.tagTokens[0].token1 + col.search.input1 + col.tagTokens[0].token2;
                                query += col.name + "=" + col.search.input1 + "&";
                            } else if (col.search.option === '1') {
                                if (!$scope.isCurrencyValid(col.search.input2)) {
                                    col.tag = col.tagTokens[1].token1 + col.search.input1 + col.tagTokens[1].token2;
                                    query += col.name + "_low=" + col.search.input1 + "&";
                                } else if (col.search.input2 > col.search.input1) {
                                    col.tag = col.tagTokens[3].token1 + col.search.input1 + col.tagTokens[3].token2 + col.search.input2 + col.tagTokens[3].token3;
                                    query += col.name + "_low=" + col.search.input1 + "&" + col.name + "_high=" + col.search.input2 + "&";
                                }
                            } else {
                                if (!$scope.isCurrencyValid(col.search.input2)) {
                                    col.tag = col.tagTokens[2].token1 + col.search.input1 + col.tagTokens[2].token2;
                                    query += col.name + "_high=" + col.search.input1 + "&";
                                } else if (col.search.input2 < col.search.input1) {
                                    col.tag = col.tagTokens[3].token1 + col.search.input2 + col.tagTokens[3].token2 + col.search.input1 + col.tagTokens[3].token3;
                                    query += col.name + "_low=" + col.search.input2 + "&" + col.name + "_high=" + col.search.input1 + "&";
                                }
                            }
                        }
                        break;
                        //positive
                    case "positive":
                        if (!$scope.isPosIntValid(col.search.input1)) {
                            col.tag = undefined;
                        } else {
                            if (col.search.option === '0') {
                                col.tag = col.tagTokens[0].token1 + col.search.input1 + col.tagTokens[0].token2;
                                query += col.name + "=" + col.search.input1 + "&";
                            } else if (col.search.option === '1') {
                                if (!$scope.isPosIntValid(col.search.input2)) {
                                    col.tag = col.tagTokens[1].token1 + col.search.input1 + col.tagTokens[1].token2;
                                    query += col.name + "_low=" + col.search.input1 + "&";
                                } else if (col.search.input2 > col.search.input1) {
                                    col.tag = col.tagTokens[3].token1 + col.search.input1 + col.tagTokens[3].token2 + col.search.input2 + col.tagTokens[3].token3;
                                    query += col.name + "_low=" + col.search.input1 + "&" + col.name + "_high=" + col.search.input2 + "&";
                                }
                            } else {
                                if (!$scope.isPosIntValid(col.search.input2)) {
                                    col.tag = col.tagTokens[2].token1 + col.search.input1 + col.tagTokens[2].token2;
                                    query += col.name + "_high=" + col.search.input1 + "&";
                                } else if (col.search.input2 < col.search.input1) {
                                    col.tag = col.tagTokens[3].token1 + col.search.input2 + col.tagTokens[3].token2 + col.search.input1 + col.tagTokens[3].token3;
                                    query += col.name + "_low=" + col.search.input2 + "&" + col.name + "_high=" + col.search.input1 + "&";
                                }
                            }
                        }
                        break;
                    case "date":
                        if (!$scope.isTimeValid(col.search.input1)) {
                            col.tag = undefined;
                        } else {
                            if (col.search.option === "0") {
                                col.tag = "On " + (col.search.input1.getMonth() + 1) + '/' + col.search.input1.getDate() + '/' + col.search.input1.getFullYear();
                                query += col.name + "=" + col.search.input1.getFullYear() + '-' + (col.search.input1.getMonth() + 1) + '-' + col.search.input1.getDate() + "&";
                            } else if (col.search.option === "1") {
                                if (!$scope.isTimeValid(col.search.input2)) {
                                    col.tag = "Not earlier than " + (col.search.input1.getMonth() + 1) + '/' + col.search.input1.getDate() + '/' + col.search.input1.getFullYear();
                                    query += col.name + "_begins=" + col.search.input1.getFullYear() + '-' + (col.search.input1.getMonth() + 1) + '-' + col.search.input1.getDate() + "&";
                                } else if (col.search.input2 > col.search.input1) {
                                    col.tag = "Between " + (col.search.input1.getMonth() + 1) + '/' + col.search.input1.getDate() + '/' + col.search.input1.getFullYear() + " and " + (col.search.input2.getMonth() + 1) + '/' + col.search.input2.getDate() + '/' + col.search.input2.getFullYear();
                                    query += col.name + "_begins=" + col.search.input1.getFullYear() + '-' + (col.search.input1.getMonth() + 1) + '-' + col.search.input1.getDate() + "&" + col.name + "_ends=" + $col.search.input2.getFullYear() + '-' + (col.search.input2.getMonth() + 1) + '-' + col.search.input2.getDate() + "&";
                                }
                            } else {
                                if (!$scope.isTimeValid(col.search.input2)) {
                                    col.tag = "Not later than " + (col.search.input1.getMonth() + 1) + '/' + col.search.input1.getDate() + '/' + col.search.input1.getFullYear();
                                    query += col.name + "_ends=" + col.search.input1.getFullYear() + '-' + (col.search.input1.getMonth() + 1) + '-' + col.search.input1.getDate() + "&";
                                } else if (col.search.input2 < col.search.input1) {
                                    col.tag = "Between " + (col.search.input2.getMonth() + 1) + '/' + col.search.input2.getDate() + '/' + col.search.input2.getFullYear() + " and " + (col.search.input1.getMonth() + 1) + '/' + col.search.input1.getDate() + '/' + col.search.input1.getFullYear();
                                    query += col.name + "_begins=" + col.search.input2.getFullYear() + '-' + (col.search.input2.getMonth() + 1) + '-' + col.search.input2.getDate() + "&" + col.name + "_ends=" + col.search.input1.getFullYear() + '-' + (col.search.input1.getMonth() + 1) + '-' + col.search.input1.getDate() + "&";
                                }
                            }
                        }
                        break;
                    case "bool":
                        if (angular.isUndefined(col.search.option)) {
                            col.tag = undefined;
                        } else if (col.search.option === '0') {
                            col.tag = col.tagTokens[0].token;
                            query += col.name + "=0&";
                        } else {
                            col.tag = col.tagTokens[1].token;
                            query += col.name + "=1&";
                        }
                        break;
                }
                if (String(i) === $scope.sortBy) {
                    $scope.sortTag = "Sorted by " + col.label + ": " + col.orderTokens[$scope.sortOrder].token;
                    query += "sort=" + col.name + "&order=" + $scope.sortOrder + "&";
                }
            }
        }
        // console.log("http://localhost/infsci2710/" + 'server/' + $scope.path + '/get.php?' + query + "page=" + $scope.page);
        $http.get('server/' + $scope.path + '/get.php?' + query + "page=" + $scope.page).success(function(data) {
            if (angular.isDefined(data.error)) {
                var modalInstance = $modal.open({
                    templateUrl: 'pages/errorHandler.html',
                    controller: 'ModalController',
                    backdrop: 'static',
                    resolve: {
                        arg: function() {
                            return "#/server/log";
                        }
                    }
                });
            }
            $scope.records = data.records;
            for (var i in $scope.records) {
                row = $scope.records[i];
                row.editMode = false;
            }
            $scope.count = data.count;
            $scope.page = data.page;
            $scope.loadwaiting = false;
        });

        this.collapseSearchBox();
    };

    //expand
    this.expandSearchBox = function() {
        $scope.expand = true;
    };

    this.collapseSearchBox = function() {
        $scope.expand = false;
    };

    this.resetButton = function() {
        this.resetSearch();
        this.applySearch();
    };
    this.isRecordInvalid = function(record) {
        for (var i = 0; i < $scope.cols.length; i++) {

            if ($scope.cols[i].editable === "1") {
                switch ($scope.cols[i].dataType) {
                    case "is":
                    case "like":
                        if ($scope.isKeywordValid(record[$scope.cols[i].name]) === false) {
                            return true;
                        }
                        break;
                    case "currency":
                        if ($scope.isCurrencyValid(record[$scope.cols[i].name]) === false) {
                            return true;
                        }
                        break;
                    case "positive":
                        if ($scope.isPosIntValid(record[$scope.cols[i].name]) === false) {
                            return true;
                        }
                        break;
                }
            }
        }
        return false;
    };

    this.showProperValue = function(record, col) {
        switch (col.dataType) {
            case "datapair":
                return record[col.pair.show];
                break;
            case "bool":
                return col.bool[record[col.name]].label;
                break;
            case "currency":
                return $filter('currency')(record[col.name]);
            default:
                return record[col.name];
        }
    };

    //start edit
    this.startEdit = function(record) {
        for (var i in $scope.records) {
            row = $scope.records[i];
            row.editMode = false;
        }
        $scope.addMode = false;
        record.old = [];
        col = [];
        for (var i in $scope.cols) {
            col = $scope.cols[i];
            record.old[col.name] = record[col.name];
        }
        console.log("1");
        record.editMode = true;
    };

    //save edit
    this.saveEdit = function(record) {
        if (!this.isRecordInvalid(record)) {
            var ctrl = this;
            $scope.writewaiting = true;
            $http.post("server/" + $scope.path + "/edit.php", record).success(function(data) {
                if (angular.isDefined(data.error)) {
                    var modalInstance = $modal.open({
                        templateUrl: 'pages/errorHandler.html',
                        controller: 'ModalController',
                        backdrop: 'static',
                        resolve: {
                            arg: function() {
                                return "#/server/log";
                            }
                        }
                    });
                }
                $scope.writewaiting = false;
                record.editMode = false;
                ctrl.applySearch();
            });
        }
    };

    //cancel edit
    this.cancelEdit = function(record) {
        for (var i in $scope.cols) {
            col = $scope.cols[i];
            record[col.name] = record.old[col.name];
        }
        record.editMode = false;
    };

    //delete record
    this.deleteRecord = function(record) {
        var ctrl = this;
        $scope.writewaiting = true;

        //call confirm delete modal
        var modalInstance = $modal.open({
            templateUrl: 'pages/confirmDelete.html',
            controller: 'ModalController',
            backdrop: 'static',
            resolve: {
                arg: function() {
                    return record[$scope.cols[$scope.pageinfo.key].name];
                }
            }
        });
        modalInstance.result.then(function(result) {
            if (result === "delete") {
                $http.post("server/" + $scope.path + "/delete.php", record).success(function(data) {
                    if (angular.isDefined(data.error)) {
                        if (data.error === '2') {
                            var modalInstance = $modal.open({
                                templateUrl: 'pages/fkHandler.html',
                                controller: 'ModalController',
                                backdrop: 'static',
                                resolve: {
                                    arg: function() {
                                        return record[$scope.cols[$scope.pageinfo.key]];
                                    }
                                }
                            });
                        } else {
                            var modalInstance = $modal.open({
                                templateUrl: 'pages/errorHandler.html',
                                controller: 'ModalController',
                                backdrop: 'static',
                                resolve: {
                                    arg: function() {
                                        return "#/server/log";
                                    }
                                }
                            });
                        }
                    }
                    $scope.writewaiting = false;
                    ctrl.applySearch();
                });
            } else {
                $scope.writewaiting = false;
            }
        });
    };

    //start adding new record
    this.startAdd = function() {
        for (var i in $scope.records) {
            row = $scope.records[i];
            row.editMode = false;
        }
        $scope.newRecord = [];
        $scope.addMode = true;
    };


    //save the new record
    this.saveAdd = function() {
        if (!this.isRecordInvalid($scope.newRecord)) {
            var ctrl = this;
            $scope.writewaiting = true;
            $http.post("server/" + $scope.path + "/add.php", $scope.newRecord).success(function(data) {
                if (angular.isDefined(data.error)) {
                    if (data.error === '2') {
                        var modalInstance = $modal.open({
                            templateUrl: 'pages/addHandler.html',
                            controller: 'ModalController',
                            backdrop: 'static',
                            resolve: {
                                arg: function() {
                                    return data.quant;
                                }
                            }
                        });
                    } else {
                        var modalInstance = $modal.open({
                            templateUrl: 'pages/errorHandler.html',
                            controller: 'ModalController',
                            backdrop: 'static',
                            resolve: {
                                arg: function() {
                                    return "#/server/log";
                                }
                            }
                        });
                    }
                }
                $scope.writewaiting = false;
                $scope.addMode = false;
                ctrl.applySearch();
            });
        }
    };

    //cancel adding the new record
    this.cancelAdd = function(record) {
        $scope.addMode = false;
    };
});
app.controller('CustomerController', function($scope, $http, $modal, $routeParams, $filter) {

    //keyword validator
    $scope.isKeywordValid = function(arg) {
        return angular.isDefined(arg) && (arg !== "");
    };

    //Currency validator
    $scope.isCurrencyValid = function(arg) {
        return angular.isDefined(arg) && (/^\d+(\.\d{1,2})?$/).test(arg);
    };

    //Time validator
    $scope.isTimeValid = function(arg) {
        return angular.isDefined(arg) && !(isNaN(arg.getTime()));
    };
    //Positive integer validator
    $scope.isPosIntValid = function(arg) {
        return angular.isDefined(arg) && (/^\d+$/).test(arg);
    };

    $scope.path = $routeParams['path'];

    var ctrl = this;
    $http.get('schema/readonly/' + $scope.path + '.json').success(function(data) {
        $scope.cols = data.cols;
        $scope.pageinfo = data.pageinfo;
        ctrl.resetSearch();
        ctrl.applySearch();
    });

    this.resetSearch = function() {
        for (var i in $scope.cols) {
            col = $scope.cols[i];
            col.tag = undefined;
            col.search = [];
            col.search.option = col.defaultSortOrder;

            if (angular.isDefined($routeParams[col.name])) {
                col.search.input = $routeParams[col.name];
            }

            if (col.dataType === 'datapair') {

                // console.log("http://localhost/infsci2710/" + col.pair.source);
                $http.get(col.pair.source).success((function(col) {
                    return function(data) {
                        col.records = data.records;
                    }
                })(col));
            }
        }

        $scope.sortBy = $scope.pageinfo.key;
        $scope.sortOrder = '1';
        $scope.page = '1';
    };

    this.applySearch = function() {
        $scope.loadwaiting = true;
        var query = "";
        for (var i = 0; i < $scope.cols.length; i++) {
            col = $scope.cols[i];        
            if (col.searchable === '1') {
                switch (col.dataType) {
                    //is
                    case "is":
                        if (!$scope.isKeywordValid(col.search.input)) {
                            col.tag = undefined;
                        } else {
                            if (col.search.option === '0') {
                                col.tag = col.tagTokens[0].token1 + col.search.input + col.tagTokens[0].token2;
                                query += col.name + "=" + col.search.input + "&";
                            } else {
                                col.tag = col.tagTokens[1].token1 + col.search.input + col.tagTokens[1].token2;
                                query += col.name + "_not=" + col.search.input + "&";
                            }
                        }
                        break;
                        //like
                    case "like":
                        if (!$scope.isKeywordValid(col.search.input)) {
                            col.tag = undefined;
                        } else {
                            if (col.search.option === '0') {
                                col.tag = col.tagTokens[0].token1 + col.search.input + col.tagTokens[0].token2;
                                query += col.name + "_like=" + col.search.input + "&";
                            } else {
                                col.tag = col.tagTokens[1].token1 + col.search.input + col.tagTokens[1].token2;
                                query += col.name + "_unlike=" + col.search.input + "&";
                            }
                        }
                        break;
                        //datapair
                    case "datapair":
                        if (!$scope.isKeywordValid(col.search.input)) {
                            col.tag = undefined;
                        } else {
                            if (col.search.option === '0') {
                                col.tag = col.tagTokens[0].token1 + col.search.input + col.tagTokens[0].token2;
                                query += col.name + "=" + col.search.input + "&";
                            } else {
                                col.tag = col.tagTokens[1].token1 + col.search.input + col.tagTokens[1].token2;
                                query += col.name + "_not=" + col.search.input + "&";
                            }
                        }
                        break;
                        //Currency
                    case "currency":
                        if (!$scope.isCurrencyValid(col.search.input1)) {
                            col.tag = undefined;
                        } else {
                            if (col.search.option === '0') {
                                col.tag = col.tagTokens[0].token1 + col.search.input1 + col.tagTokens[0].token2;
                                query += col.name + "=" + col.search.input1 + "&";
                            } else if (col.search.option === '1') {
                                if (!$scope.isCurrencyValid(col.search.input2)) {
                                    col.tag = col.tagTokens[1].token1 + col.search.input1 + col.tagTokens[1].token2;
                                    query += col.name + "_low=" + col.search.input1 + "&";
                                } else if (col.search.input2 > col.search.input1) {
                                    col.tag = col.tagTokens[3].token1 + col.search.input1 + col.tagTokens[3].token2 + col.search.input2 + col.tagTokens[3].token3;
                                    query += col.name + "_low=" + col.search.input1 + "&" + col.name + "_high=" + col.search.input2 + "&";
                                }
                            } else {
                                if (!$scope.isCurrencyValid(col.search.input2)) {
                                    col.tag = col.tagTokens[2].token1 + col.search.input1 + col.tagTokens[2].token2;
                                    query += col.name + "_high=" + col.search.input1 + "&";
                                } else if (col.search.input2 < col.search.input1) {
                                    col.tag = col.tagTokens[3].token1 + col.search.input2 + col.tagTokens[3].token2 + col.search.input1 + col.tagTokens[3].token3;
                                    query += col.name + "_low=" + col.search.input2 + "&" + col.name + "_high=" + col.search.input1 + "&";
                                }
                            }
                        }
                        break;
                        //positive
                    case "positive":
                        if (!$scope.isPosIntValid(col.search.input1)) {
                            col.tag = undefined;
                        } else {
                            if (col.search.option === '0') {
                                col.tag = col.tagTokens[0].token1 + col.search.input1 + col.tagTokens[0].token2;
                                query += col.name + "=" + col.search.input1 + "&";
                            } else if (col.search.option === '1') {
                                if (!$scope.isPosIntValid(col.search.input2)) {
                                    col.tag = col.tagTokens[1].token1 + col.search.input1 + col.tagTokens[1].token2;
                                    query += col.name + "_low=" + col.search.input1 + "&";
                                } else if (col.search.input2 > col.search.input1) {
                                    col.tag = col.tagTokens[3].token1 + col.search.input1 + col.tagTokens[3].token2 + col.search.input2 + col.tagTokens[3].token3;
                                    query += col.name + "_low=" + col.search.input1 + "&" + col.name + "_high=" + col.search.input2 + "&";
                                }
                            } else {
                                if (!$scope.isPosIntValid(col.search.input2)) {
                                    col.tag = col.tagTokens[2].token1 + col.search.input1 + col.tagTokens[2].token2;
                                    query += col.name + "_high=" + col.search.input1 + "&";
                                } else if (col.search.input2 < col.search.input1) {
                                    col.tag = col.tagTokens[3].token1 + col.search.input2 + col.tagTokens[3].token2 + col.search.input1 + col.tagTokens[3].token3;
                                    query += col.name + "_low=" + col.search.input2 + "&" + col.name + "_high=" + col.search.input1 + "&";
                                }
                            }
                        }
                        break;
                    case "date":
                        if (!$scope.isTimeValid(col.search.input1)) {
                            col.tag = undefined;
                        } else {
                            if (col.search.option === "0") {
                                col.tag = "On " + (col.search.input1.getMonth() + 1) + '/' + col.search.input1.getDate() + '/' + col.search.input1.getFullYear();
                                query += col.name + "=" + col.search.input1.getFullYear() + '-' + (col.search.input1.getMonth() + 1) + '-' + col.search.input1.getDate() + "&";
                            } else if (col.search.option === "1") {
                                if (!$scope.isTimeValid(col.search.input2)) {
                                    col.tag = "Not earlier than " + (col.search.input1.getMonth() + 1) + '/' + col.search.input1.getDate() + '/' + col.search.input1.getFullYear();
                                    query += col.name + "_begins=" + col.search.input1.getFullYear() + '-' + (col.search.input1.getMonth() + 1) + '-' + col.search.input1.getDate() + "&";
                                } else if (col.search.input2 > col.search.input1) {
                                    col.tag = "Between " + (col.search.input1.getMonth() + 1) + '/' + col.search.input1.getDate() + '/' + col.search.input1.getFullYear() + " and " + (col.search.input2.getMonth() + 1) + '/' + col.search.input2.getDate() + '/' + col.search.input2.getFullYear();
                                    query += col.name + "_begins=" + col.search.input1.getFullYear() + '-' + (col.search.input1.getMonth() + 1) + '-' + col.search.input1.getDate() + "&" + col.name + "_ends=" + $col.search.input2.getFullYear() + '-' + (col.search.input2.getMonth() + 1) + '-' + col.search.input2.getDate() + "&";
                                }
                            } else {
                                if (!$scope.isTimeValid(col.search.input2)) {
                                    col.tag = "Not later than " + (col.search.input1.getMonth() + 1) + '/' + col.search.input1.getDate() + '/' + col.search.input1.getFullYear();
                                    query += col.name + "_ends=" + col.search.input1.getFullYear() + '-' + (col.search.input1.getMonth() + 1) + '-' + col.search.input1.getDate() + "&";
                                } else if (col.search.input2 < col.search.input1) {
                                    col.tag = "Between " + (col.search.input2.getMonth() + 1) + '/' + col.search.input2.getDate() + '/' + col.search.input2.getFullYear() + " and " + (col.search.input1.getMonth() + 1) + '/' + col.search.input1.getDate() + '/' + col.search.input1.getFullYear();
                                    query += col.name + "_begins=" + col.search.input2.getFullYear() + '-' + (col.search.input2.getMonth() + 1) + '-' + col.search.input2.getDate() + "&" + col.name + "_ends=" + col.search.input1.getFullYear() + '-' + (col.search.input1.getMonth() + 1) + '-' + col.search.input1.getDate() + "&";
                                }
                            }
                        }
                        break;
                    case "bool":
                        if (angular.isUndefined(col.search.option)) {
                            col.tag = undefined;
                        } else if (col.search.option === '0') {
                            col.tag = col.tagTokens[0].token;
                            query += col.name + "=0&";
                        } else {
                            col.tag = col.tagTokens[1].token;
                            query += col.name + "=1&";
                        }
                        break;
                }
                if (String(i) === $scope.sortBy) {
                    $scope.sortTag = "Sorted by " + col.label + ": " + col.orderTokens[$scope.sortOrder].token;
                    query += "sort=" + col.name + "&order=" + $scope.sortOrder + "&";
                }
            }
        }
        // console.log("http://localhost/infsci2710/" + 'server/' + $scope.path + '/get.php?' + query + "page=" + $scope.page);
        $http.get('server/' + $scope.path + '/get.php?' + query + "page=" + $scope.page).success(function(data) {
            if (angular.isDefined(data.error)) {
                var modalInstance = $modal.open({
                    templateUrl: 'pages/errorHandler.html',
                    controller: 'ModalController',
                    backdrop: 'static',
                    resolve: {
                        arg: function() {
                            return "#/server/log";
                        }
                    }
                });
            }
            $scope.records = data.records;
            for (var i in $scope.records) {
                row = $scope.records[i];
                row.editMode = false;
            }
            $scope.count = data.count;
            $scope.page = data.page;
            $scope.loadwaiting = false;
        });

        this.collapseSearchBox();
    };

    //expand
    this.expandSearchBox = function() {
        $scope.expand = true;
    };

    this.collapseSearchBox = function() {
        $scope.expand = false;
    };

    this.resetButton = function() {
        this.resetSearch();
        this.applySearch();
    };
    this.isRecordInvalid = function(record) {
        for (var i = 0; i < $scope.cols.length; i++) {

            if ($scope.cols[i].editable === "1") {
                switch ($scope.cols[i].dataType) {
                    case "is":
                    case "like":
                        if ($scope.isKeywordValid(record[$scope.cols[i].name]) === false) {
                            return true;
                        }
                        break;
                    case "currency":
                        if ($scope.isCurrencyValid(record[$scope.cols[i].name]) === false) {
                            return true;
                        }
                        break;
                    case "positive":
                        if ($scope.isPosIntValid(record[$scope.cols[i].name]) === false) {
                            return true;
                        }
                        break;
                }
            }
        }
        return false;
    };

    this.showProperValue = function(record, col) {
        switch (col.dataType) {
            case "datapair":
                return record[col.pair.show];
                break;
            case "bool":
                return col.bool[record[col.name]].label;
                break;
            case "currency":
                return $filter('currency')(record[col.name]);
            default:
                return record[col.name];
        }
    };

    //start edit
    this.startEdit = function(record) {
        for (var i in $scope.records) {
            row = $scope.records[i];
            row.editMode = false;
        }
        $scope.addMode = false;
        record.old = [];
        col = [];
        for (var i in $scope.cols) {
            col = $scope.cols[i];
            record.old[col.name] = record[col.name];
        }
        console.log("1");
        record.editMode = true;
    };

    //save edit
    this.saveEdit = function(record) {
        if (!this.isRecordInvalid(record)) {
            var ctrl = this;
            $scope.writewaiting = true;
            $http.post("server/" + $scope.path + "/edit.php", record).success(function(data) {
                if (angular.isDefined(data.error)) {
                    var modalInstance = $modal.open({
                        templateUrl: 'pages/errorHandler.html',
                        controller: 'ModalController',
                        backdrop: 'static',
                        resolve: {
                            arg: function() {
                                return "#/server/log";
                            }
                        }
                    });
                }
                $scope.writewaiting = false;
                record.editMode = false;
                ctrl.applySearch();
            });
        }
    };

    //cancel edit
    this.cancelEdit = function(record) {
        for (var i in $scope.cols) {
            col = $scope.cols[i];
            record[col.name] = record.old[col.name];
        }
        record.editMode = false;
    };

    //delete record
    this.deleteRecord = function(record) {
        var ctrl = this;
        $scope.writewaiting = true;

        //call confirm delete modal
        var modalInstance = $modal.open({
            templateUrl: 'pages/confirmDelete.html',
            controller: 'ModalController',
            backdrop: 'static',
            resolve: {
                arg: function() {
                    return record[$scope.cols[$scope.pageinfo.key].name];
                }
            }
        });
        modalInstance.result.then(function(result) {
            if (result === "delete") {
                $http.post("server/" + $scope.path + "/delete.php", record).success(function(data) {
                    if (angular.isDefined(data.error)) {
                        if (data.error === '2') {
                            var modalInstance = $modal.open({
                                templateUrl: 'pages/fkHandler.html',
                                controller: 'ModalController',
                                backdrop: 'static',
                                resolve: {
                                    arg: function() {
                                        return record[$scope.cols[$scope.pageinfo.key]];
                                    }
                                }
                            });
                        } else {
                            var modalInstance = $modal.open({
                                templateUrl: 'pages/errorHandler.html',
                                controller: 'ModalController',
                                backdrop: 'static',
                                resolve: {
                                    arg: function() {
                                        return "#/server/log";
                                    }
                                }
                            });
                        }
                    }
                    $scope.writewaiting = false;
                    ctrl.applySearch();
                });
            } else {
                $scope.writewaiting = false;
            }
        });
    };

    //start adding new record
    this.startAdd = function() {
        for (var i in $scope.records) {
            row = $scope.records[i];
            row.editMode = false;
        }
        $scope.newRecord = [];
        $scope.addMode = true;
    };


    //save the new record
    this.saveAdd = function() {
        if (!this.isRecordInvalid($scope.newRecord)) {
            var ctrl = this;
            $scope.writewaiting = true;
            $http.post("server/" + $scope.path + "/add.php", $scope.newRecord).success(function(data) {
                if (angular.isDefined(data.error)) {
                    if (data.error === '2') {
                        var modalInstance = $modal.open({
                            templateUrl: 'pages/addHandler.html',
                            controller: 'ModalController',
                            backdrop: 'static',
                            resolve: {
                                arg: function() {
                                    return data.quant;
                                }
                            }
                        });
                    } else {
                        var modalInstance = $modal.open({
                            templateUrl: 'pages/errorHandler.html',
                            controller: 'ModalController',
                            backdrop: 'static',
                            resolve: {
                                arg: function() {
                                    return "#/server/log";
                                }
                            }
                        });
                    }
                }
                $scope.writewaiting = false;
                $scope.addMode = false;
                ctrl.applySearch();
            });
        }
    };

    //cancel adding the new record
    this.cancelAdd = function(record) {
        $scope.addMode = false;
    };
});