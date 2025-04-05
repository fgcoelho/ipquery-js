import { data, endpoint } from "src/lib/utils";
import type {
	IPQueryBulkResponse,
	IPQueryResponse,
	IPQueryResponseFormat,
} from "./types";

const globalQuery = data<{
	format: IPQueryResponseFormat;
}>();

export const IPQueryEndpoints = {
	self: endpoint({
		url: "/",
		method: "get",
		request: {
			query: globalQuery,
		},
		response: data<IPQueryResponse>(),
	}),
	specific: endpoint({
		url: "/{ip}",
		method: "get",
		request: {
			query: globalQuery,
		},
		response: data<IPQueryResponse>(),
	}),
	bulk: endpoint({
		url: "/{ip_list}",
		method: "get",
		request: {
			query: globalQuery,
		},
		response: data<IPQueryBulkResponse>(),
	}),
};
