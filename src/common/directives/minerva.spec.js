/**
 * Tests sit right alongside the file they are testing, which is more intuitive
 * and portable than separating `src` and `test` directories. Additionally, the
 * build process will exclude all `.spec.js` files from the build
 * automatically.
 */
describe( 'minerva section', function() {
    beforeEach( module( 'sokratik.kamillion.directives.minerva' ) );

    it( 'minerva compilation test', inject( function() {
        expect( true ).toBeTruthy();
    }));
});

