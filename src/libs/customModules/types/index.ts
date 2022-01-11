export type ObjectType = { [x: string]: any };

export type FunctionType<T> = (() => T) | T;

export const ObjectMerge = (target: ObjectType, source: ObjectType): ObjectType => {
	const isObject = (value: any) => {
		return value && value instanceof Object && !(value instanceof Array);
	}

	return JSON.parse(JSON.stringify({ ...target, ...source }), (key, value) => {
		if (isObject(target[key]) && isObject(value)) return ObjectMerge(target[key], value);

		return value;
	})
}