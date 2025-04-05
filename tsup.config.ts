import { defineConfig, type Options } from "tsup";

export default defineConfig((opts) => {
	const config: Options = {
		entry: ["./src/index.ts"],
		dts: true,
		shims: true,
		platform: "node",
		removeNodeProtocol: false,
	};

	const release = {
		minify: "terser",
		treeshake: true,
		terserOptions: {
			compress: {
				passes: 3,
			},
		},
	};

	const dev = {
		watch: true,
		sourcemap: true,
		clean: true,
	};

	if (opts.env?.mode === "release") {
		Object.assign(config, release);
	}

	if (opts.env?.mode === "dev") {
		Object.assign(config, dev);
	}

	return config;
});
