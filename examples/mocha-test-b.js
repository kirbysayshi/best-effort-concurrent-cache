import shared from './mocha-test-shared';

describe('b', () => {
  it('does something slow', done => {
    shared();
    done();
  });
});
