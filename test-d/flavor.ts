import {expectTypeOf} from 'nz';
import type {CamelCase, Flavor, GetTagMetadata, IsStringLiteral, Tag, Tagged, UnwrapTagged} from '../index.d.ts';

type Milliseconds = Flavor<number, 'Milliseconds'>;
type Seconds = Flavor<number, 'Seconds'>;

// A plain value satisfies a flavor, so no cast is needed.
const literal: Milliseconds = 1500;
declare const plainNumber: number;
const fromWideType: Milliseconds = plainNumber;
declare const plainNumbers: number[];
const fromArray: Milliseconds[] = plainNumbers;

// The name is the optional form of the same tag that `Tagged` uses, so a flavor is not identical to the underlying type.
expectTypeOf<Milliseconds>().toBe<number & Partial<Tag<'Milliseconds', unknown>>>();
expectTypeOf<Milliseconds>().not.toBe<number>();

// A flavor never hides the underlying type.
expectTypeOf<Milliseconds>().toBeAssignableTo<number>();

// A generic function can return a flavor of its parameter without a cast, where a tagged type needs one.
function createNamed<Value extends string>(value: Value): Flavor<Value, 'Named'> {
	return value;
}

function createTagged<Value extends string>(value: Value): Tagged<Value, 'Named'> {
	// @ts-expect-error A tag has to be applied explicitly.
	return value;
}

expectTypeOf(createNamed('a')).toBe<Flavor<'a', 'Named'>>();

// A flavor works as a generic constraint, and a plain argument keeps its own type.
declare function identity<Value extends Milliseconds>(value: Value): Value;
expectTypeOf(identity(1)).toBe<1>();
expectTypeOf(identity(plainNumber)).toBe<number>();
expectTypeOf(identity(literal)).toBe<Milliseconds>();

// Two differently named flavors cannot be mixed.
// @ts-expect-error
const mixed: Seconds = literal;
declare const seconds: Seconds;
// @ts-expect-error
identity(seconds);
expectTypeOf<Seconds[]>().not.toBeAssignableTo<Milliseconds[]>();

// Swapped arguments are caught once they are held in flavored variables, but swapped literals are not.
declare function retry(delay: Milliseconds, timeout: Seconds): void;
retry(literal, seconds);
// @ts-expect-error
retry(seconds, literal);
retry(30, 1500);

// The same applies to flavored properties.
type RetryOptions = {delay: Milliseconds};
type CacheOptions = {delay: Seconds};
expectTypeOf<{delay: number}>().toBeAssignableTo<RetryOptions>();
expectTypeOf<CacheOptions>().not.toBeAssignableTo<RetryOptions>();

// Arithmetic produces the underlying type. The result loses the name, but a flavor accepts it anyway.
expectTypeOf(literal + 1).toBe<number>();
const fromArithmetic: Milliseconds = literal + 1;

// A `Tagged` value satisfies the same named flavor, whatever its metadata.
type Pattern = Flavor<string, 'Pattern'>;
type TaggedPattern = Tagged<string, 'Pattern'>;
declare const tagged: TaggedPattern;
const fromTagged: Pattern = tagged;
declare const taggedWithMetadata: Tagged<string, 'Pattern', {trimmed: true}>;
const fromTaggedWithMetadata: Pattern = taggedWithMetadata;
declare const taggedWithOtherName: Tagged<string, 'Other'>;
// @ts-expect-error
const fromOtherTagged: Pattern = taggedWithOtherName;

// The flavor is not a tag, so it satisfies neither `Tagged` nor the tag utilities.
declare const flavored: Pattern;
// @ts-expect-error
const asTagged: TaggedPattern = flavored;
// @ts-expect-error
type FlavorMetadata = GetTagMetadata<Pattern, 'Pattern'>;
// @ts-expect-error
type UnwrappedFlavor = UnwrapTagged<Pattern>;

// Combining a flavor with a tag, in either order, makes the flavor name required too, because both share one `tag` property.
type TaggedMilliseconds = Tagged<number, 'Milliseconds'>;
expectTypeOf<TaggedMilliseconds>().not.toBeAssignableTo<Flavor<TaggedMilliseconds, 'Positive'>>();
expectTypeOf<Tagged<number, 'Positive'>>().not.toBeAssignableTo<Tagged<Milliseconds, 'Positive'>>();
expectTypeOf<Tagged<TaggedMilliseconds, 'Positive'>>().toBeAssignableTo<Flavor<TaggedMilliseconds, 'Positive'>>();
expectTypeOf<Tagged<TaggedMilliseconds, 'Positive'>>().toBeAssignableTo<Tagged<Milliseconds, 'Positive'>>();

// Flavors compose, and every name in the chain still applies.
type PositiveMilliseconds = Flavor<Milliseconds, 'Positive'>;
const composed: PositiveMilliseconds = 5;
expectTypeOf(composed).toBeAssignableTo<Milliseconds>();
// @ts-expect-error
const missingPositive: PositiveMilliseconds = literal;

// Applying the same name twice changes nothing.
expectTypeOf<Flavor<Milliseconds, 'Milliseconds'>>().toBe<Milliseconds>();

// A union of names requires all of them, and satisfies each of them.
type TwoNames = Flavor<string, 'First' | 'Second'>;
const twoNames: TwoNames = 'value';
declare const firstOnly: Flavor<string, 'First'>;
// @ts-expect-error
const narrowedToTwoNames: TwoNames = firstOnly;
expectTypeOf<TwoNames>().toBeAssignableTo<Flavor<string, 'First'>>();

