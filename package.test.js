const pkg = require('./package.json');

describe('package.json infrastructure', () => {
  it('has a lint script', () => {
    expect(pkg.scripts.lint).toBe('eslint .');
  });

  it('lists jquery as a devDependency', () => {
    expect(pkg.devDependencies).toHaveProperty('jquery');
  });

  it('lists bootstrap as a devDependency', () => {
    expect(pkg.devDependencies).toHaveProperty('bootstrap');
  });

  it('lists eslint as a devDependency', () => {
    expect(pkg.devDependencies).toHaveProperty('eslint');
  });
});
