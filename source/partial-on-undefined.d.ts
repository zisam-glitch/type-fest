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

@category Object
*/
export type PartialOnUndefined<T> = T extends Record<any, any> | undefined
	? {[KeyType in keyof T as undefined extends T[KeyType] ? If<IsUnknown<T[KeyType]>, never, KeyType> : never]?: T[KeyType]} extends infer U
		? SimplifyObject<{[KeyType in keyof T as KeyType extends LiteralKeyOf<U> ? never : KeyType]: T[KeyType]} & U>
		: never
	: T;

export {};
