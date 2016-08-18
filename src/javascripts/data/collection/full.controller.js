import jsonEdit from '../../common/components/jsonEdit/jsonEdit.directive';
import addAttribute from '../storage/addAttribute/addAttribute.directive';
import collectionApi from '../../common/services/collectionApi.service';
import uiNotification from 'angular-ui-notification';
import prevousState from '../../common/services/previousState.service.js';
import authorizationApi from '../../authentication/authorizationApi.service';
import schemaService from '../../common/services/schema.service';

var ctrlName = 'CollectionFullCtrl';

export default [ctrlName, addAttribute, jsonEdit, collectionApi, uiNotification,
  schemaService];

angular.module('kuzzle.collection')

  .controller(ctrlName, [
    '$scope',
    '$stateParams',
    'collectionApi',
    '$state',
    'schema',
    'previousState',
    '$window',
    'Notification',
    function ($scope, $stateParams, collectionApi, $state, schema, previousState, $window, notification) {

      $scope.isEdit = false;
      $scope.collection = {
        name: $stateParams.collection || $stateParams.newCollection,
        schema: ''
      };

      $scope.init = function () {
        if ($scope.collection.name) {
          $scope.isEdit = true;
          schema.get($scope.collection.name)
            .then(function (response) {
              $scope.collection.schema = angular.toJson(response.mapping, 4);
            })
            .catch(function (error) {

            });
        }
      };

      $scope.update = function (isCreate) {
        var collection = {
          name: $scope.collection.name,
          schema: {}
        };

        if ($scope.collection.schema) {
          try {
            collection.schema = JSON.parse($scope.collection.schema);
          }
          catch (e) {
            notification.error('Error while parsing mapping.');
            return false;
          }
        }

        collectionApi.putMapping(collection)
          .then(function () {
            notification.success(isCreate ? 'Collection created!' : 'Collection updated!');

            $state.go('collection.browse', {index: $stateParams.index});
          })
          .catch(function (error) {
            notification.error({
              delay: 10000,
              message: '<strong>Got an error while ' + (isCreate ? 'creating' : 'updating') + ' collection: </strong><br />' + error.message
            });

            console.error(error);
          });
      };

      $scope.cancel = function () {
        if (!previousState.get()) {
          $state.go('collection.browse', {index: $stateParams.index});
          return false;
        }

        $window.history.back();
      };
    }]);