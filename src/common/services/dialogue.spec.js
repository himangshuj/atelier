/**
 * Tests sit right alongside the file they are testing, which is more intuitive
 * and portable than separating `src` and `test` directories. Additionally, the
 * build process will exclude all `.spec.js` files from the build
 * automatically.
 */
describe( 'dialogue section', function() {
    beforeEach( module( 'sokratik.atelier.services.dialogue' ) );

    it( 'dialogue compilation test', inject( function() {
        expect( true ).toBeTruthy();
    }));
});

describe( 'istari section', function() {
    beforeEach( module( 'sokratik.atelier.services.istari' ) );

    it( 'istari compilation test', inject( function() {
        expect( true ).toBeTruthy();
    }));
});

