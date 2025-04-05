import type { AnyType } from "src/types";

export type InputValues<K extends string = string> = Record<K, AnyType>;

type NonAlphanumeric =
	| " "
	| "\t"
	| "\n"
	| "\r"
	| '"'
	| "'"
	| "{"
	| "["
	| "("
	| "`"
	| ":"
	| ";";

type ExtractTemplateParamsRecursive<
	T extends string,
	Result extends string[] = [],
> = T extends `${string}{${infer Param}}${infer Rest}`
	? Param extends `${NonAlphanumeric}${string}`
		? ExtractTemplateParamsRecursive<Rest, Result>
		: ExtractTemplateParamsRecursive<Rest, [...Result, Param]>
	: Result;

export type ParamsFromFString<T extends string> = {
	[Key in
		| ExtractTemplateParamsRecursive<T>[number]
		| (string & Record<never, never>)]: string;
};

export type ExtractedFStringParams<
	T extends string,
	RunInput = symbol,
> = RunInput extends symbol ? ParamsFromFString<T> : RunInput;
