FROM nixos/nix:latest AS build

WORKDIR /build
ADD ./default.nix /build
RUN nix-shell --run exit

ADD ./src/ /build/src
ADD ./CMakeLists.txt /build
RUN nix-build

RUN mkdir /build/nix-deps
RUN cp -R $(nix-store -qR /build/result/) /build/nix-deps

FROM scratch

WORKDIR /app

COPY --from=build /build/nix-deps /nix/store
COPY --from=build /build/result /app

ENTRYPOINT [ "/app/bin/VCDAuth" ]