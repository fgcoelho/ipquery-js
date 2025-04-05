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
	it("should use cache for specific() on second call", async () => {
		await ip.query("1.1.1.1");

		const { duration: fromCache } = await measure(() => ip.query("1.1.1.1"));
		expect(fromCache).toBeLessThan(10);
	});

	it("should only fetch uncached IPs in bulk()", async () => {
		await ip.query("8.8.8.8");

		const { duration, result } = await measure(() =>
			ip.query(["8.8.8.8", "1.0.0.1"]),
		);

		expect(result.length).toBe(2);
		expect(result.find((r) => r.ip === "8.8.8.8")).toBeDefined();
		expect(result.find((r) => r.ip === "1.0.0.1")).toBeDefined();

		expect(duration).toBeLessThan(200);
	});

	it("should be very fast when all bulk IPs are cached", async () => {
		await ip.query(["1.1.1.1", "8.8.8.8"]);

		const { duration } = await measure(() => ip.query(["1.1.1.1", "8.8.8.8"]));

		expect(duration).toBeLessThan(10);
	});
});
