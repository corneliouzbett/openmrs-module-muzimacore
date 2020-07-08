'use strict';

function HtmlFormEntryCtrl($scope, $location, HtmlFormEntryService, FormService, _) {

    // initialize the paging structure
    $scope.maxSize = 5;
    $scope.pageSize = 5;
    $scope.currentPage = 1;
    $scope.totalItems = 0;
    $scope.showConvertedForms = true;
    $scope.fetching = false;
    $scope.showColor = '#004f47';

    $scope.init = function () {
        $scope.selectedHtmlFormId = -1;
        $scope.htmlFormEntryModuleStarted = true;
        $scope.htmlForms = [];
        $scope.htmlFormss = [];
        $scope.htmlFormEntryService = HtmlFormEntryService;
        $scope.formService = FormService;
        $scope.fetch();
    };

    $scope.fetch = function () {
        HtmlFormEntryService.moduleState()
            .then(function (result) {
                $scope.htmlFormEntryModuleStarted = result.data;
            }).catch(function (error) {
                showErrorMessage("There was an error connecting the server");
                console.info(error);
            });
        $('#wait').show();
        $scope.fetching = true;
        HtmlFormEntryService.getHtmlForms($scope.search, $scope.currentPage, $scope.pageSize)
            .then(function (response) {
                var serverData = response.data;
                $scope.htmlFormss = serverData.objects;
                $scope.markConvertedForms();
                $scope.totalItems = serverData.objects.length;
                $scope.numOfPages = Math.ceil(serverData.objects.length / $scope.pageSize);

                var begin = (($scope.currentPage - 1) * $scope.pageSize),
                end = begin + $scope.pageSize;
                $scope.htmlForms = $scope.htmlFormss.slice(begin, end);
                $('#wait').hide();
                $scope.fetching = false;
            }).catch(function (error) {
                showErrorMessage("There was an error connecting the server");
                console.info(error);
                $('#wait').hide();
                $scope.fetching = false;
            });

    };

    var showErrorMessage = function (content, cl, time) {
        $('<div/>')
            .addClass('alert')
            .addClass('alert-error')
            .hide()
            .fadeIn('slow')
            .delay(time)
            .appendTo('#error-alert')
            .text(content);
    };

    $scope.hasHtmlForms = function () {
        return !_.isEmpty($scope.htmlForms);
    };

    $scope.searchIsEmpty = function () {
        return $scope.search == undefined || $scope.search == null || $scope.search == '';
    };

    $scope.isValidSelection = function () {
        return $scope.hasHtmlForms && $scope.selectedHtmlFormId != -1;
    };

    $scope.$watch('currentPage', function (newValue, oldValue) {
        $('#wait').show();
        if (newValue != oldValue) {
            HtmlFormEntryService.getHtmlForms($scope.search, $scope.currentPage, $scope.pageSize).
                then(function (response) {
                    var serverData = response.data;
                    $scope.htmlFormss = serverData.objects;
                    $scope.totalItems = serverData.objects.length;
                    $scope.numOfPages = Math.ceil(serverData.objects.length / $scope.pageSize);

                    var begin = (($scope.currentPage - 1) * $scope.pageSize),
                    end = begin + $scope.pageSize;
                    $scope.htmlForms = $scope.htmlFormss.slice(begin, end);
                    $('#wait').hide();
                }).catch(function (error) {
                    showErrorMessage("There was an error connecting the server");
                    console.info(error);
                    $('#wait').hide();
                });
        }
    }, true);

    $scope.$watch('search', function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.currentPage = 1;
            HtmlFormEntryService.getHtmlForms($scope.search, $scope.currentPage, $scope.pageSize).
                then(function (response) {
                    var serverData = response.data;
                    $scope.htmlForms = serverData.objects;
                    $scope.totalItems = serverData.objects.length;
                    $scope.numOfPages = Math.ceil(serverData.objects.length / $scope.pageSize);
                    var begin = (($scope.currentPage - 1) * $scope.pageSize),
                    end = begin + $scope.pageSize;
                    $scope.htmlForms = $scope.htmlFormss.slice(begin, end);
                }).catch(function (error) {
                    showErrorMessage("There was an error connecting the server");
                    console.info(error);
                });
        }
    }, true);

    $scope.getSelectedForm = function () {
        return _.find($scope.htmlForms, function (htmlForm) {
            return htmlForm.id == $scope.selectedHtmlFormId
        });
    }

    $scope.markConvertedForms = function() {
        $scope.formService.all()
        .then(forms => {
            let muzimaForms = forms.data.results;
            let formUUIDs = muzimaForms.map(formObject => formObject.form);
            if (muzimaForms && muzimaForms.length > 0) {
                $scope.htmlForms.forEach( formObject => {
                    if (formUUIDs.includes(formObject.uuid)) {
                        formObject.converted = true;
                    }
                });
            }
        })
        .catch(err => {
            console.log(err);
            return;
        });
    }
}

