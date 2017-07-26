import { expect } from 'chai';

describe('Dom', () => {
    it('should have window', () => {
        expect(window).to.not.be.undefined;
    });

    it('should have document', () => {
        expect(document).to.not.be.undefined;
    });

    it('should have document.createElement', () => {
        var element = document.createElement('div');
        expect(element.tagName.toLowerCase()).to.equal('div');
    });
});