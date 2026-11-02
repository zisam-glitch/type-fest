import type {If} from './if.d.ts';
import type {LiteralKeyOf, SimplifyObject} from './internal/index.d.ts';
import type {IsUnknown} from './is-unknown.d.ts';
import type {PartialOnUndefinedDeep} from './partial-on-undefined-deep.d.ts'; // For `@link`

/**
Create a version of another type where all keys accepting `undefined` type are set to optional.

Unlike {@link PartialOnUndefinedDeep}, this utility type only affects top-level properties and does not transform nested objects.

Use-cases:
- Make all properties of a type that can be undefined optional to not have to specify keys with undefined value.

@example
```
import type {PartialOnUndefined} from 'type-fest';

type Settings = {
	optionA: string;
	optionB: number | undefined;
	subOption: {
		subOptionA: boolean;
		subOptionB: boolean | undefined;
	};
};

const testSettings: PartialOnUndefined<Settings> = {
	optionA: 'foo',
	// 👉 optionB is now optional and can be omitted
	subOption: {
		subOptionA: true,
		subOptionB: undefined,
	},
};
```

How it works:
1. Filters keys where `undefined extends ObjectType[KeyType]`, creating a partial object type with optional properties.
2. Combines the newly optional properties with the remaining unaffected keys, keeping index signatures intact.

@see {@link https://github.com/sindresorhus/type-fest/issues/714 Discussion in #714}

@category Object
*/
export type PartialOnUndefined<ObjectType> = ObjectType extends Record<any, any> | undefined
	? {[KeyType in keyof ObjectType as undefined extends ObjectType[KeyType] ? If<IsUnknown<ObjectType[KeyType]>, never, KeyType> : never]?: ObjectType[KeyType]} extends infer PartialType
		? SimplifyObject<{[KeyType in keyof ObjectType as KeyType extends LiteralKeyOf<PartialType> ? never : KeyType]: ObjectType[KeyType]} & PartialType>
		: never
	: ObjectType;

export {};
