FROM nixos/nix:latest AS build

WORKDIR /app
COPY CMakeLists.txt .
COPY src/ src
COPY default.nix .

RUN --mount=type=cache,target=/tmp/nix-store cp -R /tmp/nix-store/nix /nix
RUN nix-build
RUN --mount=type=cache,target=/tmp/nix-store cp -R /nix /tmp/nix-store/nix
RUN mkdir nix-deps
RUN cp -R $(nix-store -qR result/) nix-deps

FROM scratch

WORKDIR /app

COPY --from=build /app/nix-deps /nix/store
COPY --from=build /app/result /app
ENTRYPOINT [ "/app/bin/VCDAuth" ]