export const createArrayFromTextFormat = (text: string) => {
	const yamlDivider = "- ip:";
	const xmlDivider = "<IPInfo>";

	if (text.includes(xmlDivider)) {
		const xmlBlocks = text.match(/<IPInfo>[\s\S]*?<\/IPInfo>/g);
		return xmlBlocks?.map((block) => block.trim()) ?? [];
	}

	if (text.includes(yamlDivider)) {
		const rawItems = text.split(yamlDivider).slice(1);
		return rawItems.map((item) => {
			const reconstructed = `ip:${item}`;
			return reconstructed
				.split("\n")
				.map((line) => line.replace(/\s+$/, ""))
				.join("\n")
				.trim();
		});
	}

	const lines = text.split("\n").map((line) => line.trim());
	return lines.filter((line) => line.length > 0);
};