// Names can be any property key.
declare const symbolName: unique symbol;
type SymbolNamed = Flavor<string, typeof symbolName>;
const symbolNamed: SymbolNamed = 'value';
expectTypeOf<Tagged<string, typeof symbolName>>().toBeAssignableTo<SymbolNamed>();
expectTypeOf<Flavor<string, 42>>().not.toBeAssignableTo<SymbolNamed>();

// A narrower base with the same name is accepted by the wider one.
expectTypeOf<Flavor<'a', 'Key'>>().toBeAssignableTo<Flavor<'a' | 'b', 'Key'>>();

// Object bases keep their properties and their excess property checks.
type User = Flavor<{id: string; name: string}, 'User'>;
const user: User = {id: '1', name: 'Arthur'};
expectTypeOf(user.id).toBe<string>();
// @ts-expect-error
const withExtraProperty: User = {id: '1', name: 'Arthur', age: 42};

// A discriminated union still narrows through the flavor.
type Shape = Flavor<{kind: 'circle'; radius: number} | {kind: 'square'; side: number}, 'Shape'>;
const circle: Shape = {kind: 'circle', radius: 1};
const square: Shape = {kind: 'square', side: 2};
// @ts-expect-error
const wrongKind: Shape = {kind: 'circle', side: 1};

function scale(shape: Shape): number {
	if (shape.kind === 'circle') {
		expectTypeOf(shape.radius).toBe<number>();
		return shape.radius * 2;
	}

	expectTypeOf(shape.side).toBe<number>();
	return shape.side * 2;
}

// Class instances keep their members.
class Animal {
	name = 'cat';
}

const animal: Flavor<Animal, 'Animal'> = new Animal();
expectTypeOf(animal.name).toBe<string>();

// Other bases work too.
const items: Flavor<string[], 'Items'> = ['a'];
const callback: Flavor<() => number, 'Callback'> = () => 1;
const tuple: Flavor<[number, string], 'Tuple'> = [1, 'a'];
const flag: Flavor<true, 'Flag'> = true;
// @ts-expect-error
const notFlag: Flavor<true, 'Flag'> = false;

// Edge cases.
// The name is required.
// @ts-expect-error
type MissingName = Flavor<string>;
expectTypeOf<Flavor<any, 'Any'>>().toBe<any>();
expectTypeOf<Flavor<never, 'Never'>>().toBe<never>();
// A `never` name accepts every flavor of the base, and a wide `string` name accepts every string named one.
expectTypeOf<Seconds>().toBeAssignableTo<Flavor<number, never>>();
expectTypeOf<Seconds>().toBeAssignableTo<Flavor<number, string>>();
expectTypeOf<Flavor<number, string>>().not.toBeAssignableTo<Seconds>();
// `unknown` leaves only the optional tag, which is a weak type, so a plain value does not satisfy it.
expectTypeOf<Flavor<unknown, 'Unknown'>>().toBe<Partial<Tag<'Unknown', unknown>>>();
// @ts-expect-error
const unknownString: Flavor<unknown, 'Unknown'> = 'value';
expectTypeOf<{id: string}>().not.toBeAssignableTo<Flavor<unknown, 'Unknown'>>();
const unknownObject: Flavor<unknown, 'Unknown'> = {};

// A union base keeps every member.
type Mixed = Flavor<string | number, 'Mixed'>;
expectTypeOf<Mixed>().toBe<Flavor<string, 'Mixed'> | Flavor<number, 'Mixed'>>();
// @ts-expect-error
const mixedBoolean: Mixed = true;

// `null` and `undefined` cannot be flavored.
expectTypeOf<Flavor<null, 'Null'>>().toBe<never>();
expectTypeOf<Flavor<undefined, 'Undefined'>>().toBe<never>();

// A nullable base drops `null`, so the flavor is on the rest.
expectTypeOf<Flavor<string | null, 'NotNull'>>().toBe<Flavor<string, 'NotNull'>>();

// String utilities treat a flavored primitive like the tagged one.
expectTypeOf<CamelCase<Flavor<'foo-bar', 'Name'>>>().toBe<'fooBar'>();
expectTypeOf<CamelCase<Flavor<string, 'Name'>>>().toBe<Flavor<string, 'Name'>>();
expectTypeOf<IsStringLiteral<Flavor<'foo', 'Name'>>>().toBe<true>();
expectTypeOf<IsStringLiteral<Flavor<`on${string}`, 'EventName'>>>().toBe<false>();

// A flavor built on a literal cannot be used as an object key, or to index an object. A wide base type works, and the underlying type always does.
type Letter = Flavor<'a' | 'b', 'Letter'>;
// @ts-expect-error
type LetterValue = Record<Letter, number>['a'];
// @ts-expect-error
type LetterIndex = Record<'a' | 'b', number>[Letter];
declare const letter: Letter;
const underlyingKey: 'a' | 'b' = letter;
const byUnderlyingKey: Record<'a' | 'b', number> = {a: 1, b: 2};
expectTypeOf(byUnderlyingKey[underlyingKey]).toBe<number>();
expectTypeOf<Record<Flavor<string, 'Key'>, number>['anything']>().toBe<number>();
const wideRecord: Record<string, number> = {anything: 1};
declare const wideKey: Flavor<string, 'Wide'>;
expectTypeOf(wideRecord[wideKey]).toBe<number | undefined>();
