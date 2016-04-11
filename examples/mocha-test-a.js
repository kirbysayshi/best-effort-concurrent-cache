import shared from './mocha-test-shared';

describe('a', () => {
  it('does something slow', done => {
    shared();
    done();
  });
});
