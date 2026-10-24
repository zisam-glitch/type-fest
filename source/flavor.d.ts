import type {Tag, Tagged} from './tagged.d.ts';

/**
Attach a name to a type without requiring a cast, so that differently named types cannot be mixed.

`Flavor` is the permissive counterpart of {@link Tagged}. A value of the underlying type, such as a literal, a parsed value, or a value from another library, is accepted without an `as` cast. A value with a different flavor is rejected, which catches the swapped arguments that a structural type system would otherwise accept.

A flavor proves nothing about a value, because any value of the underlying type satisfies it. Use {@link Tagged} instead when the type must prove that a value passed a check, such as a validated email address. A `Tagged` value satisfies the same named `Flavor`, never the reverse.

Use-cases:
- Stop mix-ups between values that share a primitive type, such as ids, units (`Milliseconds` vs `Seconds`), or coordinates.
- Give a primitive a name, so editors show `SemverRange` instead of `string`.

@example
```
import type {Flavor} from 'type-fest';

type Milliseconds = Flavor<number, 'Milliseconds'>;
type Seconds = Flavor<number, 'Seconds'>;

declare function formatDuration(duration: Milliseconds): string;

// A plain number is accepted, so no cast is needed.
formatDuration(1500);

const delay: Seconds = 2;

// But a differently named flavor is rejected.
// @ts-expect-error
formatDuration(delay);
```

@example
```
import type {Flavor, Tagged} from 'type-fest';

type Pattern = Flavor<string, 'Pattern'>;
type ValidPattern = Tagged<string, 'Pattern'>;

declare function compile(pattern: ValidPattern): void;

// No `as Pattern` needed.
const pattern: Pattern = '{bar,baz}';

// A flavor is not proof that the value was checked.
// @ts-expect-error
compile(pattern);

// A tagged value satisfies the flavor.
declare const validPattern: ValidPattern;
const accepted: Pattern = validPattern;
```

How it works: the name is stored in the same tag property as `Tagged`, but the property is optional, so a plain value may omit it. Two different names give that property conflicting types.

Note:
- A literal satisfies every flavor of its type, so swapping two literal arguments is not caught. Only flavored values are checked.
- Like `Tagged`, a flavor of a literal type cannot be used as an object key or to index an object. Use the underlying type there.
- Combining `Flavor` and `Tagged` on one type, in either order, makes the flavor name required too, so the result needs a cast like `Tagged`.
- `null` and `undefined` cannot be flavored, so `Flavor<string | null, 'A'>` is `Flavor<string, 'A'>`. Write `Flavor<string, 'A'> | null` instead.
- `GetTagMetadata` and `UnwrapTagged` do not accept a flavor.

@category Type
*/
export type Flavor<Type, TagName extends PropertyKey> = Type & Partial<Tag<TagName, unknown>>;

export {};
