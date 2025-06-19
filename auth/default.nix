with import <nixpkgs> {};

stdenv.mkDerivation {
    name = "VCDAuth";
    src = ./.;

    nativeBuildInputs = [ cmake ninja ];
    buildInputs = [ poco ];

    configurePhase = "cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release";
    buildPhase = "cmake --build build --config Release";
    installPhase = "install -D build/VCDAuth $out/bin/VCDAuth";
}