import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";

const measure = async <T>(fn: () => Promise<T>) => {
	const start = performance.now();
	const result = await fn();
	const duration = performance.now() - start;
	return { result, duration };
};

let ip: typeof import("src").ip;

beforeEach(async () => {
	vi.resetModules();
	({ ip } = await import("src"));
});

describe("IPQuery API Integration", () => {
	it("should return a valid response from self()", async () => {
		const res = await ip.query("self");
		expect(res).toBeDefined();
		expect(typeof res).toBe("object");
		expect(res).toHaveProperty("ip");
	});

	it("should return info for a specific IP", async () => {
		const res = await ip.query("1.1.1.1");
		expect(res).toBeDefined();
		expect(res).toHaveProperty("ip", "1.1.1.1");
	});

	it("should return info for a list of IPs", async () => {
		const res = await ip.query(["8.8.8.8", "1.1.1.1"]);
		expect(res).toBeDefined();
		expect(Array.isArray(res)).toBe(true);
		expect(res.length).toBe(2);
		expect(res[0]).toHaveProperty("ip");
	});

	it("should return text for custom format", async () => {
		const res = await ip.query("9.9.9.9");

		expect(res).toBeDefined();
	});

	it("should return text array for custom format in bulk", async () => {
		const res = await ip.query(["8.8.8.8", "1.1.1.1"], {
			format: "yaml",
		});

		expect(res).toBeDefined();
		expect(res.length).toBe(2);
		expect(Array.isArray(res)).toBe(true);
		expectTypeOf(res[0]).toBeString;
	});
});

describe("IPQuery API Validation", () => {
	it("should throw error when bulk IPs exceed 10,000", async () => {
		const ipList = Array.from({ length: 10_001 }, (_, i) => `1.1.1.${i}`);

		await expect(ip.query(ipList)).rejects.toThrow(
			"IP list can't exceed 10,000 IPs, check https://ipquery.gitbook.io/ipquery-docs#bulk-query-a-list-of-ip-addresss",
		);
	});

	it("should throw error for invalid IP address", async () => {
		await expect(ip.query("invalid-ip")).rejects.toThrow(
			"Invalid IP address: invalid-ip",
		);
	});
});

describe("IPQuery API Caching", () => {
	it("shouldn't call fetch for single query on second call", async () => {
		const fetchSpy = vi.spyOn(global, "fetch");

		await ip.query("1.1.1.1");

		fetchSpy.mockClear();

		const res = await ip.query("1.1.1.1");

		expect(res).toHaveProperty("ip");
		expect(fetchSpy).toHaveBeenCalledTimes(0);

		fetchSpy.mockRestore();
	});

	it("should only fetch uncached IPs in bulk()", async () => {
		const fetchSpy = vi.spyOn(global, "fetch");

		await ip.query("8.8.8.8");

		fetchSpy.mockClear();

		const res = await ip.query(["8.8.8.8", "1.1.1.1"]);

		expect(res.length).toBe(2);
		expect(fetchSpy).toHaveBeenCalledTimes(1);

		const urlCalled = fetchSpy.mock.calls[0][0];
		expect(urlCalled).toMatch(/1\.1\.1\.1/);

		fetchSpy.mockRestore();
	});

	it("shouldn't call fetch bulk query for second call", async () => {
		const fetchSpy = vi.spyOn(global, "fetch");

		await ip.query(["8.8.8.8", "1.1.1.1"]);

		fetchSpy.mockClear();

		const res = await ip.query(["8.8.8.8", "1.1.1.1"]);

		expect(res.length).toBe(2);
		expect(fetchSpy).toHaveBeenCalledTimes(0);

		fetchSpy.mockRestore();
	});

	it("should fetch once for second single query call when cache is disabled", async () => {
		const fetchSpy = vi.spyOn(global, "fetch");

		ip.config({
			cache: {
				disable: true,
			},
		});

		await ip.query("1.1.1.1");

		fetchSpy.mockClear();

		const res = await ip.query("1.1.1.1");

		expect(res).toHaveProperty("ip");
		expect(fetchSpy).toHaveBeenCalledTimes(1);

		fetchSpy.mockRestore();
	});
});
