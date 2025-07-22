with import <nixpkgs> {};

let
  pocoWithPostgres = pkgs.poco.overrideAttrs (oldAttrs: {
    buildInputs = (oldAttrs.buildInputs or []) ++ [ pkgs.postgresql ];
    cmakeFlags = (oldAttrs.cmakeFlags or []) ++ [
      (pkgs.lib.cmakeBool "POCO_ENABLE_DATA_POSTGRESQL" true)
    ];
  });
in

stdenv.mkDerivation {
    name = "VCDAuth";
    src = ./.;

    nativeBuildInputs = [ cmake ninja ];
    buildInputs = [ pocoWithPostgres postgresql ];

    configurePhase = "cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release";
    buildPhase = "cmake --build build --config Release";
    installPhase = "install -D build/VCDAuth $out/bin/VCDAuth";
}
