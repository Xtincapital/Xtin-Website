const trimStrings = <T extends Record<string, unknown>>(obj: T): T => {
	const newObj = {} as T;
	for (const key in obj) {
		if (typeof obj[key] === "string") {
			newObj[key] = (obj[key] as string).trim() as T[typeof key];
		} else {
			newObj[key] = obj[key];
		}
	}
	return newObj;
};

export {trimStrings};
