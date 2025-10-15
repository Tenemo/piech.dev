type JSONPrimitive = string | number | boolean | null;
type JSONValue = JSONPrimitive | { [key: string]: JSONValue } | JSONValue[];

declare module '*.json' {
    const value: JSONValue;
    export default value;
}
