import {expectTypeOf} from 'nz';
import type {PartialOnUndefined} from '../index.d.ts';

type TestingType = {
	requiredString: string;
	optionalValue: number | undefined;
	nested: {
		nestedRequired: string;
		nestedOptional: boolean | undefined;
	};
	array: Array<string | undefined>;
};

declare const foo: PartialOnUndefined<TestingType>;

// Top-level property accepting undefined becomes optional
expectTypeOf(foo).toBeAssignableTo<{
	requiredString: string;
	optionalValue?: number | undefined;
	nested: {
		nestedRequired: string;
		nestedOptional: boolean | undefined;
	};
	array: Array<string | undefined>;
}>();

// Confirm shallow behavior: nestedOptional remains required in the nested object
expectTypeOf(foo.nested).toBe<{
	nestedRequired: string;
	nestedOptional: boolean | undefined;
}>();

// Index signatures
declare const indexType: {[k: string]: string | undefined; propertyA: string; propertyB: string | undefined};
declare const indexResult: PartialOnUndefined<typeof indexType>;
expectTypeOf(indexResult).toBe<{[k: string]: string | undefined; propertyA: string; propertyB?: string | undefined}>();

// Primitives and non-objects pass through
expectTypeOf<PartialOnUndefined<string>>().toBe<string>();
expectTypeOf<PartialOnUndefined<number>>().toBe<number>();
expectTypeOf<PartialOnUndefined<undefined>>().toBe<undefined>();
