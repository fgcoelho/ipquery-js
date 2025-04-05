import { describe, expect, it } from "vitest";
import { ip } from "src";

const measure = async <T>(fn: () => Promise<T>) => {
	const start = performance.now();
	const result = await fn();
	const duration = performance.now() - start;
	return { result, duration };
};

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
