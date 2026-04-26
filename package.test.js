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

  it('lists vite as a devDependency', () => {
    expect(pkg.devDependencies).toHaveProperty('vite');
  });

  it('has a dev script', () => {
    expect(pkg.scripts.dev).toBe('vite');
  });

  it('has a build script', () => {
    expect(pkg.scripts.build).toBe('vite build');
  });

  it('has a preview script', () => {
    expect(pkg.scripts.preview).toBe('vite preview');
  });
});
