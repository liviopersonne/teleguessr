{ pkgs ? import <nixpkgs> {}}:
pkgs.mkShell {
  packages = with pkgs;[
    bun
    vite
    nodejs_24
  ];
}
