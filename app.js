(function() {
    'use strict';

    angular.module('app', [])
        .provider('flickr', flickrProvider)
        .directive('flickrBackground', flickrBackground)
        .config(setFlickrAPI);

    function setFlickrAPI(flickrProvider) {
        flickrProvider.config({key: 'b804a5895fcf7bc43de91546546e71e0'});
    }

    function flickrProvider() {
        var API_key;
        var link = 'https://api.flickr.com/services/rest/';

        this.config = function(params) {
            API_key = params.key;
        }

        this.$get = function($http, $q) {
            return {
                call: call
            }

            function call(params) {
                params = angular.extend({}, params, {
                    api_key: API_key,
                    format: 'json',
                    nojsoncallback: 1
                });
                var opt = {
                    url: link,
                    params: params
                }

                return $http(opt)
                    .then(function(res) {
                        var data = res.data;
                        if (data.stat !== 'ok') {
                            var error = new Error('API call failed');
                            error.detail = data;
                            return $q.reject(error);
                        }
                        return data;
                    }, function(error) {
                        console.error(error);
                    });
            }
        }
    }

    flickrBackground.$inject = ['flickr'];
    function flickrBackground(flickr) {
        
        var directive = {
            link: link,
            restrict: 'A'
        };

        return directive;
        
        function link(scope, element, attrs) {
            element[0].style.backgroundSize = 'cover';
            element[0].style.backgroundRepeat = 'no-repeat';

            var photos;

            fetch();

            setInterval(function() {
                fetch();
            }, 3000);

            attrs.$observe('flickrBackground', function(tags) {
                photos = null;
                fetch(tags);
            });

            function fetch(tags) {
                if (photos && photos.length) {
                    chooseRandomPhoto();
                    return false;
                }

                tags = tags || 'natural, landscape, green';
                flickr.call({
                    method: 'flickr.photos.search',
                    tags: tags,
                    sort: 'interestingness-desc',
                    per_page: 30,
                    group_id: '17274427@N00',
                    extras: 'url_l, url_o'
                }).then(function(res) {
                    photos = res.photos.photo.filter(function(item) {
                        return item.url_l;
                    });
                    chooseRandomPhoto();
                })
            }

            function chooseRandomPhoto() {
                var id = Math.floor(Math.random() * photos.length);
                var randomPhoto = photos[id];
                var photoUrl = randomPhoto.url_o || randomPhoto.url_l;
                element[0].style.backgroundImage = 'url(photoUrl)'.replace('photoUrl', photoUrl);
            }
        }
    }
    
})();