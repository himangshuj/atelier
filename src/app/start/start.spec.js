/**
 * Tests sit right alongside the file they are testing, which is more intuitive
 * and portable than separating `src` and `test` directories. Additionally, the
 * build process will exclude all `.spec.js` files from the build
 * automatically.
 */
describe( 'start section', function() {
    beforeEach( module( 'sokratik.kamillion.start' ) );

    it( 'should have a dummy test', inject( function() {
        expect( true ).toBeTruthy();
    }));
});
