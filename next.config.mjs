class EnsureNextFontManifestPlugin {
  constructor(webpack, isServer) {
    this.webpack = webpack;
    this.isServer = isServer;
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap("EnsureNextFontManifestPlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: "EnsureNextFontManifestPlugin",
          stage: this.webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE
        },
        (assets) => {
          const manifest = JSON.stringify({
            pages: {},
            app: {},
            appUsingSizeAdjust: false,
            pagesUsingSizeAdjust: false
          });
          const manifestJsonPath = this.isServer ? "next-font-manifest.json" : "server/next-font-manifest.json";
          const manifestJsPath = this.isServer ? "next-font-manifest.js" : "server/next-font-manifest.js";
          const middlewareManifest = JSON.stringify({
            version: 3,
            middleware: {},
            functions: {},
            sortedMiddleware: []
          });

          if (!assets[manifestJsonPath]) {
            assets[manifestJsonPath] = new this.webpack.sources.RawSource(manifest);
          }

          if (!assets[manifestJsPath]) {
            assets[manifestJsPath] = new this.webpack.sources.RawSource(
              `self.__NEXT_FONT_MANIFEST=${JSON.stringify(manifest)}`
            );
          }

          if (this.isServer && !assets["middleware-manifest.json"]) {
            assets["middleware-manifest.json"] = new this.webpack.sources.RawSource(middlewareManifest);
          }
        }
      );
    });
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracing: false,
  experimental: {
    cpus: 1
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
        ]
      }
    ];
  },
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      config.optimization.splitChunks = false;
    }

    config.plugins.push(new EnsureNextFontManifestPlugin(webpack, isServer));

    return config;
  }
};

export default nextConfig;
