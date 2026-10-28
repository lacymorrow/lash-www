/*
 * Form default values derived from a zod schema.
 *
 * Ported from https://github.com/colinhacks/zod/discussions/1953#discussioncomment-5695528
 * to zod 4, which removed `AnyZodObject` and `ZodEffects`, replaced
 * `ZodObject.create()` with `z.object()`, and turned `ZodDefault._def.defaultValue`
 * from a getter function into a plain value. A `.transform()` is now a `ZodPipe`
 * whose `_def.in` holds the schema the transform reads from.
 */
import { z } from "zod";

type ObjectOrPipe = z.ZodObject<z.core.$ZodLooseShape> | z.ZodPipe;

/** Walks past any transforms to the object schema underneath, if there is one. */
function toObjectSchema(schema: ObjectOrPipe): z.ZodObject<z.core.$ZodLooseShape> | null {
  if (schema instanceof z.ZodObject) {
    return schema;
  }
  if (schema instanceof z.ZodPipe) {
    return toObjectSchema(schema._def.in as ObjectOrPipe);
  }
  return null;
}

function getDefaultValue(schema: z.ZodType): unknown {
  if (schema instanceof z.ZodDefault) {
    return schema._def.defaultValue;
  }
  // An array field starts empty rather than undefined.
  if (schema instanceof z.ZodArray) {
    return [];
  }
  // A string field starts blank so the input stays controlled.
  if (schema instanceof z.ZodString) {
    return "";
  }
  if (schema instanceof z.ZodObject) {
    return getSchemaDefaults(schema);
  }

  // Optional, nullable and the other wrappers all expose what they wrap here.
  const inner = (schema._def as { innerType?: z.ZodType }).innerType;
  return inner ? getDefaultValue(inner) : undefined;
}

export function getSchemaDefaults<T extends z.ZodType>(schema: ObjectOrPipe): z.infer<T> {
  const object = toObjectSchema(schema);
  if (!object) {
    return {} as z.infer<T>;
  }

  return Object.fromEntries(
    Object.entries(object.shape).map(([key, value]) => [key, getDefaultValue(value as z.ZodType)])
  ) as z.infer<T>;
}
