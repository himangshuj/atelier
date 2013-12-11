/**
 * Tests sit right alongside the file they are testing, which is more intuitive
 * and portable than separating `src` and `test` directories. Additionally, the
 * build process will exclude all `.spec.js` files from the build
 * automatically.
 */
describe( 'edit section', function() {
    function $get(what) {
        return jasmine.getEnv().currentSpec.$injector.get(what);
    }

    function initStateTo(state, optionalParams) {
        var $state = $get('$state'),
            $q = $get('$q');
        $state.transitionTo(state, optionalParams || {});
        $q.flush();
        expect($state.current).toBe(state);
    }

    beforeEach( module( 'sokratik.atelier.edit' ) );
    var $compile;
    var $rootScope;
    beforeEach(inject(function(_$compile_, _$rootScope_,_$state_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        _$state_.go("edit.template");
    }));



    it( 'testing test', inject( function($state) {
        expect( true ).toBeTruthy();
    }));
});

