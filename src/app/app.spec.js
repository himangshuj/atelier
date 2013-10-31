describe( 'AppCtrl', function() {
    describe( 'isCurrentUrl', function() {
        var AppCtrlDemo, $location, $scope;

        beforeEach( module( 'sokratik.atelier.demo' ) );

        beforeEach( inject( function( $controller, _$location_, $rootScope ) {
            $location = _$location_;
            $scope = $rootScope.$new();
            AppCtrlDemo = $controller( 'AppCtrlDemo', { $location: $location, $scope: $scope });
        }));

        it( 'should pass a dummy test', inject( function() {
            expect( AppCtrlDemo ).toBeTruthy();
        }));
    });
});