import { consume } from "src/api/consume";
import { describe, it, expect, afterAll, beforeEach, vi } from "vitest";
import { endpoint } from "src/lib/utils";
import createFetchMock from "vitest-fetch-mock";

const fetchMock = createFetchMock(vi);

fetchMock.enableMocks();

describe("consume function", () => {
	const mockEndpoint = endpoint({
		url: "/test/{id}",
		method: "post",
		headers: { "Content-Type": "application/json" },
	});

	const noSlashMockEndpoint = endpoint({
		url: "test/{id}",
		method: "post",
		headers: { "Content-Type": "application/json" },
	});

	const mockBaseUrl = "http://localhost:3000";

	beforeEach(() => {
		fetchMock.resetMocks();
	});

	afterAll(() => {
		fetchMock.disableMocks();
	});

	it("should make a successful POST request with JSON body", async () => {
		const mockResponse = { success: true, data: "test" };
		fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

		const result = await consume(
			mockEndpoint,
			{
				params: { id: "123" },
				body: { key: "value" },
				headers: { "X-Custom": "test" },
				query: { param: "test" },
			},
			{ baseUrl: mockBaseUrl },
		);

		expect(result).toEqual(mockResponse);
		expect(fetchMock.mock.calls[0][0]).toBe(
			"http://localhost:3000/test/123?param=test",
		);
		expect(fetchMock.mock.calls[0][1]).toMatchObject({
			method: "post",
			headers: {
				"Content-Type": "application/json",
				"X-Custom": "test",
			},
			body: JSON.stringify({ key: "value" }),
		});
	});

	it("should handle FormData body when asFormData is true", async () => {
		const mockResponse = { success: true };
		fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

		const result = await consume(
			mockEndpoint,
			{
				params: { id: "123" },
				body: { file: "test-file", name: "test" },
			},
			{ baseUrl: mockBaseUrl, asFormData: true },
		);

		expect(result).toEqual(mockResponse);
		expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:3000/test/123");
		expect(fetchMock.mock.calls[0][1]?.body instanceof FormData).toBe(true);
	});

	it("should handle URL-encoded body when asUrlEncoded is true", async () => {
		const mockResponse = { success: true };
		fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

		const result = await consume(
			mockEndpoint,
			{
				params: { id: "123" },
				body: { key: "value" },
			},
			{ baseUrl: mockBaseUrl, asUrlEncoded: true },
		);

		expect(result).toEqual(mockResponse);
		const lastCall = fetchMock.mock.calls[0];
		expect(lastCall[1]?.headers).toMatchObject({
			"Content-Type": "application/json",
		});
	});

	it("should throw error when API returns error response", async () => {
		const errorResponse = { error: "Something went wrong" };
		fetchMock.mockResponseOnce(JSON.stringify(errorResponse));

		await expect(
			consume(
				mockEndpoint,
				{ params: { id: "123" } },
				{ baseUrl: mockBaseUrl },
			),
		).rejects.toEqual(errorResponse.error);
	});

	it("should use default baseUrl when not provided", async () => {
		const mockResponse = { success: true };
		fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

		const result = await consume(mockEndpoint, {
			params: { id: "123" },
		});

		expect(result).toEqual(mockResponse);
		expect(fetchMock.mock.calls[0][0]).toBe("https://api.ipquery.io/test/123");
	});

	it("should handle endpoint url without leading slash", async () => {
		const mockResponse = { success: true };
		fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

		const result = await consume(
			noSlashMockEndpoint,
			{ params: { id: "123" } },
			{ baseUrl: mockBaseUrl },
		);

		expect(result).toEqual(mockResponse);
		expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:3000/test/123");
	});
});
