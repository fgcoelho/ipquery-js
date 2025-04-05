import type { AnyType } from "src/types";
import type { ExtractedFStringParams } from "./extract-params";

export type Defined<T> = Exclude<T, undefined>;

export type HttpMethod = "get" | "post" | "put" | "delete" | "patch";

export type RequestData = Record<string, AnyType>;

export type IRequest = {
	body?: RequestData;
	query?: RequestData;
	headers?: RequestData;
};

export type IResponse = AnyType;

export const data = <B extends RequestData | string = RequestData | string>() =>
	null as AnyType as B;

export const endpoint = <
	U extends string,
	M extends HttpMethod,
	Req extends IRequest,
	Res extends IResponse,
>(
	e: Endpoint<U, M, Req, Res>,
) => e;

export type Endpoint<
	Url extends string,
	Method extends HttpMethod,
	Req extends IRequest,
	Res extends IResponse = AnyType,
> = {
	url: Url;
	method: Method;
	headers?: RequestData;
	request?: Req;
	response?: Res;
};

export type SettingParams =
	| "waba_id"
	| "number_id"
	| "app_id"
	| "access_token"
	| "version";

export type Params<E extends Endpoint<AnyType, AnyType, AnyType>> = Omit<
	ExtractedFStringParams<E["url"]>,
	SettingParams
>;

export type ExcludeUndefinedEntries<T> = {
	[K in keyof T]: T[K] extends undefined ? never : K;
};

// biome-ignore lint/complexity/noBannedTypes: chill.
type EmptyObject = {};

export type ConsumeData<E extends Endpoint<AnyType, AnyType, AnyType>> =
	E["request"] &
		(Params<E> extends EmptyObject
			? EmptyObject extends Params<E>
				? EmptyObject
				: { params: Params<E> }
			: EmptyObject);
