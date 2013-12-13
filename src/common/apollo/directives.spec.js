describe( 'apollo directive', function() {
    var element, scope,apolloService,compile;

    beforeEach( module( 'sokratik.atelier.apollo.directives' ) );
    beforeEach(inject(function($compile, $rootScope,apollo){
        scope = $rootScope;
        apolloService = apollo;
        compile = $compile;
        element = $compile("<audio src=\"/a.ogg\" sokratik-audio-track/>")(scope);
    }));

    it( 'apollo main Audio test', inject( function() {
        expect( apolloService.getMainAudio().src ).toBe("http://localhost:9018/a.ogg");

    }));
    it('apollo bg Audio Test',inject(function(){
        expect(apolloService.getBGAudio().length).toBe(0);
        compile("<audio src=\"/a.ogg\" sokratik-background-audio-track/>");
        expect(apolloService.getBGAudio().length).toBe(1);
        compile("<audio src=\"/a.ogg\" sokratik-background-audio-track/>");
        expect(apolloService.getBGAudio().length).toBe(2);
    }));
});