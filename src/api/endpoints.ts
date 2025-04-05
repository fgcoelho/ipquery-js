import { data, endpoint } from "src/lib/utils";
import type { IPQueryIPResponse, IPQueryResponseFormat } from "./types";

const globalQuery = data<{
	format: IPQueryResponseFormat;
}>();

export type IPQueryGlobalQuery = typeof globalQuery;

export const IPQueryEndpoints = {
	self: endpoint({
		url: "/",
		method: "get",
		request: {
			query: globalQuery,
		},
		response: data<IPQueryIPResponse>(),
	}),
	specific: endpoint({
		url: "/{ip}",
		method: "get",
		request: {
			query: globalQuery,
		},
		response: data<IPQueryIPResponse>(),
	}),
	bulk: endpoint({
		url: "/{ip_list}",
		method: "get",
		request: {
			query: globalQuery,
		},
		response: data<IPQueryIPResponse[]>(),
	}),
};