// controllers for the modal
angular.module('muzimaCoreModule').controller('ModalFormReviewCtrl', function ($uibModal, $log, $document) {
    var $ctrl = this;

    $ctrl.open = function (size, form, htmlFormEntryService, formService) {

        $ctrl.form = form;

        var modalInstance = $uibModal.open({
            animation: false,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'formReviewModalContent.html',
            controller: 'FormReviewModalInstanceCtrl',
            controllerAs: '$ctrl',
            size: size,
            resolve: {
                form: function () {
                    return form;
                },
                htmlFormEntryService: function () {
                    return htmlFormEntryService;
                },
                formService: function () {
                    return formService;
                }
            }
        });

        modalInstance.result.then(function (convertedForm) {
            // get data from instance
            
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
});

angular.module('muzimaCoreModule').controller('FormReviewModalInstanceCtrl', function ($uibModalInstance, form, htmlFormEntryService) {
    var $ctrl = this;
    $ctrl.form = form;
    $ctrl.converting = true;
    $ctrl.convertedForm = {};
    $ctrl.editHTML = false;
    
    htmlFormEntryService.convert($ctrl.form.id)
    .then(function (res) {
        $ctrl.converting = false;
        $ctrl.convertedForm = res.data;
        alertFunc(1, 'Conversion Succeeded');
    }).catch(function (error) {
        $ctrl.converting = false;
        alertFunc(0, 'Conversion Failed');
        console.log(error);
        setTimeout(function () {
             $uibModalInstance.close($ctrl.convertedForm);
        }, 3000)
    });

    // prevent routing while converting
    function routeChange(event, newUrl, oldUrl) {

        let reply = confirm('Do you want to cancel the conversion?');
        if (!reply) {
            event.preventDefault();
        }
        return;
    }

    $ctrl.save = function () {        
        htmlFormEntryService.saveConvertedForm($ctrl.convertedForm.uuid, $ctrl.convertedForm.discriminator, $ctrl.convertedForm.html)
        .then(function (res){
            alertFunc(1, 'Form Saved Successfully');
            $ctrl.form.converted = true;
           
            setTimeout(function () {
                $uibModalInstance.close($ctrl.convertedForm);
            }, 3000)
           
        }).catch(function (error) {
            $ctrl.form.converted = false;
            alertFunc(0, 'Saving converted form Failed');
            $uibModalInstance.dismiss('cancel');
        });
    };

     $ctrl.update = function () {
        if(confirm("Are you sure you want to update the form")) {
            htmlFormEntryService.updateConvertedForm($ctrl.convertedForm.uuid, $ctrl.convertedForm.discriminator, $ctrl.convertedForm.html)
            .then(function (res){
                alertFunc(1, 'Form Updated Successfully');
                $ctrl.form.converted = true;

                setTimeout(function () {
                    $uibModalInstance.close($ctrl.convertedForm);
                }, 3000)

            }).catch(function (error) {
                $ctrl.form.converted = true;
                alertFunc(0, 'Updating converted form Failed');
                $uibModalInstance.dismiss('cancel');
            });
        }else{
            $uibModalInstance.dismiss('cancel');
        }
     };

    $ctrl.cancel = function () {
        let reply = confirm('Do you want to cancel the conversion?');
        if (reply) {
            $uibModalInstance.dismiss('cancel');
        }
    };

    $ctrl.edit = function () {
        alertFunc(1, 'In progress...');
        $ctrl.editHTML = true;
    };

    $ctrl.getBody = function (html) {
        let start = html.indexOf('>', html.indexOf('<body ')) + 1;
        let end = html.indexOf('</body>');
        let res = html.substring(start, end);
        return res;
    }
});

angular.module('muzimaCoreModule').directive('bindUnsafeHtml', ['$compile', function ($compile) {
    return function(scope, element, attrs) {
        scope.$watch(
          function(scope) {
            // watch the 'bindUnsafeHtml' expression for changes
            return scope.$eval(attrs.bindUnsafeHtml);
          },
          function(value) {
            // when the 'bindUnsafeHtml' expression changes
            // assign it into the current DOM
            element.html(value);

            // compile the new DOM and link it to the current
            // scope.
            // NOTE: we only compile .childNodes so that
            // we don't get into infinite loop compiling ourselves
            $compile(element.contents())(scope);
          }
      );
  };
}]);
