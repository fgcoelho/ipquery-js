import type { IPQueryInput } from "../types";

const validateIPV4 = (ip: string) => {
	const regex =
		/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

	return regex.test(ip);
};

const validateIPV6 = (ip: string) => {
	const regex =
		/^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:/;

	return regex.test(ip);
};

const validateIP = (ip: string) => {
	if (validateIPV4(ip)) {
		return true;
	}

	if (validateIPV6(ip)) {
		return true;
	}

	return false;
};

export const validateIPQueryInput = (input: IPQueryInput) => {
	if (input === "self") {
		return;
	}

	if (Array.isArray(input)) {
		if (input.length > 10_000) {
			throw new Error(
				"IP list can't exceed 10,000 IPs, check https://ipquery.gitbook.io/ipquery-docs#bulk-query-a-list-of-ip-addresss",
			);
		}

		for (const [index, ip] of input.entries()) {
			if (!validateIP(ip)) {
				process.stdout.write(JSON.stringify(input, null, 2) + "\n");

				throw new Error(`Invalid IP addres '${ip}' at index '${index}'`);
			}
		}

		return;
	}

	if (!validateIP(input)) {
		throw new Error(`Invalid IP address: ${input}`);
	}
};
