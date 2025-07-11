{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
    buildInputs = [
        pkgs.gcc
        pkgs.cmake
        pkgs.ninja
        pkgs.poco
    ];

    shellHook = ''
        echo "g++: $(g++ --version | head -n1)"
        echo "cmake: $(cmake --version | head -n1)"
    '';
}